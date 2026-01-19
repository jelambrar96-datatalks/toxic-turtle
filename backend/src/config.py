"""Application configuration."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings."""

    # Server
    DEBUG: bool = True
    API_TITLE: str = "Toxic Turtle API"
    API_VERSION: str = "0.1.0"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # OAuth - Google
    GOOGLE_OAUTH_CLIENT_ID: Optional[str] = None
    GOOGLE_OAUTH_CLIENT_SECRET: Optional[str] = None

    # OAuth - Facebook
    FACEBOOK_OAUTH_CLIENT_ID: Optional[str] = None
    FACEBOOK_OAUTH_CLIENT_SECRET: Optional[str] = None

    # Frontend URL (for OAuth redirects)
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
