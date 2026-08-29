from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel, field_validator
from typing import Optional
import logging
import uuid
import os
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


# ---- Inspection Images ----

STORAGE_BUCKET = "inspection-images"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}

# Map file extensions to MIME types as fallback
EXT_TO_MIME = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}


def _extract_signed_url(signed_url_data) -> str:
    """Extract signed/public URL string from various possible response formats."""
    if isinstance(signed_url_data, str):
        return signed_url_data
    if isinstance(signed_url_data, dict):
        for key in ("signedURL", "signedUrl", "signed_url", "url", "publicUrl"):
            val = signed_url_data.get(key)
            if val and isinstance(val, str):
                return val
    return ""


class InspectionImageResponse(BaseModel):
    image_id: str
    inspection_id: str
    storage_path: str
    image_type: str
    signed_url: str
    created_at: str


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
                detail="You are not authorized to modify this inspection.",
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


def _ensure_storage_bucket(client):
    """Ensure the storage bucket exists and is public."""
    try:
        buckets = client.storage.list_buckets()
        bucket_ids = [b.name for b in buckets]
        if STORAGE_BUCKET not in bucket_ids:
            client.storage.create_bucket(
                STORAGE_BUCKET,
                options={"public": True},
            )
            logger.info(f"Created public storage bucket: {STORAGE_BUCKET}")
        else:
            # Update existing bucket to be public if it isn't already
            try:
                client.storage.update_bucket(
                    STORAGE_BUCKET,
                    options={"public": True},
                )
            except Exception:
                pass
    except Exception as exc:
        logger.warning(f"Bucket check/create failed (may already exist): {exc}")


@router.post(
    "/{inspection_id}/images",
    response_model=InspectionImageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_inspection_image(
    inspection_id: str,
    file: UploadFile = File(...),
    image_type: str = "product",
    current_user: dict = Depends(get_current_user),
):
    """Upload an image for an inspection. Validates file type and size."""
    client = get_supabase_client()
    user_id = current_user["user_id"]

    # Verify ownership
    await _verify_inspection_ownership(client, inspection_id, user_id)

    # Read file content and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB.",
        )

    # Generate safe unique filename
    ext = os.path.splitext(file.filename or "image.jpg")[1].lower()
    if ext not in (".jpg", ".jpeg", ".png"):
        ext = ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    storage_path = f"inspections/{inspection_id}/{unique_name}"

    # Determine content type - prefer file.content_type, fallback to extension mapping
    content_type = file.content_type
    if not content_type or content_type == "application/octet-stream" or content_type.startswith("text/"):
        content_type = EXT_TO_MIME.get(ext, "image/jpeg")

    # Validate MIME type
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{content_type}'. Allowed: JPEG, PNG.",
        )

    # Ensure bucket exists
    _ensure_storage_bucket(client)

    # Upload to Supabase Storage
    try:
        client.storage.from_(STORAGE_BUCKET).upload(
            path=storage_path,
            file=content,
            file_options={"content-type": content_type, "upsert": "false"},
        )
    except Exception as exc:
        logger.error(f"Storage upload failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image to storage: {str(exc)}",
        )

    # Generate signed URL (10 year expiry) to store in database
    try:
        signed_url_data = client.storage.from_(STORAGE_BUCKET).create_signed_url(
            storage_path, expires_in=315360000  # 10 years
        )
        signed_url = _extract_signed_url(signed_url_data)
    except Exception as exc:
        logger.warning(f"Signed URL generation failed: {exc}")
        signed_url = ""

    # Create database record — store the signed URL as storage_path
    try:
        result = (
            client.table("inspection_images")
            .insert({
                "inspection_id": inspection_id,
                "storage_path": signed_url if signed_url else storage_path,
                "image_type": image_type,
            })
            .execute()
        )
        if not result.data:
            # Cleanup: remove uploaded file if DB insert fails
            try:
                client.storage.from_(STORAGE_BUCKET).remove([storage_path])
            except Exception:
                pass
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save image record.",
            )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Image record insert failed: {exc}")
        try:
            client.storage.from_(STORAGE_BUCKET).remove([storage_path])
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image record: {str(exc)}",
        )

    row = result.data[0]
    return InspectionImageResponse(
        image_id=row["image_id"],
        inspection_id=row["inspection_id"],
        storage_path=row["storage_path"],
        image_type=row["image_type"],
        signed_url=row["storage_path"],
        created_at=str(row["created_at"]),
    )


