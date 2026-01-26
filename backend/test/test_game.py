"""Tests for game routes."""

import pytest
from httpx import AsyncClient, ASGITransport

from src.app import app
from src.models import Progress, Certificate
from src.levels import CODE_LEVELS, MOVEMENT_LEVELS, CURSOR_LEVELS




@pytest.mark.asyncio
async def test_get_current_level_no_progress(test_db_session, mock_authenticated_user):
    """Test getting current level when user has no progress."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/game/current_level")
        
        assert response.status_code == 200
        data = response.json()
        assert data["current_level"] == None
        assert data["total_levels"] == len(CODE_LEVELS)


@pytest.mark.asyncio
async def test_get_current_level_with_progress(test_db_session, mock_authenticated_user):
    """Test getting current level when user has passed levels."""
    user = mock_authenticated_user
    
    # Add progress records
    progress = Progress(user_id=user.id, level=1)
    test_db_session.add(progress)
    progress2 = Progress(user_id=user.id, level=2)
    test_db_session.add(progress2)
    await test_db_session.commit()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/game/current_level")
        
        assert response.status_code == 200
        data = response.json()
        assert data["current_level"] == 2


@pytest.mark.asyncio
async def test_pass_level_success(test_db_session, mock_authenticated_user):
    """Test successfully passing a level."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/game/pass_level",
            json={"level": 1},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["level"] == 1


@pytest.mark.asyncio
async def test_pass_level_duplicate(test_db_session, mock_authenticated_user):
    """Test passing the same level twice."""
    user = mock_authenticated_user
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # First pass
        response1 = await client.post(
            "/game/pass_level",
            json={"level": 1},
        )
        assert response1.status_code == 200
        
        # Try to pass again
        response2 = await client.post(
            "/game/pass_level",
            json={"level": 1},
        )
        assert response2.status_code == 200


@pytest.mark.asyncio
async def test_pass_level_requires_previous_levels(test_db_session, mock_authenticated_user):
    """Test that user must pass previous levels first."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Try to pass level 2 without passing level 1
        response = await client.post(
            "/game/pass_level",
            json={"level": 2},
        )
        assert response.status_code == 403
        assert "Must pass all previous levels" in response.json()["detail"]


@pytest.mark.asyncio
async def test_pass_level_sequential(test_db_session, mock_authenticated_user):
    """Test passing levels sequentially."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Pass level 1
        response1 = await client.post("/game/pass_level", json={"level": 1})
        assert response1.status_code == 200
        
        # Pass level 2
        response2 = await client.post("/game/pass_level", json={"level": 2})
        assert response2.status_code == 200
        
        # Pass level 3
        response3 = await client.post("/game/pass_level", json={"level": 3})
        assert response3.status_code == 200


@pytest.mark.asyncio
async def test_pass_level_invalid_level(test_db_session, mock_authenticated_user):
    """Test passing an invalid level number."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/game/pass_level",
            json={"level": 999},
        )
        assert response.status_code == 400
        assert "Invalid level" in response.json()["detail"]


@pytest.mark.asyncio
async def test_check_pass_all_levels_false(test_db_session, mock_authenticated_user):
    """Test checking if all levels passed when only some are passed."""
    user = mock_authenticated_user
    
    # Pass first 2 levels
    progress = Progress(user_id=user.id, level=1)
    test_db_session.add(progress)
    progress2 = Progress(user_id=user.id, level=2)
    test_db_session.add(progress2)
    await test_db_session.commit()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/game/check_pass_all_level")
        
        assert response.status_code == 200
        data = response.json()
        assert data["all_levels_passed"] is False
        assert data["levels_passed"] == 2


@pytest.mark.asyncio
async def test_check_pass_all_levels_true(test_db_session, mock_authenticated_user):
    """Test checking if all levels passed when all are passed."""
    user = mock_authenticated_user
    
    # Pass all levels
    for level in range(1, len(CODE_LEVELS) + 1):
        progress = Progress(user_id=user.id, level=level)
        test_db_session.add(progress)
    await test_db_session.commit()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/game/check_pass_all_level")
        
        assert response.status_code == 200
        data = response.json()
        assert data["all_levels_passed"] is True
        assert data["levels_passed"] == len(CODE_LEVELS)


@pytest.mark.asyncio
async def test_register_certificate_success(test_db_session, mock_authenticated_user):
    """Test successfully registering a certificate."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/game/register_certificate",
            json={"certificate_name": "Python Master"},
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["certificate_name"] == "Python Master"


