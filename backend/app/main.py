from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router

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

# Register routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(profile_router)



@app.get("/")
async def root():
    return {
        "message": "Welcome to Legal Metrology Compliance Engine API",
        "docs": "/docs",
        "health": "/health",
    }
