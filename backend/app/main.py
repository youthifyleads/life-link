import logging
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1 import (
    auth,
    blood_bags,
    caregiver,
    device_tokens,
    documents,
    donors,
    institutions,
    inventory,
    notifications,
    otp,
    payments,
    qr,
    requests,
    users,
)
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.db.session import get_session_factory

logger = logging.getLogger(__name__)

settings = get_settings()
configure_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Life Link backend API layer. Blood-donation request/inventory/QR/notification "
        "management for hospitals and blood banks."
    ),
    version="0.1.0",
    swagger_ui_parameters={"persistAuthorization": True},
    swagger_ui_init_oauth=None,
)

# FastAPI derives Swagger security requirements from the actual HTTPBearer
# dependency used by protected endpoints. Public endpoints such as login, OTP,
# and health therefore remain unauthenticated in OpenAPI.

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(users.router, prefix=settings.API_V1_PREFIX)
app.include_router(requests.router, prefix=settings.API_V1_PREFIX)
app.include_router(inventory.router, prefix=settings.API_V1_PREFIX)
app.include_router(qr.router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications.router, prefix=settings.API_V1_PREFIX)
app.include_router(documents.router, prefix=settings.API_V1_PREFIX)
app.include_router(institutions.router, prefix=settings.API_V1_PREFIX)
app.include_router(donors.router, prefix=settings.API_V1_PREFIX)
app.include_router(caregiver.router, prefix=settings.API_V1_PREFIX)
app.include_router(payments.router, prefix=settings.API_V1_PREFIX)
app.include_router(otp.router, prefix=settings.API_V1_PREFIX)
app.include_router(blood_bags.router, prefix=settings.API_V1_PREFIX)
app.include_router(device_tokens.router, prefix=settings.API_V1_PREFIX)


@app.get(
    "/",
    tags=["Health"],
    summary="Root service status",
    include_in_schema=False,
)
async def root():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs",
        "api": settings.API_V1_PREFIX,
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    responses={
        200: {
            "description": "API and database are healthy",
            "content": {
                "application/json": {
                    "example": {"status": "ok", "database": "connected"}
                }
            },
        },
        503: {
            "description": "Database connection failed or service unavailable",
            "content": {
                "application/json": {
                    "example": {"status": "error", "database": "disconnected"}
                }
            },
        },
    },
)
async def health():
    try:
        async with get_session_factory()() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        logger.error("Database health check failed: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "database": "disconnected"},
        )

