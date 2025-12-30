"""Reusable FastAPI dependencies for authentication."""
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from auth import models
from auth.constants import COOKIE_ACCESS_TOKEN
from auth.database import get_db
from auth.security import decode_access_token


def get_optional_user(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    token = request.cookies.get(COOKIE_ACCESS_TOKEN)
    if not token:
        return None

    try:
        payload = decode_access_token(token)
    except Exception:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    return db.query(models.User).filter(models.User.id == user_id).first()


def require_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> models.User:
    user = get_optional_user(request, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


def require_verified_user(
    current_user: models.User = Depends(require_current_user),
) -> models.User:
    if not current_user.is_email_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified")
    return current_user
