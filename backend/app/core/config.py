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

    # Auth - PROVISIONAL, subject to Technical Lead review.
    SECRET_KEY: str = "CHANGE_ME_DEV_ONLY_NOT_FOR_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    CORS_ORIGINS: list[str] = ["*"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
