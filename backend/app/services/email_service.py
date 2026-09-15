from __future__ import annotations

from app.core.config import get_settings
from app.core.exceptions import ServiceUnavailableError


class EmailProvider:
    async def send_otp(self, *, to_email: str, code: str, purpose: str) -> None:
        raise NotImplementedError


class AzureCommunicationEmailProvider(EmailProvider):
    async def send_otp(self, *, to_email: str, code: str, purpose: str) -> None:
        settings = get_settings()
        if not getattr(settings, "AZURE_COMMUNICATION_CONNECTION_STRING", None) or not getattr(settings, "AZURE_EMAIL_SENDER_ADDRESS", None):
            raise ServiceUnavailableError(
                "Email provider is not configured.",
                code="EMAIL_PROVIDER_NOT_CONFIGURED",
            )
        try:
            from azure.communication.email import EmailClient

            client = EmailClient.from_connection_string(
                settings.AZURE_COMMUNICATION_CONNECTION_STRING
            )
            message = {
                "senderAddress": settings.AZURE_EMAIL_SENDER_ADDRESS,
                "recipients": {"to": [{"address": to_email}]},
                "content": {
                    "subject": f"Life Link {purpose} verification code",
                    "plainText": f"Your Life Link verification code is {code}. It expires in 1 minute.",
                },
            }
            poller = client.begin_send(message)
            poller.result()
        except ServiceUnavailableError:
            raise
        except Exception as exc:
            raise ServiceUnavailableError(
                "Email provider is unavailable.",
                code="EMAIL_PROVIDER_UNAVAILABLE",
            ) from exc


class FakeEmailProvider(EmailProvider):
    def __init__(self) -> None:
        self.sent: list[tuple[str, str, str]] = []

    async def send_otp(self, *, to_email: str, code: str, purpose: str) -> None:
        self.sent.append((to_email, code, purpose))
