from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth import jwt_authentication, fastapi_users
from src.config import settings
from src.database import get_async_session
from src.models import User
from src.oauth_config import google_oauth_client
from src.schemas.user_schemas import UserCreate, UserRead, UserUpdate


auth_routes = APIRouter(
    tags=["auth"]
)

# Include fastapi-users router
# JWT Login/Logout routes
auth_routes.include_router(
    fastapi_users.get_auth_router(jwt_authentication),
    prefix="/auth/jwt",
    tags=["auth"],
)

# User registration route with error handling
auth_routes.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

# User profile routes (get, update, delete)
auth_routes.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

if settings.GOOGLE_OAUTH_CLIENT_ID and settings.GOOGLE_OAUTH_CLIENT_SECRET:
    auth_routes.include_router(
        fastapi_users.get_oauth_router(google_oauth_client, jwt_authentication, settings.SECRET_KEY),
        prefix="/auth/google",
        tags=["auth"],
    )


# Example protected route
@auth_routes.get("/users/me", response_model=UserRead, tags=["users"])
async def get_current_user(user: User = Depends(fastapi_users.current_user(active=True))):
    """Get current authenticated user."""
    return user
