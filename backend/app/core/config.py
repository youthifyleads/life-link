"""
Application configuration.

All configuration is loaded from environment variables (see .env.example).
Nothing here assumes a final database schema - DATABASE_URL is only used
once the real SQL Server repository implementations are plugged in.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # General
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Life Link API"
    API_V1_PREFIX: str = "/api/v1"

    # SQL Server connection used when REPOSITORY_BACKEND=sqlserver/sql/database.
    DATABASE_URL: str = "mssql+pyodbc://placeholder"
    REPOSITORY_BACKEND: str = "memory"  # memory for tests/demo; sqlserver for shared development/staging
    FILE_STORAGE_ROOT: str = "./storage"
    MAX_UPLOAD_MB: int = 10
    AZURE_STORAGE_CONNECTION_STRING: str | None = None
    AZURE_STORAGE_CONTAINER_NAME: str = "medical-docs"

    # Auth - PROVISIONAL, subject to Technical Lead review.
    SECRET_KEY: str = "CHANGE_ME_DEV_ONLY_NOT_FOR_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    OTP_EXPIRE_SECONDS: int = 60
    OTP_MAX_ATTEMPTS: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    PASSWORD_RESET_EXPIRE_MINUTES: int = 15
    PASSWORD_RESET_RESEND_COOLDOWN_SECONDS: int = 60

    # Azure Communication Services Email
    AZURE_COMMUNICATION_CONNECTION_STRING: str = ""
    AZURE_EMAIL_SENDER_ADDRESS: str = ""

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    # Paymob Gateway (Set via .env locally or Azure App Service Application Settings in Production)
    PAYMOB_API_KEY: str = ""
    PAYMOB_SECRET_KEY: str = ""
    PAYMOB_PUBLIC_KEY: str = ""
    PAYMOB_HMAC_SECRET: str = ""
    PAYMOB_BASE_URL: str = "https://accept.paymob.com"
    PAYMOB_CARD_INTEGRATION_ID: int = 5912806

    # Donation vouchers. Monetary values are deliberately configuration, never
    # supplied by a donor or partner request.
    VOUCHER_DIRECT_DONATION_VALUE: int = 50
    VOUCHER_REQUEST_BASED_VALUE: int = 75
    VOUCHER_EXPIRY_DAYS: int = 90


@lru_cache
def get_settings() -> Settings:
    return Settings()
