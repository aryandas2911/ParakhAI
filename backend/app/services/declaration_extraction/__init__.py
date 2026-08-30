"""
Declaration extraction service for Legal Metrology compliance.

Extracts structured declaration fields from OCR text using deterministic
pattern matching (regex). Falls back to LLM extraction when configured
and deterministic extraction is insufficient.

Extraction targets (declarations only - no compliance decisions):
- Product name
- MRP (Maximum Retail Price)
- Net quantity
- Manufacturer / Packer / Importer details
- Date / month of manufacture, packing or import
- Consumer care details (name, address, phone, email, website)
"""
import re
import logging
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class ExtractedDeclaration:
    declaration_type: str
    extracted_value: str
    confidence: float  # 0.0 to 1.0


@dataclass
class ExtractionResult:
    declarations: list[ExtractedDeclaration] = field(default_factory=list)
    method: str = "deterministic"  # "deterministic", "llm", "hybrid"


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _normalise_whitespace(text: str) -> str:
    """Collapse internal whitespace and strip."""
    return re.sub(r"\s+", " ", text).strip()


def _strip_labels(text: str, labels: list[str]) -> str:
    """Remove leading label keywords from extracted text."""
    for label in labels:
        pattern = re.compile(rf"^{re.escape(label)}\s*[:\-]?\s*", re.IGNORECASE)
        text = pattern.sub("", text)
    return text.strip()


def _confidence_from_match(match: re.Match, full_line: str) -> float:
    """Estimate confidence based on how well the match covers the line."""
    if not match:
        return 0.0
    match_len = match.end() - match.start()
    line_len = len(full_line.strip())
    if line_len == 0:
        return 0.5
    coverage = match_len / line_len
    # Higher coverage → higher confidence (capped at 0.99)
    return min(0.5 + coverage * 0.45, 0.99)


# ---------------------------------------------------------------------------
# Deterministic extractors
# ---------------------------------------------------------------------------