@pytest.mark.asyncio
async def test_register_certificate_duplicate(test_db_session, mock_authenticated_user):
    """Test registering the same certificate twice."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # First registration
        response1 = await client.post(
            "/game/register_certificate",
            json={"certificate_name": "Python Master"},
        )
        assert response1.status_code == 201
        
        # Try to register again
        response2 = await client.post(
            "/game/register_certificate",
            json={"certificate_name": "Python Master"},
        )
        assert response2.status_code == 409
        assert "already registered" in response2.json()["detail"]


@pytest.mark.asyncio
async def test_get_certified_data_empty(test_db_session, mock_authenticated_user):
    """Test getting certificates when none exist."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/game/get_certified_data")
        
        assert response.status_code == 404


@pytest.mark.asyncio
async def test_check_if_certified_exist_true(test_db_session, mock_authenticated_user):
    """Test checking if a certificate exists when it does."""
    user = mock_authenticated_user
    
    # Add certificate
    cert = Certificate(user_id=user.id, certificate_name="Python Master")
    test_db_session.add(cert)
    await test_db_session.commit()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/game/check_if_certified_exist",
            params={"certificate_name": "Python Master"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["exists"] is True


@pytest.mark.asyncio
async def test_check_if_certified_exist_false(test_db_session, mock_authenticated_user):
    """Test checking if a certificate exists when it doesn't."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get(
            "/game/check_if_certified_exist",
            params={"certificate_name": "Nonexistent Certificate"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["exists"] is False


@pytest.mark.asyncio
async def test_get_level_data_success(test_db_session, mock_authenticated_user):
    """Test getting level data for level 1."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/game/get_level_data", params={"level": 1})
        
        assert response.status_code == 200
        data = response.json()
        assert data["level_number"] == 1
        assert data["code"] == CODE_LEVELS[0]
        assert data["movements"] == MOVEMENT_LEVELS[0]
        assert data["cursor"] == CURSOR_LEVELS[0]
        assert data["can_play"] is True


@pytest.mark.asyncio
async def test_get_level_data_requires_progression(test_db_session, mock_authenticated_user):
    """Test that accessing level 2 requires passing level 1."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Try to get level 2 without passing level 1
        response = await client.get("/game/get_level_data", params={"level": 2})
        
        assert response.status_code == 403
        assert "Must pass all previous levels" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_level_data_after_progression(test_db_session, mock_authenticated_user):
    """Test getting level 2 data after passing level 1."""
    user = mock_authenticated_user
    
    # Pass level 1
    progress = Progress(user_id=user.id, level=1)
    test_db_session.add(progress)
    await test_db_session.commit()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/game/get_level_data", params={"level": 2})
        
        assert response.status_code == 200
        data = response.json()
        assert data["level_number"] == 2
        assert data["code"] == CODE_LEVELS[1]


@pytest.mark.asyncio
async def test_get_level_data_invalid_level(test_db_session, mock_authenticated_user):
    """Test getting data for invalid level."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/game/get_level_data", params={"level": 999})
        
        assert response.status_code == 400
        assert "Invalid level" in response.json()["detail"]


@pytest.mark.asyncio
async def test_user_progress_summary(test_db_session, mock_authenticated_user):
    """Test getting comprehensive user progress summary."""
    user = mock_authenticated_user
    
    # Add progress and certificates
    for level in range(1, 3):
        progress = Progress(user_id=user.id, level=level)
        test_db_session.add(progress)
    
    cert = Certificate(user_id=user.id, certificate_name="Python Master")
    test_db_session.add(cert)
    await test_db_session.commit()
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/game/user_progress_summary")
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == user.username
        assert data["max_level"] == 2
        assert data["levels_passed"] == 2
        assert data["certificates_count"] == 1

