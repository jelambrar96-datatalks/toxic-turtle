# Pytest Fixtures Quick Reference

## Overview

Complete pytest fixture guide for Toxic Turtle backend testing with automatic database migrations and table creation.

---

## Fixture Summary Table

### Database Setup Fixtures

```
test_engine
├─ SQLite in-memory database
├─ Auto-creates all tables
├─ Function scope (fresh DB per test)
└─ Use: Low-level database testing

test_db_session
├─ AsyncSession from test_engine
├─ Overrides get_async_session
├─ Function scope
└─ Use: Most tests with DB access

db_with_verified_migrations
├─ test_engine + validation
├─ Verifies all tables created
├─ Fails if any table missing
└─ Use: Critical tests requiring guarantee

test_session_with_verified_migrations
├─ test_db_session + validation
├─ Guaranteed table existence
├─ Overrides dependencies
└─ Use: Complex multi-table tests
```

### User Fixtures (Base Objects)

```
authenticated_user
├─ email: test@example.com
├─ username: testuser
├─ is_active: True
├─ is_verified: True
└─ Use: General auth tests

test_user_with_progress
├─ email: progress@example.com
├─ username: progressuser
├─ Progress: Levels 1,2,3 (not 4)
└─ Use: Partial progress tests

test_user_with_all_levels_complete
├─ email: alllevels@example.com
├─ username: allleveluser
├─ Progress: All 4 levels done
└─ Use: Pre-certification tests

test_user_with_certificate
├─ email: certified@example.com
├─ username: certuser
├─ Progress: All 4 levels
├─ Certificate: "Test User"
└─ Use: Certificate-related tests

test_user_with_oauth
├─ email: oauth@example.com
├─ username: oauthuser
├─ OAuth: Google (account_id: 115691...)
└─ Use: OAuth integration tests
```

### Mock Fixtures (Dependency Override)

```
mock_authenticated_user
├─ Mocks: current_active_user
├─ User: authenticated_user
├─ Use: API endpoint tests

mock_user_with_progress
├─ Mocks: current_active_user
├─ User: test_user_with_progress
├─ Use: Progress API tests

mock_user_with_all_levels
├─ Mocks: current_active_user
├─ User: test_user_with_all_levels_complete
├─ Use: Level completion tests

mock_user_with_certificate
├─ Mocks: current_active_user
├─ User: test_user_with_certificate
├─ Use: Certificate API tests

mock_user_with_oauth
├─ Mocks: current_active_user
├─ User: test_user_with_oauth
├─ Use: OAuth endpoint tests
```

---

## Usage Patterns

### Pattern 1: Simple Database Test

```python
@pytest.mark.asyncio
async def test_create_user(test_db_session):
    """Database tables auto-created by test_engine."""
    # test_db_session automatically includes all tables
    user = User(email="test@example.com", username="test")
    test_db_session.add(user)
    await test_db_session.commit()
    
    assert user.id is not None
```

**What happens:**
1. `test_db_session` depends on `test_engine`
2. `test_engine` creates SQLite `:memory:` database
3. All tables created from `Base.metadata` (migrations)
4. AsyncSession provided for database operations
5. After test: all tables dropped, database disposed

---

### Pattern 2: API Endpoint Test with Mock User

```python
@pytest.mark.asyncio
async def test_get_current_level(mock_user_with_progress):
    """Test API endpoint with mocked authenticated user."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.get("/game/current_level")
        
        assert response.status_code == 200
        assert response.json()["current_level"] == 3
```

**What happens:**
1. `mock_user_with_progress` fixture applied
2. `current_active_user` dependency overridden
3. User with levels 1,2,3 provided to endpoint
4. No database needed (mocked user)
5. After test: overrides cleared

---

### Pattern 3: Complex Test with DB + Mock User

```python
@pytest.mark.asyncio
async def test_pass_and_get_certificate(
    mock_user_with_all_levels,
    test_db_session
):
    """Test with both mocked user AND database session."""
    # Use mocked user for API calls
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.post(
            "/game/register_certificate",
            json={"certificate_name": "John Doe"}
        )
        assert response.status_code == 200
    
    # Use test_db_session to verify database state
    certs = await test_db_session.execute(
        select(Certificate).where(
            Certificate.user_id == mock_user_with_all_levels.id
        )
    )
    assert len(certs.scalars().all()) == 1
```

**What happens:**
1. `mock_user_with_all_levels` provides authenticated user
2. `test_db_session` provides database access
3. Both fixtures applied in single test
4. Can test API behavior AND database state
5. After test: tables dropped, overrides cleared

---

### Pattern 4: Verified Migrations Test

```python
@pytest.mark.asyncio
async def test_critical_feature(test_session_with_verified_migrations):
    """
    Critical test that REQUIRES all tables to exist.
    
    Validates table creation before test runs.
    """
    # This test ONLY runs if all tables verified exist
    # Fails immediately if any table missing
    
    progress = Progress(
        user_id=UUID("550e8400-e29b-41d4-a716-446655440000"),
        level=1
    )
    test_session_with_verified_migrations.add(progress)
    await test_session_with_verified_migrations.commit()
    
    # Assert...
```