def _extract_product_name(full_text: str, blocks: list[dict]) -> Optional[ExtractedDeclaration]:
    """
    Extract product name from OCR text.

    Strategy:
    1. Look for explicit "Product Name" label
    2. Look for "Name" label near product-related keywords
    3. Fall back to the first substantial text block (usually the product name)
    """
    lines = full_text.split("\n")

    # Strategy 1: Explicit label patterns
    label_patterns = [
        r"(?:product\s*name|name\s*of\s*product)\s*[:\-]\s*(.+)",
        r"(?:product|commodity)\s*[:\-]\s*(.+)",
        r"(?:item\s*name)\s*[:\-]\s*(.+)",
    ]
    for pattern in label_patterns:
        for line in lines:
            m = re.search(pattern, line, re.IGNORECASE)
            if m:
                value = _normalise_whitespace(m.group(1))
                # Remove trailing labels that might be captured
                value = re.split(r"\s*(?:net\s*(?:wt|quantity|content)|mrp|m\.?r\.?p|mrp\s*:)", value, flags=re.IGNORECASE)[0].strip()
                if len(value) >= 2:
                    return ExtractedDeclaration(
                        declaration_type="Product Name",
                        extracted_value=value,
                        confidence=_confidence_from_match(m, line),
                    )

    # Strategy 2: First prominent text block (top 30% of blocks by Y position)
    if blocks:
        sorted_blocks = sorted(blocks, key=lambda b: (
            b.get("bounding_box", [[0, 0]])[0][1] if b.get("bounding_box") else 0
        ))
        top_blocks = sorted_blocks[:max(1, len(sorted_blocks) // 3)]
        for b in top_blocks:
            text = _normalise_whitespace(b.get("text", ""))
            # Skip short, numeric-only, or label-like text
            if len(text) < 3 or re.match(r"^[\d\s₹%./]+$", text):
                continue
            # Skip common header/label text
            if re.match(r"^(?:mrp|net|price|ingredient|weight|batch|mfg|exp|date|best|before| Directions| Dosage| Qty| Quantity| Mfg| Packed| Import| Marketed| Manufactured| Consumer| Care| Customer| Contact| Phone| Email| Website| Fax| Toll| Helpline)", text, re.IGNORECASE):
                continue
            return ExtractedDeclaration(
                declaration_type="Product Name",
                extracted_value=text,
                confidence=0.70,
            )

    return None


def _extract_mrp(full_text: str, blocks: list[dict]) -> Optional[ExtractedDeclaration]:
    """Extract MRP (Maximum Retail Price) from OCR text."""
    lines = full_text.split("\n")

    # MRP patterns
    mrp_patterns = [
        # "MRP ₹123.45" or "MRP: ₹123.45" or "MRP Rs. 123.45"
        r"(?:mrp|m\.?r\.?p\.?|maximum\s*retail\s*price)\s*[:\-\s]*(?:₹|rs\.?|inr\.?)\s*([\d,]+(?:\.\d{1,2})?)",
        # "₹123.45 MRP" (MRP after price)
        r"(?:₹|rs\.?|inr\.?)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:mrp|m\.?r\.?p\.?)",
        # "MRP 123.45" (no currency symbol)
        r"(?:mrp|m\.?r\.?p\.?)\s*[:\-\s]*(\d[\d,]*(?:\.\d{1,2})?)\s*(?:per|/|\b)",
        # Price pattern near MRP context
        r"(?:price|selling\s*price|m\.?r\.?p\.?)\s*(?:@|at|:)?\s*(?:₹|rs\.?)\s*([\d,]+(?:\.\d{1,2})?)",
    ]

    for pattern in mrp_patterns:
        for line in lines:
            m = re.search(pattern, line, re.IGNORECASE)
            if m:
                price_value = m.group(1).replace(",", "")
                # Validate it's a reasonable price
                try:
                    price_num = float(price_value)
                    if 0.01 <= price_num <= 999999:
                        # Preserve original formatting
                        original = _normalise_whitespace(m.group(0))
                        return ExtractedDeclaration(
                            declaration_type="MRP",
                            extracted_value=f"₹{m.group(1)}",
                            confidence=0.92,
                        )
                except ValueError:
                    continue

    return None


def _extract_net_quantity(full_text: str, blocks: list[dict]) -> Optional[ExtractedDeclaration]:
    """Extract net quantity / net weight / net content from OCR text."""
    lines = full_text.split("\n")

    nq_patterns = [
        # "Net Weight: 500g" / "Net Qty: 1 kg" / "Net Content: 250 ml"
        r"(?:net\s*(?:weight|qty|quantity|content|wt))\s*[:\-\s]*(\d[\d,]*(?:\.\d+)?)\s*(mg|g|gm|kg|ml|l|ltr|ltrs|litre|liter|oz|lb|lbs|pcs?|pieces?|nos?|units?|packs?|strips?)\b",
        # "500 g Net Weight" (reversed)
        r"(\d[\d,]*(?:\.\d+)?)\s*(mg|g|gm|kg|ml|l|ltr|ltrs|litre|liter|oz|lb|lbs|pcs?|pieces?|nos?|units?|packs?|strips?)\s*(?:net\s*(?:weight|qty|quantity|content|wt))",
        # "Quantity: 1 x 500g"
        r"(?:quantity|qty)\s*[:\-\s]*(.+?)(?:\s*$)",
    ]

    for pattern in nq_patterns:
        for line in lines:
            m = re.search(pattern, line, re.IGNORECASE)
            if m:
                value = _normalise_whitespace(m.group(0))
                return ExtractedDeclaration(
                    declaration_type="Net Quantity",
                    extracted_value=value,
                    confidence=_confidence_from_match(m, line),
                )

    return None


def _extract_manufacturer(full_text: str, blocks: list[dict]) -> Optional[ExtractedDeclaration]:
    """Extract manufacturer / packer / importer details."""
    lines = full_text.split("\n")

    # Combined pattern for manufacturer/packer/importer/marketd by
    mfr_patterns = [
        r"(?:manufactured?\s*by|manufactur(?:e[dr]?|ing)\s*(?:at|by|unit)?)\s*[:\-\s]*(.+?)(?:[^\S\n]+\b(?:at|address|plot|door|flat|no\.)\b|,)",
        r"(?:manufactured?\s*by|manufactur(?:e[dr]?|ing)\s*(?:at|by|unit)?)\s*[:\-\s]*(.+?)$",
        r"(?:packed?\s*by|pack(?:ing|ed)\s*(?:at|by)?)\s*[:\-\s]*(.+?)(?:[^\S\n]+\b(?:at|address|plot|door|flat|no\.)\b|,)",
        r"(?:packed?\s*by|pack(?:ing|ed)\s*(?:at|by)?)\s*[:\-\s]*(.+?)$",
        r"(?:imported?\s*by|import(?:er)?\s*[:\-\s]*)\s*(.+?)(?:[^\S\n]+\b(?:at|address|plot|door|flat|no\.)\b|,)",
        r"(?:imported?\s*by|import(?:er)?\s*[:\-\s]*)\s*(.+?)$",
        r"(?:marketed?\s*by|distributed?\s*by)\s*[:\-\s]*(.+?)$",
        r"(?:mkt\.?|mfg\.?)\s*[:\-\s]*(.+?)$",
    ]

    for pattern in mfr_patterns:
        for line in lines:
            m = re.search(pattern, line, re.IGNORECASE)
            if m:
                value = _normalise_whitespace(m.group(1))
                # Clean up common suffixes
                value = re.split(r"\s*(?:gst|gst\s*no|cin|pan|fssai|licence|license|reg\.?)\s*[:\-\s]*", value, flags=re.IGNORECASE)[0].strip()
                # Remove trailing punctuation
                value = value.rstrip(".,;:")
                if len(value) >= 3:
                    return ExtractedDeclaration(
                        declaration_type="Manufacturer",
                        extracted_value=value,
                        confidence=_confidence_from_match(m, line),
                    )

    return None


def _extract_date(full_text: str, blocks: list[dict]) -> Optional[ExtractedDeclaration]:
    """Extract date/month of manufacture, packing, or import."""
    lines = full_text.split("\n")

    date_patterns = [
        # "Mfg Date: Jul 2026" or "Date of Mfg: 01/07/2026"
        r"(?:mfg|manufactur(?:e[dr]?|ing)|pack(?:ed|ing)?|import)\s*(?:date|month|on|dt\.?)?\s*[:\-\s]*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}|\d{1,2}[/\-\.]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4})",
        # "Mfg. Jul 2026" (no "date" keyword)
        r"(?:mfg\.?|manufactur(?:e[dr]?|ing)|packed?|import(?:ed)?)\s*[:\-\s]*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4})",
        # Standalone date patterns near mfg context
        r"(?:batch|lot)\s*(?:no|number|#)?\s*[:\-\s]*\S+\s*(?:date|dt\.?)?\s*[:\-\s]*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}|\d{1,2}[/\-\.]\d{2,4})",
        # "Best before" or "Expiry"
        r"(?:best\s*before|exp(?:iry|ire)?\.?|use\s*by)\s*[:\-\s]*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}|\d{1,2}[/\-\.]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4})",
        # Generic date near month names
        r"((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4})",
        # DD/MM/YYYY or DD-MM-YYYY standalone
        r"(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})",
    ]

    for pattern in date_patterns:
        for line in lines:
            m = re.search(pattern, line, re.IGNORECASE)
            if m:
                value = _normalise_whitespace(m.group(1) if m.lastindex else m.group(0))
                if len(value) >= 4:
                    return ExtractedDeclaration(
                        declaration_type="Date of Manufacture/Packing",
                        extracted_value=value,
                        confidence=_confidence_from_match(m, line),
                    )

    return None


def _extract_consumer_care(full_text: str, blocks: list[dict]) -> Optional[ExtractedDeclaration]:
    """Extract consumer care / customer care details."""
    lines = full_text.split("\n")

    care_patterns = [
        # "Consumer Care: Name, Address, Phone"
        r"(?:consumer|customer)\s*care\s*(?:cell|centre|center|desk|division|department)?\s*[:\-\s]*(.+?)(?:\s*(?:phone|tel|mobile|email|website|fax|www|http))",
        r"(?:consumer|customer)\s*care\s*(?:cell|centre|center|desk|division|department)?\s*[:\-\s]*(.+?)$",
        # "For consumer queries contact: ..."
        r"(?:for|for\s*all)\s*(?:consumer|customer|product)\s*(?:queries|complaints?|feedback|enquir(?:y|ies))\s*(?:contact|write|reach)\s*[:\-\s]*(.+?)(?:\s*(?:phone|tel|mobile|email|website|fax|www|http))",
        r"(?:for|for\s*all)\s*(?:consumer|customer|product)\s*(?:queries|complaints?|feedback|enquir(?:y|ies))\s*(?:contact|write|reach)\s*[:\-\s]*(.+?)$",
        # Phone/email patterns
        r"(?:phone|tel\.?|mobile|contact(?:\s*no)?)\s*[:\-\s]*(\+?\d[\d\s\-]{7,}\d)",
        r"(?:email|e-mail|e\.mail)\s*[:\-\s]*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})",
        r"(?:website|www|http|web)\s*[:\-\s]*(https?://\S+|www\.\S+)",
    ]

    # First try to find "Consumer Care" label and capture the line
    for line in lines:
        m = re.search(
            r"(?:consumer|customer)\s*care\s*(?:cell|centre|center|desk|division|department)?\s*[:\-\s]*(.+)",
            line, re.IGNORECASE
        )
        if m:
            value = _normalise_whitespace(m.group(1))
            # Clean up: stop at next section label
            value = re.split(r"\s*(?:Mfg|MRP|Net|Batch|Best|Exp|Direction|Dosage|Manufactured|Packed|Imported|Marketed)", value, flags=re.IGNORECASE)[0].strip()
            value = value.rstrip(".,;:")
            if len(value) >= 3:
                return ExtractedDeclaration(
                    declaration_type="Consumer Care",
                    extracted_value=value,
                    confidence=_confidence_from_match(m, line),
                )

    # Fallback: look for phone/email/website patterns near "care" or "contact"
    for line in lines:
        for pattern in care_patterns[3:]:  # phone/email/website patterns
            m = re.search(pattern, line, re.IGNORECASE)
            if m:
                value = _normalise_whitespace(m.group(1))
                return ExtractedDeclaration(
                    declaration_type="Consumer Care",
                    extracted_value=value,
                    confidence=_confidence_from_match(m, line),
                )

    return None


# ---------------------------------------------------------------------------
# Main extraction pipeline
# ---------------------------------------------------------------------------

def extract_declarations(
    full_text: str,
    blocks: list[dict] | None = None,
) -> ExtractionResult:
    """
    Extract structured declarations from OCR text.

    Args:
        full_text: Concatenated text from all OCR blocks.
        blocks: Optional list of block dicts with 'text', 'confidence', 'bounding_box'.

    Returns:
        ExtractionResult with list of ExtractedDeclaration objects.
    """
    if blocks is None:
        blocks = []

    result = ExtractionResult(method="deterministic")
    seen_types: set[str] = set()

    extractors = [
        _extract_product_name,
        _extract_mrp,
        _extract_net_quantity,
        _extract_manufacturer,
        _extract_date,
        _extract_consumer_care,
    ]

    for extractor in extractors:
        try:
            declaration = extractor(full_text, blocks)
            if declaration and declaration.declaration_type not in seen_types:
                result.declarations.append(declaration)
                seen_types.add(declaration.declaration_type)
        except Exception as exc:
            logger.warning(f"Extractor {extractor.__name__} failed: {exc}")

    logger.info(
        f"Extracted {len(result.declarations)} declarations "
        f"using {result.method} method"
    )

    return result
