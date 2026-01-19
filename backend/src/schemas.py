"""Pydantic schemas for request/response validation."""

from fastapi_users import schemas
from typing import Optional
from uuid import UUID


class UserRead(schemas.BaseUser[UUID]):
    """User schema for reading."""

    username: str


class UserCreate(schemas.BaseUserCreate):
    """User schema for creation."""

    username: str


class UserUpdate(schemas.BaseUserUpdate):
    """User schema for updates."""

    username: Optional[str] = None


