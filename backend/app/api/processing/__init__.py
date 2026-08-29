from fastapi import APIRouter, Depends, HTTPException, status
import logging

from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client
from app.schemas.processing import ProcessingResponse, ImageProcessingDetail
from app.services.processing import process_inspection_images

logger = logging.getLogger(__name__)

router = APIRouter(tags=["processing"])


async def _verify_inspection_ownership(client, inspection_id: str, user_id: str) -> dict:
    """Verify the inspection exists and belongs to the authenticated user."""
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
        if result.data["inspector_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to process this inspection.",
            )
        return result.data
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Inspection lookup failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection not found.",
        )


@router.post(
    "/api/inspections/{inspection_id}/process",
    response_model=ProcessingResponse,
)
async def process_inspection(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Process all images for an inspection.

    Steps:
    1. Verify the authenticated user owns the inspection.
    2. Retrieve all uploaded images from the database.
    3. Download and preprocess each image (orientation, resize, contrast).
    4. Return structured processing results.
    """
    client = get_supabase_client()
    user_id = current_user["user_id"]

    # Verify ownership
    await _verify_inspection_ownership(client, inspection_id, user_id)

    # Fetch images from database
    try:
        images_result = (
            client.table("inspection_images")
            .select("*")
            .eq("inspection_id", inspection_id)
            .order("created_at", desc=False)
            .execute()
        )
    except Exception as exc:
        logger.error(f"Failed to fetch images: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve inspection images: {str(exc)}",
        )

    if not images_result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No images found for this inspection. Upload images before processing.",
        )

    # Prepare image list for processing
    image_list = []
    for row in images_result.data:
        signed_url = row["storage_path"] if row["storage_path"].startswith("http") else ""
        image_list.append({
            "image_id": row["image_id"],
            "signed_url": signed_url,
            "storage_path": row["storage_path"],
        })

    # Run processing pipeline
    try:
        result = process_inspection_images(
            inspection_id=inspection_id,
            images=image_list,
        )
    except Exception as exc:
        logger.error(f"Processing pipeline failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image processing failed: {str(exc)}",
        )

    # Build response
    response = ProcessingResponse(
        inspection_id=result.inspection_id,
        status=result.status,
        total_images=result.total_images,
        processed_images=result.processed_images,
        failed_images=result.failed_images,
        images=[
            ImageProcessingDetail(
                image_id=img.image_id,
                original_path=img.original_path,
                status=img.status,
                width=img.width,
                height=img.height,
                format=img.format,
                mode=img.mode,
                orientation_corrected=img.orientation_corrected,
                resized=img.resized,
                original_size_bytes=img.original_size_bytes,
                processed_size_bytes=img.processed_size_bytes,
                error=img.error,
                metadata=img.metadata,
            )
            for img in result.images
        ],
        errors=result.errors,
    )

    logger.info(
        f"Processing complete for {inspection_id}: "
        f"{result.processed_images}/{result.total_images} succeeded "
        f"(status={result.status})"
    )

    return response
