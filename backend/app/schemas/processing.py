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


class ProcessingResponse(BaseModel):
    inspection_id: str
    status: str
    total_images: int
    processed_images: int
    failed_images: int
    images: list[ImageProcessingDetail] = []
    errors: list[str] = []
