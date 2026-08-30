from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client
from app.schemas.compliance import (
    ComplianceRuleResponse,
    ComplianceAnalysisResponse,
)
from app.services.compliance import fetch_rules, match_declarations_to_rules

router = APIRouter(prefix="/api/compliance-rules", tags=["compliance-rules"])


@router.get("", response_model=list[ComplianceRuleResponse])
async def list_compliance_rules(
    product_category: Optional[str] = Query(
        None, description="Filter by product category"
    ),
    declaration_type: Optional[str] = Query(
        None, description="Filter by declaration type"
    ),
    current_user: dict = Depends(get_current_user),
):
    """List compliance rules. Supports filtering by product_category and declaration_type."""
    if product_category is not None:
        product_category = product_category.strip()
        if not product_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="product_category cannot be empty.",
            )
        if len(product_category) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="product_category must be at most 100 characters.",
            )

    if declaration_type is not None:
        declaration_type = declaration_type.strip()
        if not declaration_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="declaration_type cannot be empty.",
            )
        if len(declaration_type) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="declaration_type must be at most 100 characters.",
            )

    return fetch_rules(product_category=product_category, declaration_type=declaration_type)


@router.get("/{rule_id}", response_model=ComplianceRuleResponse)
async def get_compliance_rule(
    rule_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single compliance rule by ID."""
    client = get_supabase_client()

    try:
        result = (
            client.table("compliance_rules")
            .select("*")
            .eq("rule_id", rule_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Compliance rule not found.",
            )
        row = result.data
        return ComplianceRuleResponse(
            rule_id=row["rule_id"],
            rule_reference=row["rule_reference"],
            product_category=row["product_category"],
            declaration_type=row["declaration_type"],
            validation_condition=row["validation_condition"],
            violation_type=row["violation_type"],
            severity=row["severity"],
            evidence_requirement=row.get("evidence_requirement"),
            effective_date=str(row["effective_date"]),
            created_at=str(row["created_at"]),
            updated_at=str(row["updated_at"]),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch compliance rule: {str(exc)}",
        )


@router.get(
    "/analysis/{inspection_id}",
    response_model=ComplianceAnalysisResponse,
)
async def get_compliance_analysis(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Match an inspection's declarations against applicable compliance rules.

    Returns declaration/rule pairs. Does NOT determine compliance status.
    """
    client = get_supabase_client()
    user_id = current_user["user_id"]

    # Verify inspection ownership
    try:
        inspection_result = (
            client.table("inspections")
            .select("*")
            .eq("inspection_id", inspection_id)
            .eq("inspector_id", user_id)
            .single()
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection not found or access denied.",
        )

    inspection = inspection_result.data
    product_category = ""

    # Resolve product category from the inspection's product
    if inspection.get("product_id"):
        try:
            product_result = (
                client.table("products")
                .select("category")
                .eq("product_id", inspection["product_id"])
                .single()
                .execute()
            )
            if product_result.data:
                product_category = product_result.data.get("category", "")
        except Exception:
            pass

    # Fetch declarations
    try:
        decl_result = (
            client.table("declarations")
            .select("declarations_json")
            .eq("inspection_id", inspection_id)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve declarations.",
        )

    # Flatten all declarations across images
    all_declarations: list[dict] = []
    for row in (decl_result.data or []):
        all_declarations.extend(row.get("declarations_json") or [])

    # Fetch applicable rules for this product category
    rules = fetch_rules(product_category=product_category) if product_category else []

    # Match declarations to rules
    matched = match_declarations_to_rules(all_declarations, rules)

    # Build appropriate message
    message = None
    if not product_category:
        message = "No product category found. Rules cannot be matched without a product category."
    elif not rules:
        message = (
            f"No compliance rules found for product category '{product_category}'. "
            "Rule data must be supplied before compliance analysis can produce legal conclusions."
        )
    elif not all_declarations:
        message = "No declarations extracted yet. Run OCR and declaration extraction first."
    elif not matched:
        message = (
            "No rules matched the extracted declarations. "
            "This may indicate rules are missing for the declaration types found."
        )

    return ComplianceAnalysisResponse(
        inspection_id=inspection_id,
        product_category=product_category,
        matched_rules=matched,
        total_rules_loaded=len(rules),
        total_declarations=len(all_declarations),
        message=message,
    )
