"""Main FastAPI application."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database import Base, engine
from src.config import settings
from src.auth import fastapi_users, jwt_authentication, current_active_user
from src.schemas import UserRead, UserCreate, UserUpdate
from src.models import User


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - create tables on startup."""
    # Startup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: Close engine
    await engine.dispose()


# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include fastapi-users router
# JWT Login/Logout routes
app.include_router(
    fastapi_users.get_auth_router(jwt_authentication),
    prefix="/auth/jwt",
    tags=["auth"],
)

# User registration route
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

# User profile routes (get, update, delete)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)


# Example protected route
@app.get("/users/me", response_model=UserRead, tags=["users"])
async def get_current_user(user: User = fastapi_users.current_user(active=True)):
    """Get current authenticated user."""
    return user


# Health check
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": settings.API_TITLE}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
