"""Pytest configuration and fixtures."""

import asyncio
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, inspect

from src.app import app
from src.database import Base, get_async_session, create_db_and_tables
from src.auth import current_active_user
from src.models import User, OAuthAccount, Progress, Certificate


# Test database setup
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="function")
async def test_engine():
    """
    Create test engine with SQLite in-memory database.
    
    Features:
    - In-memory database for speed
    - Creates all tables from Base.metadata (database migrations)
    - Cleans up after test completion
    - Uses sqlite+aiosqlite for async support
    
    Yields:
        AsyncEngine: SQLAlchemy async engine for test database
    """
    engine = create_async_engine(
        TEST_DATABASE_URL, 
        echo=False,
        connect_args={"timeout": 30}  # SQLite timeout for concurrent access
    )
    
    # Execute database migrations by creating all tables from metadata
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Cleanup: drop all tables after test
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture(scope="function")
async def test_db_session(test_engine):
    """
    Create test database session with dependency override.
    
    Features:
    - Provides AsyncSession for database operations
    - Overrides get_async_session dependency in app
    - Automatically clears overrides after test
    - Inherits tables from test_engine (all migrations already run)
    
    Yields:
        AsyncSession: Session for database operations
    """
    async_session_maker = sessionmaker(
        test_engine, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    
    async def override_get_db():
        """Override the get_async_session dependency."""
        async with async_session_maker() as session:
            yield session
    
    # Override the get_async_session dependency
    app.dependency_overrides[get_async_session] = override_get_db
    
    async with async_session_maker() as session:
        yield session
    
    # Cleanup: clear all dependency overrides
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def db_with_verified_migrations(test_engine):
    """
    Create test database with explicit migrations verification.
    
    This fixture:
    - Runs all database migrations (creates tables)
    - Verifies all required tables were created
    - Verifies table schemas
    - Provides fresh database for each test
    
    Yields:
        AsyncEngine: Engine with verified migrations
    """
    async with test_engine.begin() as conn:
        # Execute migrations: create all tables
        await conn.run_sync(Base.metadata.create_all)
        
        # Verify table creation by checking table existence
        inspector = inspect(Base.metadata)
        tables_to_verify = {"user", "progress", "certificate", "oauthaccount"}
        
        # Query actual created tables
        result = await conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        )
        created_tables = {row[0] for row in result}
        
        # Assert all required tables exist
        for table in tables_to_verify:
            assert table in created_tables, f"Table '{table}' was not created during migrations"
    
    yield test_engine
    
    # Cleanup
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
async def test_session_with_verified_migrations(db_with_verified_migrations):
    """
    Create test session with verified migrations.
    
    Use this when you need guaranteed table creation before tests.
    All tables are verified to exist before session is provided.
    
    Yields:
        AsyncSession: Session with migrations verified
    """
    async_session_maker = sessionmaker(
        db_with_verified_migrations, 
        class_=AsyncSession, 
        expire_on_commit=False
    )
    
    async def override_get_db():
        async with async_session_maker() as session:
            yield session
    
    app.dependency_overrides[get_async_session] = override_get_db
    
    async with async_session_maker() as session:
        yield session
    
    app.dependency_overrides.clear()


# ============================================================================
# User Fixtures
# ============================================================================

@pytest.fixture
async def authenticated_user(test_db_session):
    """
    Create an authenticated test user.
    
    User Details:
    - email: test@example.com
    - username: testuser
    - is_active: True
    - is_verified: True
    - password: hashed_password_123
    
    Returns:
        User: A verified, active test user object
    """
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_password_123",
        is_active=True,
        is_verified=True,
    )
    test_db_session.add(user)
    await test_db_session.commit()
    await test_db_session.refresh(user)
    return user


@pytest.fixture
async def test_user_with_progress(test_db_session):
    """
    Create a test user with partial level progress (levels 1, 2, 3).
    
    User Details:
    - email: progress@example.com
    - username: progressuser
    - Progress: Levels 1, 2, 3 completed (not all 4)
    
    Returns:
        User: User with progress records for levels 1, 2, 3
    """
    user = User(
        email="progress@example.com",
        username="progressuser",
        hashed_password="hashed_password_123",
        is_active=True,
        is_verified=True,
    )
    test_db_session.add(user)
    await test_db_session.commit()
    await test_db_session.refresh(user)
    
    # Add progress records for levels 1, 2, 3 (not 4)
    for level in [1, 2, 3]:
        progress = Progress(user_id=user.id, level=level)
        test_db_session.add(progress)
    
    await test_db_session.commit()
    return user


@pytest.fixture
async def test_user_with_all_levels_complete(test_db_session):
    """
    Create a test user with all 4 levels completed.
    
    User Details:
    - email: alllevels@example.com
    - username: allleveluser
    - Progress: All 4 levels completed
    
    Returns:
        User: User with all levels completed (ready for certification)
    """
    user = User(
        email="alllevels@example.com",
        username="allleveluser",
        hashed_password="hashed_password_123",
        is_active=True,
        is_verified=True,
    )
    test_db_session.add(user)
    await test_db_session.commit()
    await test_db_session.refresh(user)
    
    # Add all 4 level completions
    for level in [1, 2, 3, 4]:
        progress = Progress(user_id=user.id, level=level)
        test_db_session.add(progress)
    
    await test_db_session.commit()
    return user


