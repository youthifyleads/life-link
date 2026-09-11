from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.api.v1 import auth, inventory, notifications, qr, requests, users, documents, institutions, donors, caregiver, payments, otp
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging

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


@app.get("/health", tags=["Health"], summary="Health check")
async def health() -> dict:
    return {"status": "ok", "environment": settings.ENVIRONMENT}
