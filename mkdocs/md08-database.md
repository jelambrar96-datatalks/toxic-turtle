# 8. Database Architecture

## Overview

The Toxic Turtle backend uses **PostgreSQL** as the persistent data store, with **SQLAlchemy** as the ORM (Object-Relational Mapper). The database is designed to support:

- User authentication and management
- OAuth2 integration
- Game progress tracking
- Certificate issuance and retrieval

All tables use **UUID primary keys** for better security and distributed system compatibility.

---

## Database Setup

### Connection Configuration

```python
# backend/src/config.py
DATABASE_URL = "postgresql+asyncpg://user:password@postgres:5432/toxic_turtle"

# backend/src/database.py
engine = create_async_engine(DATABASE_URL, echo=DEBUG)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)
```

**Key Features:**
- **Async SQLAlchemy**: Uses `asyncpg` driver for non-blocking I/O
- **AsyncSession**: Manages database connections asynchronously
- **Automatic Table Creation**: `create_db_and_tables()` on startup

### Initialization

```python
# backend/src/app.py - Lifespan events
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

async def lifespan(app: FastAPI):
    """Application lifespan - runs on startup/shutdown."""
    await create_db_and_tables()
    yield
```

---

## Database Tables

### 1. User Table

**Purpose:** Stores user account information and authentication credentials.

**File:** `backend/src/models.py` (SQLAlchemyBaseUserTableUUID)

**Columns:**

| Column | Type | Nullable | Unique | Index | Description |
|--------|------|----------|--------|-------|-------------|
| `id` | UUID | NO | YES | YES | Primary key - auto-generated |
| `email` | String(255) | NO | YES | YES | User email - unique identifier |
| `username` | String(255) | NO | YES | YES | Username - unique identifier |
| `hashed_password` | String(255) | NO | NO | NO | BCrypt hashed password |
| `is_active` | Boolean | NO | NO | NO | Account activation status (default: True) |
| `is_superuser` | Boolean | NO | NO | NO | Admin flag (default: False) |
| `is_verified` | Boolean | NO | NO | NO | Email verification status (default: False) |
| `created_at` | DateTime | NO | NO | YES | Account creation timestamp |
| `updated_at` | DateTime | NO | NO | NO | Last account update timestamp |

**Relationships:**
- `oauth_accounts` (1-to-many): OAuth2 accounts linked to this user
- `progress_records` (1-to-many): Level completion records
- `certificates` (1-to-many): Issued certificates

**Constraints:**
- Primary Key: `id` (UUID)
- Unique: `email`, `username`
- Cascade Delete: OAuth accounts, progress, certificates

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alice@example.com",
  "username": "alice_learns",
  "is_active": true,
  "is_verified": true,
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-01-20T14:22:00Z"
}
```

---

### 2. OAuthAccount Table

**Purpose:** Stores OAuth2 account information for users (Google, GitHub, etc.).

**File:** `backend/src/models.py` (SQLAlchemyBaseOAuthAccountTableUUID)

**Columns:**

| Column | Type | Nullable | Unique | Index | Description |
|--------|------|----------|--------|-------|-------------|
| `id` | UUID | NO | YES | YES | Primary key - auto-generated |
| `user_id` | UUID | NO | NO | YES | Foreign key to `user.id` |
| `oauth_name` | String(255) | NO | NO | NO | OAuth provider (e.g., "google", "github") |
| `account_id` | String(255) | NO | NO | YES | OAuth provider's user ID |
| `account_email` | String(255) | YES | NO | NO | Email from OAuth provider |

**Relationships:**
- `user` (many-to-1): Parent user account

**Constraints:**
- Primary Key: `id` (UUID)
- Foreign Key: `user_id` → `user.id` (CASCADE DELETE)
- Unique: Account combination (oauth_name + account_id per user)

**Purpose:**
- Allow users to sign in with Google, GitHub, or other OAuth2 providers
- Store OAuth provider's user ID for future authentication
- Maintain link between OAuth identity and app user

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "oauth_name": "google",
  "account_id": "115691234567890123456",
  "account_email": "alice@gmail.com"
}
```

---

### 3. Progress Table