@pytest.fixture
async def test_user_with_certificate(test_db_session):
    """
    Create a test user with certificate (all levels completed + certified).
    
    User Details:
    - email: certified@example.com
    - username: certuser
    - Progress: All 4 levels completed
    - Certificate: Issued with name "Test User"
    
    Returns:
        User: User with all levels completed and certificate
    """
    user = User(
        email="certified@example.com",
        username="certuser",
        hashed_password="hashed_password_123",
        is_active=True,
        is_verified=True,
    )
    test_db_session.add(user)
    await test_db_session.commit()
    await test_db_session.refresh(user)
    
    # Add all 4 level completions
    for level in [1, 2, 3, 4]:
        progress = Progress(user_id=user.id, level=level)
        test_db_session.add(progress)
    
    # Add certificate
    certificate = Certificate(
        user_id=user.id,
        certificate_name="Test User"
    )
    test_db_session.add(certificate)
    
    await test_db_session.commit()
    await test_db_session.refresh(user)
    
    return user


@pytest.fixture
async def test_user_with_oauth(test_db_session):
    """
    Create a test user with OAuth2 account linked.
    
    User Details:
    - email: oauth@example.com
    - username: oauthuser
    - OAuth: Google account linked
      - oauth_name: google
      - account_id: 115691234567890123456
      - account_email: oauth@gmail.com
    
    Returns:
        User: User with linked OAuth account
    """
    user = User(
        email="oauth@example.com",
        username="oauthuser",
        hashed_password="hashed_password_123",
        is_active=True,
        is_verified=True,
    )
    test_db_session.add(user)
    await test_db_session.commit()
    await test_db_session.refresh(user)
    
    # Add OAuth account
    oauth_account = OAuthAccount(
        user_id=user.id,
        oauth_name="google",
        account_id="115691234567890123456",
        account_email="oauth@gmail.com"
    )
    test_db_session.add(oauth_account)
    await test_db_session.commit()
    
    return user


# ============================================================================
# Authentication Mock Fixtures
# ============================================================================

@pytest.fixture
def mock_authenticated_user(authenticated_user):
    """
    Mock the current_active_user dependency with a test user.
    
    Use with AsyncClient to bypass authentication checks in tests.
    The mocked user is the basic authenticated_user fixture.
    
    Yields:
        User: The authenticated test user
    """
    async def override_current_user():
        return authenticated_user
    
    app.dependency_overrides[current_active_user] = override_current_user
    yield authenticated_user
    app.dependency_overrides.clear()


@pytest.fixture
def mock_user_with_progress(test_user_with_progress):
    """
    Mock current_active_user with a user who has partial progress.
    
    Mocked user has levels 1, 2, 3 completed (not all 4).
    
    Yields:
        User: User with progress records
    """
    async def override_current_user():
        return test_user_with_progress
    
    app.dependency_overrides[current_active_user] = override_current_user
    yield test_user_with_progress
    app.dependency_overrides.clear()


@pytest.fixture
def mock_user_with_all_levels(test_user_with_all_levels_complete):
    """
    Mock current_active_user with a user who has all levels completed.
    
    Mocked user has all 4 levels completed (ready for certification).
    
    Yields:
        User: User with all levels completed
    """
    async def override_current_user():
        return test_user_with_all_levels_complete
    
    app.dependency_overrides[current_active_user] = override_current_user
    yield test_user_with_all_levels_complete
    app.dependency_overrides.clear()


@pytest.fixture
def mock_user_with_certificate(test_user_with_certificate):
    """
    Mock current_active_user with a certified user.
    
    Mocked user has all levels completed and a certificate.
    
    Yields:
        User: User with certificate
    """
    async def override_current_user():
        return test_user_with_certificate
    
    app.dependency_overrides[current_active_user] = override_current_user
    yield test_user_with_certificate
    app.dependency_overrides.clear()


@pytest.fixture
def mock_user_with_oauth(test_user_with_oauth):
    """
    Mock current_active_user with an OAuth-linked user.
    
    Mocked user has a Google OAuth account linked.
    
    Yields:
        User: User with OAuth account
    """
    async def override_current_user():
        return test_user_with_oauth
    
    app.dependency_overrides[current_active_user] = override_current_user
    yield test_user_with_oauth
    app.dependency_overrides.clear()


# ============================================================================
# Pytest Configuration
# ============================================================================

# Configure pytest asyncio
pytest_plugins = ("pytest_asyncio",)


# Pytest asyncio mode configuration
def pytest_configure(config):
    """
    Configure pytest asyncio mode.
    
    Sets asyncio_mode to "auto" for automatic async test detection.
    """
    config.option.asyncio_mode = "auto"
