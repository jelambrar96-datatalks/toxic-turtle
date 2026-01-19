"""Authentication setup with fastapi-users."""

from typing import Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import BaseUserDatabase

from src.config import settings
from src.database import get_async_session
from src.models import User, get_user_db


class UserManager(BaseUserManager[User, int]):
    """Custom user manager."""

    reset_password_token_secret = settings.SECRET_KEY
    verification_token_secret = settings.SECRET_KEY

    async def on_after_register(
        self, user: User, request: Optional[Request] = None
    ) -> None:
        """Called after successful user registration."""
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ) -> None:
        """Called after forgot password request."""
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ) -> None:
        """Called after verification request."""
        print(f"Verification requested for user {user.id}. Verification token: {token}")


async def get_user_manager(user_db: BaseUserDatabase = Depends(get_user_db)):
    """Get user manager dependency."""
    yield UserManager(user_db)


# JWT Bearer Transport and Strategy
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    """Get JWT strategy."""
    return JWTStrategy(
        secret=settings.SECRET_KEY,
        lifetime_seconds=settings.JWT_EXPIRATION_HOURS * 3600,
        algorithm=settings.JWT_ALGORITHM,
    )


# JWT Authentication Backend
jwt_authentication = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# FastAPIUsers instance
fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [jwt_authentication],
)

# Current user dependencies
current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)
