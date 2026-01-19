"""Database models."""

from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from fastapi_users.db import BaseUser, BaseOAuthAccount

from src.database import Base


class OAuthAccount(BaseOAuthAccount[int]):
    """OAuth account model."""

    pass


class User(Base, BaseUser[int]):
    """User model."""

    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now(timezone.utc),
        onupdate=lambda x: datetime.now(timezone.utc)
    )


async def get_user_db(session):
    """Get user database dependency."""
    yield SQLAlchemyUserDatabase(session, User)
