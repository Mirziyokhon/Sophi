"""
Helpers for verifying Google ID tokens using google-auth.
"""
from google.oauth2 import id_token
from google.auth.transport import requests

import config


def verify_google_id_token(token: str) -> dict:
    if not config.GOOGLE_CLIENT_ID:
        raise RuntimeError("GOOGLE_CLIENT_ID is not configured")

    request = requests.Request()
    return id_token.verify_oauth2_token(token, request, config.GOOGLE_CLIENT_ID)
