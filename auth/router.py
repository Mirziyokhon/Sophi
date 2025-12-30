"""
FastAPI router for authentication endpoints.
"""
from datetime import timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session

import config
from auth import models, schemas
from auth.constants import (
    COOKIE_ACCESS_TOKEN,
    COOKIE_REFRESH_TOKEN,
    REFRESH_COOKIE_MAX_AGE,
)
from auth.database import get_db, engine
from auth.email_service import (
    EmailService,
    build_password_reset_email,
    build_verification_email,
)
from auth.google_service import verify_google_id_token
from auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    generate_refresh_token_string,
    hash_refresh_token,
    now_utc,
)


models.Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/auth", tags=["auth"])


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    cookie_settings = {
        "httponly": True,
        "secure": config.APP_ENV == "production",
        "samesite": "lax",
        "domain": config.COOKIE_DOMAIN,
        "path": "/",
    }
    response.set_cookie(
        COOKIE_ACCESS_TOKEN,
        access_token,
        max_age=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **cookie_settings,
    )
    response.set_cookie(
        COOKIE_REFRESH_TOKEN,
        refresh_token,
        max_age=REFRESH_COOKIE_MAX_AGE,
        **cookie_settings,
    )


def clear_auth_cookies(response: Response):
    cookie_settings = {
        "httponly": True,
        "secure": config.APP_ENV == "production",
        "samesite": "lax",
        "domain": config.COOKIE_DOMAIN,
        "path": "/",
    }
    response.delete_cookie(COOKIE_ACCESS_TOKEN, **cookie_settings)
    response.delete_cookie(COOKIE_REFRESH_TOKEN, **cookie_settings)


def serialize_user(user: models.User) -> schemas.UserResponse:
    return schemas.UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        is_email_verified=user.is_email_verified,
        created_at=user.created_at,
    )


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_from_request(db: Session, request: Request) -> Optional[models.User]:
    token = request.cookies.get(COOKIE_ACCESS_TOKEN)
    if not token:
        return None
    from auth.security import decode_access_token

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
    except Exception:
        return None

    return db.query(models.User).filter(models.User.id == user_id).first()


def store_refresh_token(db: Session, user: models.User, token_value: str, request: Optional[Request]):
    record = models.RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(token_value),
        expires_at=now_utc() + timedelta(days=config.REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=request.headers.get("user-agent")[:250] if request else None,
        ip_address=request.client.host if request and request.client else None,
    )
    db.add(record)
    db.flush()


def find_refresh_record(db: Session, token_value: str) -> Optional[models.RefreshToken]:
    token_hash = hash_refresh_token(token_value)
    return (
        db.query(models.RefreshToken)
        .filter(models.RefreshToken.token_hash == token_hash)
        .first()
    )


def issue_tokens(db: Session, user: models.User, request: Optional[Request] = None):
    access_token = create_access_token(str(user.id), extra={"email": user.email})
    refresh_plain = generate_refresh_token_string()
    store_refresh_token(db, user, refresh_plain, request)
    refresh_jwt = create_refresh_token(str(user.id), extra={"token": refresh_plain})
    refresh_cookie_value = f"{refresh_plain}:{refresh_jwt}"
    return access_token, refresh_cookie_value


def parse_refresh_cookie(cookie_value: str):
    if not cookie_value:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
    try:
        plain, jwt_token = cookie_value.split(":", 1)
        payload = decode_refresh_token(jwt_token)
        token_plain = payload.get("token")
        if not token_plain or token_plain != plain:
            raise ValueError()
        return plain, payload
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")


def _ensure_aware(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def send_verification_email(db: Session, user: models.User):
    token = generate_refresh_token_string()
    expires = now_utc() + timedelta(hours=24)
    record = models.EmailVerificationToken(
        user_id=user.id,
        token=token,
        expires_at=expires,
    )
    db.add(record)

    link = f"{config.FRONTEND_BASE_URL}/verify-email?token={token}" if config.FRONTEND_BASE_URL else token
    email_service = EmailService()
    email_service.send_email(
        user.email,
        "Verify your Sophi account",
        build_verification_email(link, user.full_name),
    )


@router.post("/signup", response_model=schemas.AuthResponse)
def signup(
    payload: schemas.SignupRequest,
    response: Response,
    db: Session = Depends(get_db),
    http_request: Request = None,
):
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = models.User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    db.flush()

    send_verification_email(db, user)

    access_token, refresh_token = issue_tokens(db, user, request=http_request)
    set_auth_cookies(response, access_token, refresh_token)

    return schemas.AuthResponse(user=serialize_user(user))


@router.post("/verify-email", response_model=schemas.MessageResponse)
def verify_email(request: schemas.VerifyEmailRequest, db: Session = Depends(get_db)):
    token_record = (
        db.query(models.EmailVerificationToken)
        .filter(models.EmailVerificationToken.token == request.token)
        .first()
    )
    if not token_record or token_record.used_at:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    if _ensure_aware(token_record.expires_at) < now_utc():
        raise HTTPException(status_code=400, detail="Token expired")

    user = token_record.user
    user.is_email_verified = True
    token_record.used_at = now_utc()

    return schemas.MessageResponse(message="Email verified successfully")


@router.post("/resend-verification", response_model=schemas.MessageResponse)
def resend_verification(
    payload: schemas.ResendVerificationRequest, db: Session = Depends(get_db)
):
    user = get_user_by_email(db, payload.email)
    if not user:
        return schemas.MessageResponse(
            message="If the email exists, a fresh verification link was sent"
        )
    if user.is_email_verified:
        return schemas.MessageResponse(message="Email is already verified")

    send_verification_email(db, user)
    return schemas.MessageResponse(message="If the email exists, a fresh verification link was sent")


@router.post("/login", response_model=schemas.AuthResponse)
def login(
    payload: schemas.LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
    http_request: Request = None,
):
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash or ""):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token, refresh_token = issue_tokens(db, user, request=http_request)
    set_auth_cookies(response, access_token, refresh_token)

    return schemas.AuthResponse(user=serialize_user(user))