**What happens:**
1. `test_session_with_verified_migrations` depends on `db_with_verified_migrations`
2. `db_with_verified_migrations` validates all tables created
3. Test fails at fixture setup if validation fails
4. Ensures test never runs with incomplete database

---

## Fixture Dependency Chain

### Scenario: Using `mock_user_with_certificate`

```
mock_user_with_certificate fixture
    ↓
    └─→ test_user_with_certificate fixture
            ↓
            └─→ test_db_session fixture
                    ↓
                    └─→ test_engine fixture
                            ↓
                            ├─ Creates SQLite :memory: database
                            ├─ Creates all tables (migrations)
                            └─ Returns AsyncEngine
                    ↑
            test_db_session uses test_engine
            ├─ Creates async session maker
            ├─ Overrides get_async_session dependency
            └─ Returns AsyncSession

        test_user_with_certificate uses test_db_session
        ├─ Creates User in database
        ├─ Adds Progress records (levels 1-4)
        ├─ Adds Certificate record
        └─ Returns User object

mock_user_with_certificate uses test_user_with_certificate
├─ Overrides current_active_user dependency
├─ Returns User with certificate
└─ Clears overrides after test
```

---

## Common Test Scenarios

### Scenario 1: Test User Registration

```python
@pytest.mark.asyncio
async def test_register_new_user(test_db_session):
    """Fixture needed: test_db_session (includes migrations)"""
    async with AsyncClient(...) as client:
        response = await client.post(
            "/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "password123"
            }
        )
        assert response.status_code == 201
```

**Fixtures:** `test_db_session`

---

### Scenario 2: Test Get Current Level

```python
@pytest.mark.asyncio
async def test_current_level(mock_user_with_progress):
    """Fixture needed: mock_user_with_progress (no DB needed)"""
    async with AsyncClient(...) as client:
        response = await client.get("/game/current_level")
        assert response.json()["current_level"] == 3
```

**Fixtures:** `mock_user_with_progress`

---

### Scenario 3: Test Certificate Issuance

```python
@pytest.mark.asyncio
async def test_issue_certificate(
    mock_user_with_all_levels,
    test_session_with_verified_migrations
):
    """
    Fixtures needed:
    - mock_user_with_all_levels (mocked auth user)
    - test_session_with_verified_migrations (verified DB)
    """
    async with AsyncClient(...) as client:
        # Test API
        response = await client.post(
            "/game/register_certificate",
            json={"certificate_name": "User Name"}
        )
        assert response.status_code == 200
        
    # Verify database
    certs = await test_session_with_verified_migrations.execute(
        select(Certificate)
    )
    assert len(certs.scalars().all()) == 1
```

**Fixtures:** `mock_user_with_all_levels`, `test_session_with_verified_migrations`

---

### Scenario 4: Test OAuth Login

```python
@pytest.mark.asyncio
async def test_oauth_user_endpoint(mock_user_with_oauth):
    """Fixture needed: mock_user_with_oauth (OAuth user)"""
    async with AsyncClient(...) as client:
        response = await client.get("/auth/me")
        data = response.json()
        assert data["oauth_accounts"][0]["oauth_name"] == "google"
```

**Fixtures:** `mock_user_with_oauth`

---

## Fixture Decision Tree

```
Need to test API endpoint?
├─ YES: Do you need database state verification?
│   ├─ NO: Use mock_user_* fixtures (API testing only)
│   └─ YES: Use mock_user_* + test_session_with_verified_migrations
│
├─ NO: Testing database directly?
│   ├─ Simple query: Use test_db_session
│   └─ Complex operations: Use test_session_with_verified_migrations
│
└─ Testing table creation/migrations?
    └─ Use db_with_verified_migrations
```

---

## Running Tests

### Run All Tests
```bash
pytest
```

### Run Specific Test
```bash
pytest test/test_auth.py::test_register_user
```

### Run With Debug Output
```bash
pytest -v -s --log-cli-level=DEBUG
```

### Run With Coverage
```bash
pytest --cov=src --cov-report=html
```

### Run Only Authentication Tests
```bash
pytest test/test_auth.py -v
```

### Run Only Game Tests
```bash
pytest test/test_game.py -v
```

---

## Fixture Inspection

### View All Available Fixtures
```bash
pytest --fixtures
```

### View Fixtures for Specific File
```bash
pytest test/test_auth.py --fixtures
```

### View Fixture Docstrings
```bash
pytest --fixtures | grep -A 5 "mock_authenticated_user"
```

---

## Notes

- **Database**: SQLite in-memory (`:memory:`) for speed
- **Migrations**: Auto-run on test_engine creation (creates all tables)
- **Scope**: Function scope = fresh database per test
- **Cleanup**: Automatic (fixtures handle teardown)
- **Async**: All fixtures are async-compatible
- **Mocking**: Dependency overrides clear automatically

