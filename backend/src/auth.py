"""Authentication setup with fastapi-users."""

import logging

from typing import Optional, Union
from uuid import UUID

from fastapi import Depends, Request, HTTPException, status
from fastapi_users import BaseUserManager, FastAPIUsers, InvalidPasswordException
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.config import settings
from src.database import get_async_session
from src.models import User, get_user_db
from src.schemas.user_schemas import UserCreate


class UserManager(BaseUserManager[User, UUID]):
    """Custom user manager with duplicate email/username handling."""

    reset_password_token_secret = settings.SECRET_KEY
    verification_token_secret = settings.SECRET_KEY

    async def on_after_register(
        self, user: User, request: Optional[Request] = None
    ) -> None:
        """Called after successful user registration."""
        logging.info(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ) -> None:
        """Called after forgot password request."""
        logging.info(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ) -> None:
        """Called after verification request."""
        logging.info(f"Verification requested for user {user.id}. Verification token: {token}")

    async def validate_password(
            self,
            password: str,
            user: Union[UserCreate, User],
        ) -> None:
        if len(password) < 8:
            raise InvalidPasswordException(
                reason="Password should be at least 8 characters"
            )
        
        # Check if password contains at least one letter
        if not any(c.isalpha() for c in password):
            raise InvalidPasswordException(
                reason="Password must contain at least one letter"
            )
        
        # Check if password contains at least one number
        if not any(c.isdigit() for c in password):
            raise InvalidPasswordException(
                reason="Password must contain at least one number"
            )

    async def create(
        self,
        user_create: UserCreate,
        safe: bool = False,
        request: Optional[Request] = None,
    ) -> User:
        """Create user with duplicate email/username validation."""
        # Check if email already exists
        existing_email = await self.user_db.session.execute(
            select(User).where(User.email == user_create.email)
        )
        if existing_email.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered. Please use a different email.",
            )

        # Check if username already exists
        existing_username = await self.user_db.session.execute(
            select(User).where(User.username == user_create.username)
        )
        if existing_username.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken. Please choose a different username.",
            )

        # Call parent create method if validation passes
        return await super().create(user_create, safe=safe, request=request)

    def parse_id(self, value: any) -> UUID:
        """Parse a string ID to UUID."""
        if isinstance(value, UUID):
            return value
        try:
            return UUID(value)
        except (ValueError, TypeError):
            raise InvalidPasswordException(
                reason="Invalid user ID format"
            )


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
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
fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [jwt_authentication],
)

# Current user dependencies
current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)