@router.get(
    "/{inspection_id}/images",
    response_model=list[InspectionImageResponse],
)
async def list_inspection_images(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    """List all images for an inspection with signed URLs."""
    client = get_supabase_client()
    user_id = current_user["user_id"]

    # Verify ownership
    try:
        await _verify_inspection_ownership(client, inspection_id, user_id)
    except Exception as exc:
        logger.error(f"Ownership check failed in list: {exc}")
        raise

    try:
        result = (
            client.table("inspection_images")
            .select("*")
            .eq("inspection_id", inspection_id)
            .order("created_at", desc=False)
            .execute()
        )
        if not result.data:
            return []

        # Ensure bucket exists for signed URL generation
        _ensure_storage_bucket(client)

        responses = []
        for row in result.data:
            stored_path = row["storage_path"]
            # If storage_path is already a signed/public URL, use it directly
            if stored_path.startswith("http"):
                url = stored_path
            else:
                # Old record with raw path — generate signed URL on the fly
                try:
                    signed_url_data = client.storage.from_(STORAGE_BUCKET).create_signed_url(
                        stored_path, expires_in=315360000  # 10 years
                    )
                    url = _extract_signed_url(signed_url_data)
                except Exception as exc:
                    logger.warning(f"Signed URL failed for {stored_path}: {exc}")
                    url = ""

            responses.append(InspectionImageResponse(
                image_id=row["image_id"],
                inspection_id=row["inspection_id"],
                storage_path=stored_path,
                image_type=row["image_type"],
                signed_url=url,
                created_at=str(row["created_at"]),
            ))

        return responses
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"List images failed: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list images: {str(exc)}",
        )


@router.delete(
    "/{inspection_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_inspection_image(
    inspection_id: str,
    image_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete an image from storage and database."""
    client = get_supabase_client()
    user_id = current_user["user_id"]

    # Verify ownership
    await _verify_inspection_ownership(client, inspection_id, user_id)

    # Fetch the image record
    try:
        result = (
            client.table("inspection_images")
            .select("*")
            .eq("image_id", image_id)
            .eq("inspection_id", inspection_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found.",
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found.",
        )

    image_row = result.data
    storage_path = image_row["storage_path"]

    # If storage_path is a signed URL, extract the actual file path
    actual_path = storage_path
    if storage_path.startswith("http"):
        try:
            # Extract path after bucket name: .../object/sign/inspection-images/{path}?token=...
            from urllib.parse import urlparse, parse_qs
            parsed = urlparse(storage_path)
            path_parts = parsed.path.split("/")
            # Find index of bucket name and take everything after it (minus token param)
            if STORAGE_BUCKET in path_parts:
                bucket_idx = path_parts.index(STORAGE_BUCKET)
                actual_path = "/".join(path_parts[bucket_idx + 1:])
        except Exception as exc:
            logger.warning(f"Failed to extract path from URL: {exc}")

    # Delete from storage first
    try:
        client.storage.from_(STORAGE_BUCKET).remove([actual_path])
    except Exception as exc:
        logger.warning(f"Storage delete failed for {actual_path}: {exc}")

    # Delete database record
    try:
        client.table("inspection_images").delete().eq("image_id", image_id).execute()
    except Exception as exc:
        logger.error(f"DB delete failed for image {image_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete image record.",
        )
