"""OAuth configuration for Google and Facebook."""
from typing import Optional

from fastapi_users.authentication import AuthenticationBackend, BearerTransport
from fastapi_users.authentication.strategy.jwt import JWTStrategy
from httpx_oauth.clients.google import GoogleOAuth2
from httpx_oauth.clients.facebook import FacebookOAuth2

from src.config import settings
from src.auth import get_jwt_strategy, fastapi_users

# Configure OAuth2 clients
google_oauth_client: Optional[GoogleOAuth2] = None
# facebook_oauth_client: Optional[FacebookOAuth2] = None # TODO: enable

if settings.GOOGLE_OAUTH_CLIENT_ID and settings.GOOGLE_OAUTH_CLIENT_SECRET:
    google_oauth_client = GoogleOAuth2(
        client_id=settings.GOOGLE_OAUTH_CLIENT_ID,
        client_secret=settings.GOOGLE_OAUTH_CLIENT_SECRET,
    )

"""
# TODO: enable facebook auth2
if settings.FACEBOOK_OAUTH_CLIENT_ID and settings.FACEBOOK_OAUTH_CLIENT_SECRET:
    facebook_oauth_client = FacebookOAuth2(
        client_id=settings.FACEBOOK_OAUTH_CLIENT_ID,
        client_secret=settings.FACEBOOK_OAUTH_CLIENT_SECRET,
    )
"""


