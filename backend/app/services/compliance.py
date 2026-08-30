from typing import Optional
from app.core.supabase import get_supabase_client
from app.schemas.compliance import ComplianceRuleResponse, RuleMatch


def fetch_rules(
    product_category: Optional[str] = None,
    declaration_type: Optional[str] = None,
) -> list[ComplianceRuleResponse]:
    """Fetch compliance rules from the compliance_rules table.

    Rules tagged 'All Packaged Commodities' are returned for every category.
    """
    client = get_supabase_client()

    query = client.table("compliance_rules").select("*")

    if product_category:
        query = query.or_(
            f"product_category.eq.{product_category},product_category.eq.All Packaged Commodities"
        )
    if declaration_type:
        query = query.eq("declaration_type", declaration_type)

    query = query.order("created_at", desc=False)
    result = query.execute()

    return [
        ComplianceRuleResponse(
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
        for row in (result.data or [])
    ]


def match_declarations_to_rules(
    declarations: list[dict],
    rules: list[ComplianceRuleResponse],
) -> list[RuleMatch]:
    """Match extracted declarations against applicable rules by declaration_type.

    Uses two-pass matching:
    1. Exact (case-insensitive) match first
    2. Containment match only if no exact match found for that declaration
    """
    matched: list[RuleMatch] = []

    for decl in declarations:
        decl_type = decl.get("declaration_type", "").strip().lower()
        if not decl_type:
            continue

        # First pass: exact match
        exact = []
        for rule in rules:
            rule_type = rule.declaration_type.strip().lower()
            if decl_type == rule_type:
                exact.append(rule)

        if exact:
            for rule in exact:
                matched.append(
                    RuleMatch(
                        rule=rule,
                        declaration_type=decl.get("declaration_type", ""),
                        extracted_value=decl.get("extracted_value", ""),
                        declaration_confidence=decl.get("confidence", 0.0),
                    )
                )
        else:
            # Second pass: containment (e.g. "manufacturer" in "manufacturer name")
            for rule in rules:
                rule_type = rule.declaration_type.strip().lower()
                if decl_type in rule_type or rule_type in decl_type:
                    matched.append(
                        RuleMatch(
                            rule=rule,
                            declaration_type=decl.get("declaration_type", ""),
                            extracted_value=decl.get("extracted_value", ""),
                            declaration_confidence=decl.get("confidence", 0.0),
                        )
                    )

    return matched
