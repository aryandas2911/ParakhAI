from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.core.supabase import check_supabase_connection, get_supabase_client

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


@router.get("/health/schema")
async def schema_health_check():
    is_connected, message = check_supabase_connection()
    if not is_connected:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "error",
                "database": "supabase",
                "accessible": False,
                "message": message,
            },
        )

    client = get_supabase_client()
    required_tables = [
        "profiles",
        "products",
        "inspections",
        "inspection_images",
        "declarations",
        "violations",
        "evidence",
        "reports",
        "compliance_rules",
    ]

    verified_tables = {}
    missing_tables = []

    for table in required_tables:
        try:
            # Query table with limit 0 to verify table existence and read accessibility
            response = client.table(table).select("*").limit(0).execute()
            verified_tables[table] = True
        except Exception as exc:
            verified_tables[table] = False
            missing_tables.append({"table": table, "error": str(exc)})

    if missing_tables:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "incomplete",
                "database": "supabase",
                "accessible": False,
                "verified_tables_count": len(verified_tables) - len(missing_tables),
                "total_tables_count": len(required_tables),
                "details": verified_tables,
                "missing_tables": missing_tables,
            },
        )

    return {
        "status": "ok",
        "database": "supabase",
        "accessible": True,
        "verified_tables": list(verified_tables.keys()),
        "count": len(verified_tables),
    }