@router.post("/google", response_model=schemas.AuthResponse)
def google_login(
    payload: schemas.GoogleLoginRequest,
    response: Response,
    db: Session = Depends(get_db),
    http_request: Request = None,
):
    id_info = verify_google_id_token(payload.id_token)
    email = id_info.get("email")
    sub = id_info.get("sub")
    name = id_info.get("name")

    if not email or not sub:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    user = get_user_by_email(db, email)
    if not user:
        user = models.User(email=email, full_name=name, is_email_verified=True, google_user_id=sub)
        db.add(user)
        db.flush()
    else:
        user.google_user_id = user.google_user_id or sub
        user.is_email_verified = True

    access_token, refresh_value = issue_tokens(db, user, request=http_request)
    set_auth_cookies(response, access_token, refresh_value)

    return schemas.AuthResponse(user=serialize_user(user))


@router.post("/refresh", response_model=schemas.AuthResponse)
def refresh_session(response: Response, request: Request, db: Session = Depends(get_db)):
    refresh_cookie = request.cookies.get(COOKIE_REFRESH_TOKEN)
    plain, payload = parse_refresh_cookie(refresh_cookie)
    user_id = payload.get("sub")

    record = find_refresh_record(db, plain)
    expires_at = _ensure_aware(record.expires_at)
    if not record or record.revoked_at or (expires_at and expires_at < now_utc()):
        raise HTTPException(status_code=401, detail="Refresh token invalid")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token, refresh_cookie_value = issue_tokens(db, user, request=request)
    set_auth_cookies(response, access_token, refresh_cookie_value)

    return schemas.AuthResponse(user=serialize_user(user))


@router.post("/logout", response_model=schemas.MessageResponse)
def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    refresh_cookie = request.cookies.get(COOKIE_REFRESH_TOKEN)
    if refresh_cookie:
        try:
            plain, _ = parse_refresh_cookie(refresh_cookie)
            record = find_refresh_record(db, plain)
            if record:
                record.revoked_at = now_utc()
        except HTTPException:
            pass
    clear_auth_cookies(response)
    return schemas.MessageResponse(message="Logged out")


@router.post("/request-password-reset", response_model=schemas.MessageResponse)
def request_password_reset(payload: schemas.RequestPasswordReset, db: Session = Depends(get_db)):
    user = get_user_by_email(db, payload.email)
    if not user:
        return schemas.MessageResponse(message="If the email exists, a reset link was sent")

    token = generate_refresh_token_string()
    expires = now_utc() + timedelta(hours=1)
    record = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires,
    )
    db.add(record)

    link = f"{config.FRONTEND_BASE_URL}/reset-password?token={token}" if config.FRONTEND_BASE_URL else token
    email_service = EmailService()
    email_service.send_email(
        user.email,
        "Reset your Sophi password",
        build_password_reset_email(link, user.full_name),
    )

    return schemas.MessageResponse(message="If the email exists, a reset link was sent")


@router.post("/reset-password", response_model=schemas.MessageResponse)
def reset_password(payload: schemas.ResetPasswordConfirm, db: Session = Depends(get_db)):
    record = (
        db.query(models.PasswordResetToken)
        .filter(models.PasswordResetToken.token == payload.token)
        .first()
    )
    if not record or record.used_at or record.expires_at < now_utc():
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = record.user
    user.password_hash = hash_password(payload.new_password)
    record.used_at = now_utc()

    return schemas.MessageResponse(message="Password reset successful")


@router.get("/me", response_model=schemas.AuthResponse)
def get_current_user(db: Session = Depends(get_db), request: Request = None):
    user = get_user_from_request(db, request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return schemas.AuthResponse(user=serialize_user(user))
