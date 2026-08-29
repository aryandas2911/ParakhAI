"""
Image preprocessing service for inspection images.

Handles downloading, validation, orientation correction, and basic
preparation of images before downstream OCR/analysis pipelines.
"""

import io
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

import httpx
from PIL import Image, ImageOps, ImageEnhance, ExifTags

logger = logging.getLogger(__name__)


class ProcessingStatus(str, Enum):
    SUCCESS = "success"
    PARTIAL = "partial"
    FAILED = "failed"


@dataclass
class ImageProcessingResult:
    image_id: str
    original_path: str
    status: str
    width: int = 0
    height: int = 0
    format: str = ""
    mode: str = ""
    orientation_corrected: bool = False
    resized: bool = False
    original_size_bytes: int = 0
    processed_size_bytes: int = 0
    error: Optional[str] = None
    metadata: dict = field(default_factory=dict)


@dataclass
class ProcessingResult:
    inspection_id: str
    status: str
    total_images: int
    processed_images: int
    failed_images: int
    images: list = field(default_factory=list)
    errors: list = field(default_factory=list)


def _get_exif_orientation(img: Image.Image) -> Optional[int]:
    """Extract EXIF orientation tag from image."""
    try:
        exif_data = img._getexif()
        if exif_data is None:
            return None
        for tag_id, value in exif_data.items():
            tag = ExifTags.TAGS.get(tag_id, tag_id)
            if tag == "Orientation":
                return value
    except Exception:
        pass
    return None


def _correct_orientation(img: Image.Image) -> tuple[Image.Image, bool]:
    """
    Correct image orientation based on EXIF data.
    Returns (corrected_image, was_corrected).
    """
    orientation = _get_exif_orientation(img)
    if orientation is None:
        return img, False

    try:
        # EXIF orientation values: 1=Normal, 3=180°, 6=90° CW, 8=270° CW
        if orientation in (1, None):
            return img, False
        elif orientation == 3:
            img = img.rotate(180, expand=True)
        elif orientation == 6:
            img = img.rotate(270, expand=True)
        elif orientation == 8:
            img = img.rotate(90, expand=True)
        elif orientation == 2:
            img = ImageOps.mirror(img)
        elif orientation == 4:
            img = ImageOps.mirror(img)
            img = img.rotate(180, expand=True)
        elif orientation == 5:
            img = ImageOps.mirror(img)
            img = img.rotate(270, expand=True)
        elif orientation == 7:
            img = ImageOps.mirror(img)
            img = img.rotate(90, expand=True)
        else:
            return img, False
        return img, True
    except Exception as exc:
        logger.warning(f"Orientation correction failed: {exc}")
        return img, False


def _prepare_for_ocr(img: Image.Image) -> Image.Image:
    """
    Apply basic preprocessing suitable for OCR:
    - Convert to RGB if needed
    - Enhance contrast slightly
    - Sharpen slightly
    Does NOT convert to grayscale (color info can help OCR).
    """
    # Convert to RGB if necessary (handles RGBA, palette, etc.)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
    elif img.mode == "L":
        img = img.convert("RGB")

    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.2)

    # Sharpen
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(1.3)

    return img


def _maximize_size(img: Image.Image, max_dim: int = 2048) -> tuple[Image.Image, bool]:
    """
    Resize image if either dimension exceeds max_dim.
    Preserves aspect ratio. Returns (resized_image, was_resized).
    """
    w, h = img.size
    if max(w, h) <= max_dim:
        return img, False

    ratio = max_dim / max(w, h)
    new_w = int(w * ratio)
    new_h = int(h * ratio)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    return img, True


def download_image_from_url(url: str, timeout: float = 30.0) -> bytes:
    """Download image content from a signed URL."""
    with httpx.Client(timeout=timeout, follow_redirects=True) as client:
        response = client.get(url)
        response.raise_for_status()
        return response.content


