"""Tests for authentication endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport

from src.app import app


@pytest.mark.asyncio
async def test_register_user(test_db_session):
    """
    Test user registration.
    
    Uses test_db_session fixture to:
    - Create SQLite in-memory database
    - Auto-create all tables (User, Progress, Certificate, OAuthAccount)
    - Provide AsyncSession with overridden get_async_session dependency
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/auth/register",
            json={
                "email": "test@example.com",
                "username": "testuser",
                "password": "password123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["username"] == "testuser"


@pytest.mark.asyncio
async def test_register_duplicate_email(test_db_session):
    """
    Test registration with duplicate email.
    
    Uses test_db_session fixture to ensure user table exists.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # First registration
        await client.post(
            "/auth/register",
            json={
                "email": "duplicate@example.com",
                "username": "user1",
                "password": "password123",
            },
        )

        # Second registration with same email
        response = await client.post(
            "/auth/register",
            json={
                "email": "duplicate@example.com",
                "username": "user2",
                "password": "password123",
            },
        )
        assert response.status_code == 400


@pytest.mark.asyncio
async def test_health_check(test_db_session):
    """
    Test health check endpoint.
    
    Uses test_db_session fixture for consistency,
    though this endpoint doesn't require database access.
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
