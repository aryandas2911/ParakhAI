from fastapi import APIRouter, Depends
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Returns identity of authenticated user after validating Supabase access token.
    """
    return {
        "status": "authenticated",
        "user": current_user,
    }
