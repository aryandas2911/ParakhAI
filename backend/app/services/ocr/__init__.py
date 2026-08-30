"""
OCR service using PaddleOCR for extracting text from inspection images.
"""

import io
import logging
import os
from dataclasses import dataclass, field
from typing import Optional

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

_ocr_instance = None


def _get_ocr():
    global _ocr_instance
    if _ocr_instance is None:
        from paddleocr import PaddleOCR
        os.environ["FLAGS_enable_pir_api"] = "0"
        _ocr_instance = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    return _ocr_instance


@dataclass
class OcrTextBlock:
    text: str
    confidence: float
    bounding_box: list[list[float]]
    image_id: str


@dataclass
class OcrImageResult:
    image_id: str
    status: str
    blocks: list = field(default_factory=list)
    error: Optional[str] = None


def run_ocr_on_image(image_bytes: bytes, image_id: str) -> OcrImageResult:
    """Run PaddleOCR on a single image's bytes. Returns detected text blocks."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        img_array = np.array(img)
    except Exception as exc:
        logger.error(f"Failed to load image for OCR {image_id}: {exc}")
        return OcrImageResult(
            image_id=image_id, status="failed", error=str(exc)
        )

    try:
        ocr = _get_ocr()
        raw = ocr.ocr(img_array, cls=True)
    except Exception as exc:
        logger.error(f"OCR failed for {image_id}: {exc}")
        return OcrImageResult(
            image_id=image_id, status="failed", error=str(exc)
        )

    blocks = []
    if raw and raw[0]:
        for line in raw[0]:
            bbox_points = line[0]
            text = line[1][0]
            conf = float(line[1][1])

            clean_bbox = [[float(p[0]), float(p[1])] for p in bbox_points]
            blocks.append(
                OcrTextBlock(
                    text=text.strip(),
                    confidence=round(conf, 4),
                    bounding_box=clean_bbox,
                    image_id=image_id,
                )
            )

    return OcrImageResult(
        image_id=image_id,
        status="success",
        blocks=blocks,
    )
