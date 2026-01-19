"""Database configuration and models."""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from src.config import settings

# Create async engine
engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)

# Create async session factory
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Get async database session."""
    async with async_session_maker() as session:
        yield session