**Purpose:** Tracks which levels each user has completed.

**File:** `backend/src/models.py`

**Columns:**

| Column | Type | Nullable | Unique | Index | Description |
|--------|------|----------|--------|-------|-------------|
| `id` | UUID | NO | YES | YES | Primary key - auto-generated |
| `user_id` | UUID | NO | NO | YES | Foreign key to `user.id` |
| `level` | Integer | NO | NO | YES | Level number (1-4) |
| `passed_at` | DateTime | NO | NO | YES | Timestamp when level was completed |

**Relationships:**
- `user` (many-to-1): The user who completed this level

**Constraints:**
- Primary Key: `id` (UUID)
- Foreign Key: `user_id` → `user.id` (CASCADE DELETE)
- Indexes: `user_id`, `level`, `passed_at` for fast queries

**Purpose:**
- Track game progression per user
- Record completion timestamp for analytics
- Support "continue" functionality (retrieve highest level)
- Prevent duplicate level completions

**Queries:**
```python
# Get user's current level
latest_progress = await session.execute(
    select(Progress).where(Progress.user_id == user_id)
    .order_by(Progress.level.desc()).limit(1)
)

# Check if user passed level 3
level_passed = await session.execute(
    select(Progress).where(
        (Progress.user_id == user_id) & (Progress.level == 3)
    )
)

# Get all levels a user has completed
all_progress = await session.execute(
    select(Progress).where(Progress.user_id == user_id)
    .order_by(Progress.level)
)
```

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "level": 1,
  "passed_at": "2026-01-16T12:45:30Z"
}
```

---

### 4. Certificate Table

**Purpose:** Stores certificates issued to users who complete all levels.

**File:** `backend/src/models.py`

**Columns:**

| Column | Type | Nullable | Unique | Index | Description |
|--------|------|----------|--------|-------|-------------|
| `id` | UUID | NO | YES | YES | Primary key - auto-generated |
| `user_id` | UUID | NO | NO | YES | Foreign key to `user.id` |
| `certificate_name` | String(255) | NO | NO | YES | Full name on certificate |
| `issued_at` | DateTime | NO | NO | YES | Timestamp when certificate was issued |

**Relationships:**
- `user` (many-to-1): The user who earned this certificate

**Constraints:**
- Primary Key: `id` (UUID)
- Foreign Key: `user_id` → `user.id` (CASCADE DELETE)
- Indexes: `user_id`, `certificate_name`, `issued_at` for fast queries

**Purpose:**
- Issue certificates when users complete all levels
- Store the name to print on certificate
- Support multiple certificates per user (if they retake the course)
- Track achievement timestamps

**Queries:**
```python
# Check if user has any certificate
cert_exists = await session.execute(
    select(Certificate).where(Certificate.user_id == user_id).limit(1)
)

# Get all user's certificates
certs = await session.execute(
    select(Certificate).where(Certificate.user_id == user_id)
    .order_by(Certificate.issued_at.desc())
)

# Get certificate by user and name
cert = await session.execute(
    select(Certificate).where(
        (Certificate.user_id == user_id) & 
        (Certificate.certificate_name == name)
    )
)
```

**Example:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440020",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "certificate_name": "Alice Smith",
  "issued_at": "2026-01-20T16:30:00Z"
}
```

---

## Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌──────────────────┐                   ┌──────────────────┐    │
│  │      USER        │                   │   OAUTHACCOUNT   │    │
│  ├──────────────────┤                   ├──────────────────┤    │
│  │ PK: id (UUID)    │─────────────────┬─│ PK: id (UUID)    │    │
│  │ email (UNIQUE)   │     1      *     │ │ FK: user_id      │    │
│  │ username (UNIQUE)│                  │ │ oauth_name       │    │
│  │ hashed_password  │                  │ │ account_id       │    │
│  │ is_active        │                  │ │ account_email    │    │
│  │ is_verified      │                  └─│                  │    │
│  │ created_at       │                    └──────────────────┘    │
│  │ updated_at       │                                            │
│  │                  │                                            │
│  │                  │     ┌────────────────┬────────────────┐   │
│  │                  │─────│                │                │   │
│  │                  │  1  │   *            │   *            │   │
│  └──────────────────┘     │                │                │   │
│                   ┌────────────────┐   ┌──────────────────┐ │   │
│                   │    PROGRESS    │   │  CERTIFICATE     │ │   │
│                   ├────────────────┤   ├──────────────────┤ │   │
│                   │ PK: id (UUID)  │   │ PK: id (UUID)    │─┘   │
│                   │ FK: user_id    │   │ FK: user_id      │     │
│                   │ level          │   │ certificate_name │     │
│                   │ passed_at      │   │ issued_at        │     │
│                   └────────────────┘   └──────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Legend:
  PK = Primary Key
  FK = Foreign Key
  1  = One (parent side)
  *  = Many (child side)
  
