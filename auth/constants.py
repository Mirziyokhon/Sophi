"""Shared constants for authentication."""

import config

COOKIE_ACCESS_TOKEN = "sophi_access_token"
COOKIE_REFRESH_TOKEN = "sophi_refresh_token"
REFRESH_COOKIE_MAX_AGE = config.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
