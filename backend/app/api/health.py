from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.core.supabase import check_supabase_connection

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "LM-CE Backend API",
        "version": "0.1.0",
    }


@router.get("/health/db")
async def db_health_check():
    is_connected, message = check_supabase_connection()
    if is_connected:
        return {
            "status": "ok",
            "database": "supabase",
            "connected": True,
            "message": message,
        }
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "error",
            "database": "supabase",
            "connected": False,
            "message": message,
        },
    )

