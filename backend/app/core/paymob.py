import hashlib
import hmac
import logging
from typing import Any
import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class PaymobClient:
    """Client for interacting with Paymob Unified Checkout (Intention API) and validating Webhooks."""

    def __init__(
        self,
        api_key: str | None = None,
        secret_key: str | None = None,
        public_key: str | None = None,
        hmac_secret: str | None = None,
        base_url: str | None = None,
        card_integration_id: int | None = None,
    ):
        settings = get_settings()
        self.api_key = api_key or settings.PAYMOB_API_KEY
        self.secret_key = secret_key or settings.PAYMOB_SECRET_KEY
        self.public_key = public_key or settings.PAYMOB_PUBLIC_KEY
        self.hmac_secret = hmac_secret or settings.PAYMOB_HMAC_SECRET
        self.base_url = (base_url or settings.PAYMOB_BASE_URL).rstrip("/")
        self.card_integration_id = card_integration_id or settings.PAYMOB_CARD_INTEGRATION_ID

    async def create_intention(
        self,
        amount: float,
        blood_request_id: str,
        currency: str = "EGP",
        payment_methods: list[int | str] | None = None,
        billing_data: dict[str, Any] | None = None,
        customer: dict[str, Any] | None = None,
        items: list[dict[str, Any]] | None = None,
        notification_url: str | None = None,
        redirection_url: str | None = None,
    ) -> dict[str, Any]:
        """Creates a payment intention via Paymob Unified Checkout API."""
        amount_cents = int(round(amount * 100))
        if amount_cents <= 0:
            raise ValueError("Amount must be greater than zero.")

        default_billing = {
            "first_name": "Hospital",
            "last_name": "Representative",
            "phone_number": "+201000000000",
            "email": "hospital@lifelink.org",
        }
        default_customer = {
            "first_name": "Hospital",
            "last_name": "Representative",
            "email": "hospital@lifelink.org",
        }
        default_items = [
            {
                "name": f"Blood Request {blood_request_id}",
                "amount": amount_cents,
                "description": f"Life Link payment for blood request {blood_request_id}",
                "quantity": 1,
            }
        ]

        # Resolve payment methods: Paymob Unified Checkout expects integration IDs (e.g. [5912806])
        resolved_methods: list[int | str] = []
        raw_methods = payment_methods or ["card"]
        for m in raw_methods:
            if isinstance(m, int):
                resolved_methods.append(m)
            elif isinstance(m, str) and m.isdigit():
                resolved_methods.append(int(m))
            elif m == "card":
                if self.card_integration_id:
                    resolved_methods.append(int(self.card_integration_id))
                else:
                    resolved_methods.append(m)
            else:
                resolved_methods.append(m)

        payload = {
            "amount": amount_cents,
            "currency": currency,
            "payment_methods": resolved_methods,
            "items": items or default_items,
            "billing_data": billing_data or default_billing,
            "customer": customer or default_customer,
            "special_reference": str(blood_request_id),
            "extras": {
                "blood_request_id": str(blood_request_id),
            },
        }
        if notification_url:
            payload["notification_url"] = notification_url
        if redirection_url:
            payload["redirection_url"] = redirection_url

        headers = {
            "Authorization": f"Token {self.secret_key}",
            "Content-Type": "application/json",
        }

        url = f"{self.base_url}/v1/intention/"
        logger.info(
            "Initiating Paymob intention for blood_request %s (amount: %s %s, methods: %s)",
            blood_request_id,
            amount,
            currency,
            resolved_methods,
        )

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code == 400 and "already exists" in response.text:
                    import time
                    payload["special_reference"] = f"{blood_request_id}_{int(time.time())}"
                    logger.info("Retrying Paymob intention with updated reference: %s", payload["special_reference"])
                    response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPStatusError as exc:
            error_body = exc.response.text
            logger.error("Paymob API HTTP %s error: %s", exc.response.status_code, error_body)
            raise RuntimeError(f"Paymob intention creation failed ({exc.response.status_code}): {error_body}") from exc
        except httpx.HTTPError as exc:
            logger.error("Paymob API network error: %s", exc)
            raise RuntimeError(f"Paymob intention creation network error: {exc}") from exc

        client_secret = data.get("client_secret")
        intention_order_id = data.get("intention_order_id")
        intention_id = data.get("id")
        provider_order_id = str(intention_order_id or intention_id) if (intention_order_id or intention_id) else None

        # Paymob Unified Checkout hosted URL:
        checkout_url = (
            f"{self.base_url}/unifiedcheckout/?publicKey={self.public_key}&clientSecret={client_secret}"
            if client_secret
            else None
        )

        return {
            "provider_order_id": provider_order_id,
            "client_secret": client_secret,
            "checkout_url": checkout_url,
            "raw_response": data,
        }

    def verify_hmac(self, obj: dict[str, Any], received_hmac: str) -> bool:
        """
        Calculates and verifies the Paymob HMAC-SHA512 signature for a transaction callback.
        
        The Paymob HMAC string is concatenated from specific fields in the callback object.
        """
        if not received_hmac or not self.hmac_secret:
            return False

        # Paymob HMAC canonical field ordering
        keys = [
            "amount_cents",
            "created_at",
            "currency",
            "error_occured",
            "has_parent_transaction",
            "id",
            "integration_id",
            "is_3d_secure",
            "is_auth",
            "is_capture",
            "is_refunded",
            "is_standalone_payment",
            "is_voided",
            "order.id",
            "owner",
            "pending",
            "source_data.pan",
            "source_data.sub_type",
            "source_data.type",
            "success",
        ]

        def get_nested_value(d: dict[str, Any], key_path: str) -> Any:
            parts = key_path.split(".")
            curr = d
            for p in parts:
                if not isinstance(curr, dict):
                    return ""
                curr = curr.get(p)
            return curr

        concatenated_parts = []
        for key in keys:
            val = get_nested_value(obj, key)
            if val is None:
                concatenated_parts.append("")
            elif isinstance(val, bool):
                concatenated_parts.append("true" if val else "false")
            else:
                concatenated_parts.append(str(val))

        concatenated_str = "".join(concatenated_parts)
        calculated = hmac.new(
            self.hmac_secret.encode("utf-8"),
            concatenated_str.encode("utf-8"),
            hashlib.sha512,
        ).hexdigest()

        return hmac.compare_digest(calculated.lower(), received_hmac.strip().lower())
