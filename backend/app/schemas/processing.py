from pydantic import BaseModel
from typing import Optional


class ImageProcessingDetail(BaseModel):
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
    metadata: dict = {}


class OcrBlockDetail(BaseModel):
    text: str
    confidence: float
    bounding_box: list[list[float]]


class OcrImageDetail(BaseModel):
    image_id: str
    status: str
    blocks: list[OcrBlockDetail] = []
    error: Optional[str] = None


class ProcessingResponse(BaseModel):
    inspection_id: str
    status: str
    total_images: int
    processed_images: int
    failed_images: int
    images: list[ImageProcessingDetail] = []
    ocr_images: list[OcrImageDetail] = []
    errors: list[str] = []


class OcrResultResponse(BaseModel):
    inspection_id: str
    total_blocks: int
    images: list[OcrImageDetail] = []


class DeclarationDetail(BaseModel):
    declaration_id: str
    image_id: str
    declarations_json: list[dict]
    avg_confidence: float
    created_at: str


class DeclarationExtractionResponse(BaseModel):
    inspection_id: str
    declarations: list[DeclarationDetail]
    total_extracted: int
    method: str
