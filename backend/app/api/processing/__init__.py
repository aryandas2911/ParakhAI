from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client
from app.schemas.processing import (
    ProcessingResponse,
    ImageProcessingDetail,
    OcrBlockDetail,
    OcrImageDetail,
    OcrResultResponse,
    DeclarationDetail,
    DeclarationExtractionResponse,
)
from app.services.processing import process_inspection_images
from app.services.ocr import run_ocr_on_image
from app.services.declaration_extraction import extract_declarations




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
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inspection not found.",
        )


def _download_image(url: str) -> bytes:
    """Download image content from a signed URL."""
    import httpx

    with httpx.Client(timeout=30.0, follow_redirects=True) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.content


@router.post(
    "/api/inspections/{inspection_id}/process",
    response_model=ProcessingResponse,
)
async def process_inspection(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Process all images for an inspection: preprocessing + OCR.
    OCR results are persisted to the ocr_results table.
    """
    client = get_supabase_client()
    user_id = current_user["user_id"]

    await _verify_inspection_ownership(client, inspection_id, user_id)

    # Fetch images
    try:
        images_result = (
            client.table("inspection_images")
            .select("*")
            .eq("inspection_id", inspection_id)
            .order("created_at", desc=False)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve inspection images.",
        )

    if not images_result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No images found for this inspection. Upload images before processing.",
        )

    # Prepare image list
    image_list = []
    for row in images_result.data:
        signed_url = row["storage_path"] if row["storage_path"].startswith("http") else ""
        image_list.append({
            "image_id": row["image_id"],
            "signed_url": signed_url,
            "storage_path": row["storage_path"],
        })

    # Run preprocessing
    try:
        proc_result = process_inspection_images(
            inspection_id=inspection_id,
            images=image_list,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Image processing failed.",
        )

    # Run OCR on each image and persist results (one row per image)
    ocr_images: list[OcrImageDetail] = []
    ocr_inserts: list[dict] = []

    for img_info in image_list:
        image_id = img_info["image_id"]
        signed_url = img_info["signed_url"]

        if not signed_url:
            ocr_images.append(OcrImageDetail(
                image_id=image_id, status="failed", error="No signed URL."
            ))
            continue

        try:
            image_bytes = _download_image(signed_url)
            ocr_result = run_ocr_on_image(image_bytes, image_id)
        except Exception as exc:
            ocr_images.append(OcrImageDetail(
                image_id=image_id, status="failed", error=str(exc)
            ))
            continue

        blocks_detail = []
        blocks_json = []
        for b in ocr_result.blocks:
            blocks_detail.append(OcrBlockDetail(
                text=b.text,
                confidence=b.confidence,
                bounding_box=b.bounding_box,
            ))
            blocks_json.append({
                "text": b.text,
                "confidence": b.confidence,
                "bounding_box": b.bounding_box,
            })

        full_text = "\n".join(b.text for b in ocr_result.blocks)
        avg_conf = (
            sum(b.confidence for b in ocr_result.blocks) / len(ocr_result.blocks)
            if ocr_result.blocks else 0
        )

        ocr_inserts.append({
            "inspection_id": inspection_id,
            "image_id": image_id,
            "full_text": full_text,
            "blocks_json": blocks_json,
            "avg_confidence": round(avg_conf, 4),
        })

        ocr_images.append(OcrImageDetail(
            image_id=image_id,
            status=ocr_result.status,
            blocks=blocks_detail,
            error=ocr_result.error,
        ))

    # Persist OCR results (delete old ones first to avoid duplicates on re-process)
    try:
        client.table("ocr_results").delete().eq("inspection_id", inspection_id).execute()
        if ocr_inserts:
            for row in ocr_inserts:
                client.table("ocr_results").insert(row).execute()
    except Exception:
        pass

    # Build response
    response = ProcessingResponse(
        inspection_id=proc_result.inspection_id,
        status=proc_result.status,
        total_images=proc_result.total_images,
        processed_images=proc_result.processed_images,
        failed_images=proc_result.failed_images,
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
            for img in proc_result.images
        ],
        ocr_images=ocr_images,
        errors=proc_result.errors,
    )

    return response


@router.get(
    "/api/inspections/{inspection_id}/ocr",
    response_model=OcrResultResponse,
)
async def get_ocr_results(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve stored OCR results for an inspection. Does NOT re-run OCR."""
    client = get_supabase_client()
    user_id = current_user["user_id"]

    await _verify_inspection_ownership(client, inspection_id, user_id)

    try:
        result = (
            client.table("ocr_results")
            .select("*")
            .eq("inspection_id", inspection_id)
            .order("created_at", desc=False)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve OCR results.",
        )

    images = []
    total_blocks = 0
    for row in (result.data or []):
        blocks_data = row.get("blocks_json") or []
        blocks = []
        for b in blocks_data:
            blocks.append(OcrBlockDetail(
                text=b["text"],
                confidence=float(b["confidence"]),
                bounding_box=b.get("bounding_box") or [],
            ))
        total_blocks += len(blocks)
        images.append(OcrImageDetail(
            image_id=row["image_id"],
            status="success",
            blocks=blocks,
        ))

    return OcrResultResponse(
        inspection_id=inspection_id,
        total_blocks=total_blocks,
        images=images,
    )


@router.post(
    "/api/inspections/{inspection_id}/extract",
    response_model=DeclarationExtractionResponse,
)
async def extract_declarations_endpoint(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Extract structured declarations from stored OCR results.
    Persists declarations to the declarations table.
    Does NOT re-run OCR.
    """
    client = get_supabase_client()
    user_id = current_user["user_id"]

    await _verify_inspection_ownership(client, inspection_id, user_id)

    # Retrieve stored OCR results
    try:
        ocr_result = (
            client.table("ocr_results")
            .select("*")
            .eq("inspection_id", inspection_id)
            .order("created_at", desc=False)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve OCR results for extraction.",
        )

    if not ocr_result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OCR results found for this inspection. Run processing first.",
        )

    # Persist one row per image with declarations as JSONB (delete existing first)
    try:
        client.table("declarations").delete().eq("inspection_id", inspection_id).execute()

        inserted_declarations: list[dict] = []
        for ocr_row in ocr_result.data:
            image_id = ocr_row.get("image_id", "")
            text = ocr_row.get("full_text", "")
            blocks = ocr_row.get("blocks_json") or []

            if not text.strip():
                continue

            extraction_result = extract_declarations(full_text=text, blocks=blocks)

            decls_json = []
            total_conf = 0.0
            for decl in extraction_result.declarations:
                decls_json.append({
                    "declaration_type": decl.declaration_type,
                    "extracted_value": decl.extracted_value,
                    "confidence": round(decl.confidence, 4),
                })
                total_conf += decl.confidence

            avg_conf = round(total_conf / len(decls_json), 4) if decls_json else 0

            row_data = {
                "inspection_id": inspection_id,
                "image_id": image_id,
                "declarations_json": decls_json,
                "avg_confidence": avg_conf,
            }
            result = client.table("declarations").insert(row_data).execute()
            if result.data:
                inserted_declarations.append(result.data[0])

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist declarations.",
        )

    # Build response
    declarations_response = []
    total_extracted = 0
    for row in inserted_declarations:
        decls = row.get("declarations_json") or []
        total_extracted += len(decls)
        declarations_response.append(DeclarationDetail(
            declaration_id=row["declaration_id"],
            image_id=row["image_id"],
            declarations_json=decls,
            avg_confidence=float(row.get("avg_confidence", 0)),
            created_at=str(row["created_at"]),
        ))

    return DeclarationExtractionResponse(
        inspection_id=inspection_id,
        declarations=declarations_response,
        total_extracted=total_extracted,
        method="deterministic",
    )


@router.get(
    "/api/inspections/{inspection_id}/declarations",
    response_model=list[DeclarationDetail],
)
async def get_declarations(
    inspection_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve stored declarations for an inspection. Does NOT re-run extraction."""
    client = get_supabase_client()
    user_id = current_user["user_id"]

    await _verify_inspection_ownership(client, inspection_id, user_id)

    try:
        result = (
            client.table("declarations")
            .select("*")
            .eq("inspection_id", inspection_id)
            .order("created_at", desc=False)
            .execute()
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve declarations.",
        )

    declarations = []
    for row in (result.data or []):
        declarations.append(DeclarationDetail(
            declaration_id=row["declaration_id"],
            image_id=row["image_id"],
            declarations_json=row.get("declarations_json") or [],
            avg_confidence=float(row.get("avg_confidence", 0)),
            created_at=str(row["created_at"]),
        ))

    return declarations