def process_image(
    image_bytes: bytes,
    image_id: str,
    original_path: str = "",
    max_dim: int = 2048,
) -> ImageProcessingResult:
    """
    Run the full preprocessing pipeline on a single image.

    Steps:
    1. Load and validate image
    2. Correct orientation from EXIF
    3. Resize if too large
    4. Prepare for OCR (RGB, contrast, sharpness)

    Returns an ImageProcessingResult with metadata.
    """
    result = ImageProcessingResult(
        image_id=image_id,
        original_path=original_path,
        status=ProcessingStatus.SUCCESS,
        original_size_bytes=len(image_bytes),
    )

    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.load()  # Force load to catch truncated files
    except Exception as exc:
        result.status = ProcessingStatus.FAILED
        result.error = f"Failed to load image: {exc}"
        logger.error(f"Image load failed for {image_id}: {exc}")
        return result

    result.format = img.format or "UNKNOWN"
    result.mode = img.mode
    result.width, result.height = img.size

    # Step 1: Correct orientation
    img, was_corrected = _correct_orientation(img)
    result.orientation_corrected = was_corrected
    if was_corrected:
        result.width, result.height = img.size

    # Step 2: Resize if too large
    img, was_resized = _maximize_size(img, max_dim)
    result.resized = was_resized

    # Step 3: Prepare for OCR
    img = _prepare_for_ocr(img)

    # Encode processed image to bytes for metadata
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    result.processed_size_bytes = buf.tell()

    result.metadata = {
        "original_dimensions": f"{result.width}x{result.height}",
        "final_dimensions": f"{img.size[0]}x{img.size[1]}",
        "orientation_corrected": was_corrected,
        "resized": was_resized,
        "output_format": "PNG",
        "output_mode": img.mode,
    }

    logger.info(
        f"Processed image {image_id}: {result.width}x{result.height} "
        f"-> {img.size[0]}x{img.size[1]}, orientation_fixed={was_corrected}, "
        f"resized={was_resized}"
    )

    return result


def process_inspection_images(
    inspection_id: str,
    images: list[dict],
) -> ProcessingResult:
    """
    Process all images for an inspection.

    Args:
        inspection_id: The inspection UUID.
        images: List of dicts with keys: image_id, signed_url, storage_path.

    Returns:
        ProcessingResult with per-image results.
    """
    result = ProcessingResult(
        inspection_id=inspection_id,
        status=ProcessingStatus.SUCCESS,
        total_images=len(images),
        processed_images=0,
        failed_images=0,
    )

    if not images:
        result.status = ProcessingStatus.FAILED
        result.errors.append("No images provided for processing.")
        return result

    for img_info in images:
        image_id = img_info.get("image_id", "unknown")
        signed_url = img_info.get("signed_url", "")
        storage_path = img_info.get("storage_path", image_id)

        if not signed_url:
            img_result = ImageProcessingResult(
                image_id=image_id,
                original_path=storage_path,
                status=ProcessingStatus.FAILED,
                error="No signed URL available for image.",
            )
            result.images.append(img_result)
            result.failed_images += 1
            continue

        try:
            image_bytes = download_image_from_url(signed_url)
            img_result = process_image(
                image_bytes=image_bytes,
                image_id=image_id,
                original_path=storage_path,
            )
        except Exception as exc:
            img_result = ImageProcessingResult(
                image_id=image_id,
                original_path=storage_path,
                status=ProcessingStatus.FAILED,
                error=f"Processing failed: {exc}",
            )
            logger.error(f"Image processing failed for {image_id}: {exc}")

        result.images.append(img_result)

        if img_result.status == ProcessingStatus.SUCCESS:
            result.processed_images += 1
        else:
            result.failed_images += 1

    # Determine overall status
    if result.failed_images == 0:
        result.status = ProcessingStatus.SUCCESS
    elif result.processed_images == 0:
        result.status = ProcessingStatus.FAILED
    else:
        result.status = ProcessingStatus.PARTIAL

    return result
