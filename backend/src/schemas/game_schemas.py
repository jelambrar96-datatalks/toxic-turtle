"""Pydantic schemas for game-related endpoints."""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ProgressCreate(BaseModel):
    """Schema for creating progress records."""

    level: int


class ProgressRead(BaseModel):
    """Schema for reading progress records."""

    id: UUID
    user_id: UUID
    level: int
    passed_at: datetime

    class Config:
        from_attributes = True


class CertificateCreate(BaseModel):
    """Schema for creating certificate records."""

    certificate_name: str


class CertificateRead(BaseModel):
    """Schema for reading certificate records."""

    id: UUID
    user_id: UUID
    certificate_name: str
    issued_at: datetime

    class Config:
        from_attributes = True


class UserProgressSummary(BaseModel):
    """Schema for user progress summary."""

    user_id: UUID
    current_level: int
    total_levels_passed: int
    latest_progress: ProgressRead | None = None
    certificates_count: int
    certificates: list[CertificateRead] = []

    class Config:
        from_attributes = True
