from typing import Tuple, Optional
import httpx
from supabase import create_client, Client
from app.core.config import settings

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Returns a reusable singleton instance of the Supabase Client initialized with
    SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
    """
    global _supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise ValueError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in environment variables."
        )

    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )

    return _supabase_client


def check_supabase_connection() -> Tuple[bool, str]:
    """
    Performs a simple, safe connectivity check against Supabase.
    Returns a tuple of (is_connected: bool, message: str).
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return False, "Supabase environment variables (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) are not set."

    try:
        # 1. Initialize client to verify credentials format
        _ = get_supabase_client()

        # 2. Perform HTTP ping to Supabase REST endpoint to verify network reachability & API key
        url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/"
        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        }

        with httpx.Client(timeout=5.0) as http_client:
            response = http_client.get(url, headers=headers)

        if response.status_code in (200, 404):
            return True, "Successfully connected to Supabase PostgreSQL database."
        else:
            return False, f"Supabase responded with HTTP status code {response.status_code}: {response.text}"

    except Exception as exc:
        return False, f"Failed to connect to Supabase: {str(exc)}"
