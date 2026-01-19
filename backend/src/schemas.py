"""Pydantic schemas for request/response validation."""

from fastapi_users import schemas
from typing import Optional


class UserRead(schemas.BaseUser[int]):
    """User schema for reading."""

    username: str
    email: str
    is_active: bool
    is_superuser: bool
    is_verified: bool

    class Config:
        from_attributes = True


class UserCreate(schemas.BaseUserCreate):
    """User schema for creation."""

    username: str
    email: str
    password: str


class UserUpdate(schemas.BaseUserUpdate):
    """User schema for updates."""

    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


