from pydantic import BaseModel
from typing import Optional


class ComplianceRuleResponse(BaseModel):
    rule_id: str
    rule_reference: str
    product_category: str
    declaration_type: str
    validation_condition: str
    violation_type: str
    severity: str
    evidence_requirement: Optional[str] = None
    effective_date: str
    created_at: str
    updated_at: str


class RuleMatch(BaseModel):
    rule: ComplianceRuleResponse
    declaration_type: str
    extracted_value: str
    declaration_confidence: float


class ComplianceAnalysisResponse(BaseModel):
    inspection_id: str
    product_category: str
    matched_rules: list[RuleMatch]
    total_rules_loaded: int
    total_declarations: int
    message: Optional[str] = None
