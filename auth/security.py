"""
Security utilities: password hashing, JWT helpers, refresh token hashing.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import hashlib
import secrets

from jose import JWTError, jwt
from passlib.context import CryptContext

import config


ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    if not password_hash:
        return False
    return pwd_context.verify(password, password_hash)


def _create_token(
    data: Dict[str, Any],
    secret: str,
    expires_delta: timedelta,
) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret, algorithm=ALGORITHM)


def create_access_token(subject: str, extra: Optional[Dict[str, Any]] = None) -> str:
    if not config.JWT_SECRET_KEY:
        raise RuntimeError("JWT_SECRET_KEY is not configured")
    expires = timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject}
    if extra:
        payload.update(extra)
    return _create_token(payload, config.JWT_SECRET_KEY, expires)


def create_refresh_token(subject: str, extra: Optional[Dict[str, Any]] = None) -> str:
    if not config.JWT_REFRESH_SECRET_KEY:
        raise RuntimeError("JWT_REFRESH_SECRET_KEY is not configured")
    expires = timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": subject, "jti": secrets.token_hex(8)}
    if extra:
        payload.update(extra)
    return _create_token(payload, config.JWT_REFRESH_SECRET_KEY, expires)


def decode_access_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, config.JWT_SECRET_KEY, algorithms=[ALGORITHM])


def decode_refresh_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, config.JWT_REFRESH_SECRET_KEY, algorithms=[ALGORITHM])


def generate_refresh_token_string() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