Relationships:
  1 User        → Many OAuthAccounts
  1 User        → Many Progress records
  1 User        → Many Certificates
```

---

## Data Flow

### User Registration Flow

```
1. User submits registration form
   (email, username, password)
   ↓
2. Backend hashes password with bcrypt
   ↓
3. Create User record:
   - id: generated UUID
   - email: provided
   - username: provided
   - hashed_password: bcrypt hash
   - is_active: true
   - is_verified: false (email verification pending)
   - created_at: current time
   ↓
4. User record inserted into "user" table
   ↓
5. Return UserRead schema with id
```

### Game Progress Tracking

```
1. User completes a level
   ↓
2. Frontend sends POST /game/pass_level
   ↓
3. Backend validates input
   ↓
4. Create Progress record:
   - id: generated UUID
   - user_id: from JWT token
   - level: from request
   - passed_at: current time
   ↓
5. Progress record inserted into "progress" table
   ↓
6. Check if all levels completed:
   SELECT COUNT(*) FROM progress WHERE user_id = ? AND level IN (1,2,3,4)
   ↓
7. If count == 4: all levels passed
```

### Certificate Issuance

```
1. User completes all 4 levels (detected by progress count)
   ↓
2. Frontend sends POST /game/register_certificate
   with certificate_name (user's full name)
   ↓
3. Backend checks if cert already exists:
   SELECT * FROM certificate WHERE user_id = ? LIMIT 1
   ↓
4. If not exists:
   Create Certificate record:
   - id: generated UUID
   - user_id: from JWT token
   - certificate_name: from request
   - issued_at: current time
   ↓
5. Certificate record inserted into "certificate" table
   ↓
6. Return certificate details to frontend
```

---

## Indexes

**Indexes improve query performance for common queries.**

| Table | Column | Type | Purpose |
|-------|--------|------|---------|
| user | email | UNIQUE | Fast user lookup by email |
| user | username | UNIQUE | Fast user lookup by username |
| user | id | PRIMARY | Unique constraint, primary joins |
| user | created_at | BTREE | Sort users by registration time |
| progress | user_id | BTREE | Find all levels for a user |
| progress | level | BTREE | Find users who completed a level |
| progress | passed_at | BTREE | Sort progress by completion time |
| certificate | user_id | BTREE | Find all certificates for a user |
| certificate | certificate_name | BTREE | Search certificates by name |
| certificate | issued_at | BTREE | Sort certificates by issue date |
| oauthaccount | user_id | BTREE | Find OAuth accounts for a user |

---

## Async Database Operations

### Session Management

All database operations use **AsyncSession** for non-blocking I/O:

```python
# backend/src/database.py
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides async database session."""
    async with async_session_maker() as session:
        yield session
```

### Query Pattern

```python
from sqlalchemy import select

# Async context manager for database operations
async def get_user(user_id: UUID, session: AsyncSession):
    # Construct query
    query = select(User).where(User.id == user_id)
    
    # Execute asynchronously
    result = await session.execute(query)
    
    # Fetch single result
    user = result.scalar_one_or_none()
    
    return user
```

### Transactions

```python
# Automatic transaction management with AsyncSession
async def create_progress_and_check_all_passed(
    user_id: UUID, 
    level: int,
    session: AsyncSession
):
    # Create progress record
    progress = Progress(user_id=user_id, level=level)
    session.add(progress)
    await session.flush()  # Insert but don't commit yet
    
    # Check if all levels are passed
    query = select(Progress).where(Progress.user_id == user_id)
    result = await session.execute(query)
    all_progress = result.scalars().all()
    
    all_passed = len(all_progress) == 4
    
    # Commit transaction if all successful
    await session.commit()
    
    return all_passed
```

---

## Database Migrations (Future)

When making schema changes, use **Alembic** (SQLAlchemy migration tool):

```bash
# Initialize migrations
alembic init migrations

# Create a migration
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Rollback migrations
alembic downgrade -1
```

---

## Performance Considerations

### 1. **Connection Pooling**
```python
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=20,  # Max connections in pool
    max_overflow=10  # Extra connections if needed
)
```

### 2. **Lazy Loading vs Eager Loading**
```python
# Lazy loading (default) - load relationships only when accessed
user_schema = UserRead.from_orm(user)  # Doesn't load relationships

# Eager loading - load relationships immediately
user = await session.execute(
    select(User)
    .options(selectinload(User.progress_records))
    .where(User.id == user_id)
)
```

### 3. **Batch Queries**
```python
# Efficient: get all user data in one query
query = select(User).where(User.is_active == True)
result = await session.execute(query)
users = result.scalars().all()
```

---

## Security Features

### 1. **Password Hashing**
Passwords are hashed using **bcrypt** (via fastapi-users):
- Never stored in plain text
- One-way encryption
- Salt included per password

### 2. **UUID Primary Keys**
```python
id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
```
- Harder to guess user IDs (vs sequential integers)
- Better for distributed systems
- Privacy enhancement

### 3. **Foreign Key Constraints**
```python
user_id: Mapped[UUID] = mapped_column(
    ForeignKey("user.id", ondelete="CASCADE"), 
    index=True
)
```
- Referential integrity
- Cascade deletion: removing user deletes all their data
- Index for fast lookups

### 4. **Audit Timestamps**
```python
created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)
```
- Track when records were created/modified
- Support audit logs
- Detect suspicious activities

---

## Backup & Recovery

### Docker Compose Volume

```yaml
# docker-compose.yaml
services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Persists data
    environment:
      POSTGRES_DB: toxic_turtle
      POSTGRES_USER: toxic_user
      POSTGRES_PASSWORD: secure_password
```

### Backup Commands

```bash
# Backup entire database
docker-compose exec postgres pg_dump \
  -U toxic_user toxic_turtle > backup.sql

# Restore from backup
docker-compose exec -T postgres psql \
  -U toxic_user toxic_turtle < backup.sql

# Backup single table
docker-compose exec postgres pg_dump \
  -U toxic_user -t "user" toxic_turtle > users_backup.sql
```

---

## Database Monitoring

### Connection Statistics

```python
# Check active connections
SELECT datname, count(*) as connection_count 
FROM pg_stat_activity 
GROUP BY datname;
```

### Table Size

```python
# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Query Performance

```python
# Enable slow query logging
log_statement = 'all'  # log_min_duration_ms = 1000 (1 second)
```

---

## Summary Table

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Type** | PostgreSQL | Reliable relational database |
| **ORM** | SQLAlchemy | Pythonic database access |
| **Async** | AsyncIO + asyncpg | Non-blocking operations |
| **Primary Keys** | UUID | Security & distributed systems |
| **Relationships** | Foreign Keys + SQLAlchemy relationship() | Data integrity |
| **Cascade Delete** | ON DELETE CASCADE | Clean data removal |
| **Indexes** | BTREE on foreign keys & timestamps | Query performance |
| **Validation** | Pydantic + SQLAlchemy | Data integrity |
| **Schemas** | Pydantic models (user_schemas.py, game_schemas.py) | Request/response validation |

---

## Next Steps

- **Add migrations** with Alembic for version control
- **Set up monitoring** with pg_stat_statements
- **Implement caching** with Redis for frequently accessed data
- **Archive old records** (certificates, progress logs) to reduce table size

---

**Database Architecture Summary:**
- 4 core tables (User, OAuthAccount, Progress, Certificate)
- UUID primary keys for security
- Async operations for performance
- Referential integrity with cascade deletion
- Comprehensive indexing for query optimization
- Complete audit trails with timestamps

