"""Database models."""

from datetime import datetime, timezone
from uuid import uuid4, UUID

from fastapi import Depends
from fastapi_users_db_sqlalchemy import (
    SQLAlchemyBaseUserTableUUID,
    SQLAlchemyUserDatabase,
    SQLAlchemyBaseOAuthAccountTableUUID,
)
from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, relationship, mapped_column

from src.database import Base, get_async_session


class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    """OAuth account model for OAuth2 authentication."""

    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    """User model with UUID primary key and OAuth2 support."""

    __tablename__ = "user"

    # UUID primary key - auto-generated
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    
    # User credentials
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    
    # User status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    
    # OAuth2 accounts relationship
    oauth_accounts: Mapped[list[OAuthAccount]] = relationship(
        "OAuthAccount", lazy="joined", cascade="all, delete-orphan"
    )


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    """Get user database dependency for fastapi-users."""
    yield SQLAlchemyUserDatabase(session, User, OAuthAccount)
