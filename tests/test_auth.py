"""Auth router smoke tests."""
import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("JWT_REFRESH_SECRET_KEY", "test-refresh")
os.environ.setdefault("COOKIE_DOMAIN", "")
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("SENDGRID_API_KEY", "dummy")
os.environ.setdefault("EMAIL_FROM_ADDRESS", "test@example.com")
os.environ.setdefault("GOOGLE_CLIENT_ID", "dummy-google-client")

from fastapi.testclient import TestClient
import pytest
from unittest.mock import patch

from api_server import app, config
from auth import models
from auth.database import engine

config.JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
config.JWT_REFRESH_SECRET_KEY = os.environ["JWT_REFRESH_SECRET_KEY"]


@pytest.fixture(autouse=True)
def reset_database():
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)
    yield
    models.Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    with patch("auth.router.EmailService") as mock_service:
        mock_service.return_value.send_email.return_value = None
        with TestClient(app) as client:
            yield client


def test_signup_and_me_flow(client):
    payload = {
        "email": "test@example.com",
        "password": "securepassword",
        "full_name": "Test User",
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == payload["email"]

    me_response = client.get("/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["user"]["email"] == payload["email"]


def test_login_with_invalid_credentials(client):
    client.post(
        "/auth/signup",
        json={"email": "login@example.com", "password": "securepassword", "full_name": "User"},
    )

    response = client.post(
        "/auth/login",
        json={"email": "login@example.com", "password": "wrongpass"},
    )
    assert response.status_code == 401


def test_refresh_and_logout_flow(client):
    client.post(
        "/auth/signup",
        json={
            "email": "refresh@example.com",
            "password": "securepassword",
            "full_name": "Refresh User",
        },
    )

    refresh_response = client.post("/auth/refresh")
    assert refresh_response.status_code == 200

    logout_response = client.post("/auth/logout")
    assert logout_response.status_code == 200

    me_response = client.get("/auth/me")
    assert me_response.status_code == 401
