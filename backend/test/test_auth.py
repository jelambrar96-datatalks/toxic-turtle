"""Tests for authentication endpoints."""

import pytest
from httpx import AsyncClient

from src.app import app


@pytest.mark.asyncio
async def test_register_user():
    """Test user registration."""
    async with AsyncClient(app=app, base_url="http://test") as client:
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
async def test_register_duplicate_email():
    """Test registration with duplicate email."""
    async with AsyncClient(app=app, base_url="http://test") as client:
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
async def test_health_check():
    """Test health check endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
