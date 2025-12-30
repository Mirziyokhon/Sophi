"""
Pydantic schemas for authentication endpoints.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str]
    is_email_verified: bool
    created_at: datetime


class AuthResponse(BaseModel):
    success: bool = True
    user: UserResponse


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str]


class VerifyEmailRequest(BaseModel):
    token: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class RequestPasswordReset(BaseModel):
    email: EmailStr


class ResetPasswordConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class RefreshResponse(BaseModel):
    success: bool = True


class MessageResponse(BaseModel):
    success: bool = True
    message: str
