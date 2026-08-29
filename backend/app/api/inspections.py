from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from typing import Optional
import logging
from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/inspections", tags=["inspections"])


class InspectionCreateRequest(BaseModel):
    product_id: str

    @field_validator("product_id")
    @classmethod
    def validate_product_id(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 1:
            raise ValueError("product_id cannot be empty.")
        return v


class InspectionResponse(BaseModel):
    inspection_id: str
    product_id: str
    inspector_id: str
    inspection_date: str
    compliance_status: str
    compliance_score: Optional[float] = None
    created_at: str
    updated_at: str
    product_name: Optional[str] = None
    category: Optional[str] = None


def _row_to_response(row: dict, product_name: str = None, category: str = None) -> InspectionResponse:
    return InspectionResponse(
        inspection_id=row["inspection_id"],
        product_id=row["product_id"],
        inspector_id=row["inspector_id"],
        inspection_date=str(row["inspection_date"]),
        compliance_status=row["compliance_status"],
        compliance_score=row.get("compliance_score"),
        created_at=str(row["created_at"]),
        updated_at=str(row["updated_at"]),
        product_name=product_name,
        category=category,
    )


@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
async def create_inspection(
    body: InspectionCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new inspection. Requires authentication. Validates product exists."""
    client = get_supabase_client()
    user_id = current_user["user_id"]

    logger.info(f"Creating inspection: user_id={user_id}, product_id={body.product_id}")

    # Ensure inspector has a profile row (FK requirement)
    try:
        profile_check = (
            client.table("profiles")
            .select("id")
            .eq("id", user_id)
            .execute()
        )
        if not profile_check.data:
            logger.warning(f"No profile found for user {user_id}, creating one")
            client.table("profiles").insert({
                "id": user_id,
                "name": current_user.get("name", ""),
                "role": "inspector",
            }).execute()
    except Exception as exc:
        logger.error(f"Profile check/create failed: {exc}")

    # Validate product exists
    try:
        product_result = (
            client.table("products")
            .select("*")
            .eq("product_id", body.product_id)
            .single()
            .execute()
        )
        if not product_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Product validation failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    product = product_result.data

    # Create inspection
    try:
        result = (
            client.table("inspections")
            .insert({
                "product_id": body.product_id,
                "inspector_id": user_id,
            })
            .execute()
        )
        logger.info(f"Inspection insert result: {result.data}")
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create inspection.",
            )
        return _row_to_response(
            result.data[0],
            product_name=product.get("product_name"),
            category=product.get("category"),
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Inspection insert failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create inspection: {str(exc)}",
        )


@router.get("", response_model=list[InspectionResponse])
async def list_inspections(
    current_user: dict = Depends(get_current_user),
):
    """List inspections for the authenticated user."""
    client = get_supabase_client()
    user_id = current_user["user_id"]

    try:
        result = (
            client.table("inspections")
            .select("*")
            .eq("inspector_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        if not result.data:
            return []

        # Fetch product names for each inspection
        responses = []
        for row in result.data:
            product_name = None
            category = None
            try:
                product_result = (
                    client.table("products")
                    .select("product_name, category")
                    .eq("product_id", row["product_id"])
                    .single()
                    .execute()
                )
                if product_result.data:
                    product_name = product_result.data.get("product_name")
                    category = product_result.data.get("category")
            except Exception:
                pass
            responses.append(_row_to_response(row, product_name=product_name, category=category))

        return responses
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list inspections: {str(exc)}",
        )


@router.get("/{inspection_id}", response_model=InspectionResponse)
async def get_inspection(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single inspection by ID. Enforces authorization."""
    client = get_supabase_client()
    user_id = current_user["user_id"]

    try:
        result = (
            client.table("inspections")
            .select("*")
            .eq("inspection_id", inspection_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Inspection not found.",
            )

        # Enforce authorization: only the inspector can view their own inspection
        if result.data["inspector_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this inspection.",
            )

        # Fetch product info
        product_name = None
        category = None
        try:
            product_result = (
                client.table("products")
                .select("product_name, category")
                .eq("product_id", result.data["product_id"])
                .single()
                .execute()
            )
            if product_result.data:
                product_name = product_result.data.get("product_name")
                category = product_result.data.get("category")
        except Exception:
            pass

        return _row_to_response(result.data, product_name=product_name, category=category)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch inspection: {str(exc)}",
        )
