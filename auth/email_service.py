"""
Email sending helpers using SendGrid.
"""
from typing import Optional

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

import config


class EmailService:
    def __init__(self):
        if not config.SENDGRID_API_KEY:
            raise RuntimeError("SENDGRID_API_KEY is not configured")
        if not config.EMAIL_FROM_ADDRESS:
            raise RuntimeError("EMAIL_FROM_ADDRESS is not configured")

        self.client = SendGridAPIClient(config.SENDGRID_API_KEY)
        self.from_email = config.EMAIL_FROM_ADDRESS

    def send_email(self, to_email: str, subject: str, html_content: str) -> None:
        message = Mail(
            from_email=self.from_email,
            to_emails=to_email,
            subject=subject,
            html_content=html_content,
        )
        self.client.send(message)


def build_verification_email(link: str, user_name: Optional[str] = None) -> str:
    greeting = f"Hi {user_name}," if user_name else "Hi,"
    return f"""
        <p>{greeting}</p>
        <p>Thanks for signing up for Sophi. Please verify your email address by clicking the button below:</p>
        <p><a href="{link}" style="padding:12px 20px;background:#6c5ce7;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a></p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="{link}">{link}</a></p>
        <p>This link will expire in 24 hours.</p>
    """


def build_password_reset_email(link: str, user_name: Optional[str] = None) -> str:
    greeting = f"Hi {user_name}," if user_name else "Hi,"
    return f"""
        <p>{greeting}</p>
        <p>We received a request to reset your Sophi account password. Click the button below to choose a new password:</p>
        <p><a href="{link}" style="padding:12px 20px;background:#6c5ce7;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
        <p>If you did not request this, you can safely ignore this email. This link will expire in 1 hour.</p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="{link}">{link}</a></p>
    """
