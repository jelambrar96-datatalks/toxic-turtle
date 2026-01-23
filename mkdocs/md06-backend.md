# 6. 🧪 Backend Architecture (Service Layer)

### Backend (FastAPI)

#### Authentication
- ✅ User registration with validation
- ✅ Email/password login with JWT tokens
- ✅ OAuth2 support (Google, Facebook)
- ✅ Secure password hashing
- ✅ 24-hour token expiration
- ✅ Bearer token authorization

#### Game Mechanics
- ✅ 4 game levels with progression
- ✅ Sequential level unlocking (can't skip)
- ✅ Code execution tracking
- ✅ Movement validation
- ✅ Cursor position management

#### Data Persistence
- ✅ User management (create, read, update)
- ✅ Progress tracking (level completions)
- ✅ Certificate management (unique per user)
- ✅ OAuth account linking

#### API Endpoints
- ✅ `/auth/register` - User registration
- ✅ `/auth/login` - User login
- ✅ `/auth/me` - Get current user
- ✅ `/game/current_level` - Get progress
- ✅ `/game/get_level_data` - Get level content
- ✅ `/game/pass_level` - Record completion
- ✅ `/game/check_pass_all_level` - Check all done
- ✅ `/game/register_certificate` - Create certificate
- ✅ `/game/get_certified_data` - List certificates
- ✅ `/game/check_if_certified_exist` - Check cert exists


### FastAPI Structure

```
backend/
├── routers/
│   ├── auth.py
│   ├── game.py
│   └── certificate.py
│
├── models/
│   ├── user.py
│   ├── progress.py
│   └── certificate.py
│
├── services/
│   ├── level_service.py
│   └── certificate_service.py
```

### Why FastAPI?

* Strong API contracts
* Automatic docs
* Async-ready
* Ideal for frontend-driven games

----

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | FastAPI | 0.104.1 |
| ORM | SQLAlchemy | 2.0.23 |
| Database | SQLite | (with aiosqlite) |
| Authentication | fastapi-users | 15.0.3 |
| JWT | python-jose | latest |
| Password Hashing | passlib | latest |
| Environment | python-dotenv | latest |


---

## 🗄️ Data Architecture

### Core Entities

| Entity      | Purpose           |
| ----------- | ----------------- |
| User        | Identity          |
| Progress    | Level tracking    |
| Level       | Game instructions |
| Certificate | Completion proof  |

The database is **replaceable**:

* SQLite for learning
* PostgreSQL for production


