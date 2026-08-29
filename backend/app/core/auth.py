from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.supabase import get_supabase_client

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Validates Supabase Access Token (JWT) sent via Authorization: Bearer <token>.
    Returns user payload dictionary if valid.
    """
    token = credentials.credentials
    client = get_supabase_client()

    try:
      # Verify token and retrieve authenticated user details from Supabase Auth
      response = client.auth.get_user(token)
      if not response or not response.user:
          raise HTTPException(
              status_code=status.HTTP_401_UNAUTHORIZED,
              detail="Invalid authentication token or user session expired.",
              headers={"WWW-Authenticate": "Bearer"},
          )
      
      user_obj = response.user
      # Retrieve corresponding profile from public.profiles
      profile_res = client.table("profiles").select("*").eq("id", user_obj.id).execute()
      profile_data = profile_res.data[0] if profile_res.data else None

      return {
          "user_id": user_obj.id,
          "email": user_obj.email,
          "name": profile_data.get("name") if profile_data else user_obj.user_metadata.get("name", ""),
          "role": profile_data.get("role") if profile_data else "inspector",
          "created_at": str(user_obj.created_at),
      }
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(exc)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
