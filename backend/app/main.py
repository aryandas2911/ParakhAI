from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.health import router as health_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
)

# CORS middleware configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register health check endpoint
app.include_router(health_router)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Legal Metrology Compliance Engine API",
        "docs": "/docs",
        "health": "/health",
    }
