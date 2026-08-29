from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from typing import Optional
from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client

router = APIRouter(prefix="/api/profile", tags=["profile"])


class ProfileResponse(BaseModel):
    id: str
    name: str
    role: str
    email: str
    created_at: str
    updated_at: Optional[str] = None


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 1:
                raise ValueError("Name cannot be empty.")
            if len(v) > 255:
                raise ValueError("Name must be at most 255 characters.")
        return v


@router.get("", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    client = get_supabase_client()
    user_id = current_user["user_id"]

    try:
        result = (
            client.table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found.",
            )

        profile = result.data
        return ProfileResponse(
            id=profile["id"],
            name=profile["name"],
            role=profile["role"],
            email=current_user["email"],
            created_at=str(profile["created_at"]),
            updated_at=str(profile.get("updated_at", "")),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(exc)}",
        )


@router.patch("", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update the authenticated user's own profile. Only the name field is mutable."""
    client = get_supabase_client()
    user_id = current_user["user_id"]

    updates = {}
    if body.name is not None:
        updates["name"] = body.name

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )

    try:
        result = (
            client.table("profiles")
            .update(updates)
            .eq("id", user_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found.",
            )

        updated = result.data[0]
        return ProfileResponse(
            id=updated["id"],
            name=updated["name"],
            role=updated["role"],
            email=current_user["email"],
            created_at=str(updated["created_at"]),
            updated_at=str(updated.get("updated_at", "")),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(exc)}",
        )
