from datetime import datetime, timezone
from decimal import Decimal
import logging
from uuid import uuid4

from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError, ServiceUnavailableError, ValidationAppError
from app.core.paymob import PaymobClient
from app.repositories.interfaces.payment_repository import PaymentRepository
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.models import PaymentRecord
from app.schemas.payments import (
    PaymentCreate,
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentPublic,
    PaymentUpdate,
    PaymentWebhookResponse,
)

logger = logging.getLogger(__name__)


class PaymentService:
    def __init__(
        self,
        repo: PaymentRepository,
        request_repo: RequestRepository,
        paymob_client: PaymobClient | None = None,
    ):
        self.repo = repo
        self.request_repo = request_repo
        self.paymob_client = paymob_client or PaymobClient()

    def _check_hospital_access(self, req, current):
        user_inst_id = getattr(current, "institution_id", None) or getattr(current, "hospital_id", None)
        if current.role.value == "hospital_user" and (not req or req.hospital_id != user_inst_id):
            raise ForbiddenError("You cannot access payment for this request", code="FORBIDDEN_REQUEST_ACCESS")

    async def create(self, data: PaymentCreate, current) -> PaymentRecord:
        req = await self.request_repo.get_by_id(data.blood_request_id)
        if not req:
            raise NotFoundError("Blood request not found", code="REQUEST_NOT_FOUND")
        self._check_hospital_access(req, current)

        record = PaymentRecord(
            id=str(uuid4()),
            amount=float(data.amount),
            payment_status=data.payment_status or "pending",
            payment_method=data.payment_method,
            paid_at=data.paid_at,
            transaction_reference=data.transaction_reference,
            created_at=datetime.now(timezone.utc),
            blood_request_id=data.blood_request_id,
            currency=getattr(data, "currency", "EGP") or "EGP",
            provider=getattr(data, "provider", "paymob") or "paymob",
            provider_order_id=getattr(data, "provider_order_id", None),
        )
        return await self.repo.create(record)

    async def get(self, payment_id: str, current) -> PaymentRecord:
        p = await self.repo.get_by_id(payment_id)
        if not p:
            raise NotFoundError("Payment not found", code="PAYMENT_NOT_FOUND")
        req = await self.request_repo.get_by_id(p.blood_request_id)
        self._check_hospital_access(req, current)
        return p

    async def list_for_request(self, blood_request_id: str, current) -> list[PaymentRecord]:
        req = await self.request_repo.get_by_id(blood_request_id)
        if not req:
            raise NotFoundError("Blood request not found", code="REQUEST_NOT_FOUND")
        self._check_hospital_access(req, current)
        return await self.repo.list_for_request(blood_request_id)

    async def list_history(self, current) -> list[PaymentRecord]:
        """Payment history. Admin/Platform Support see everything; Hospital
        Staff see only payments for their own hospital's requests."""
        all_payments = await self.repo.list_all()
        if current.role.value in {"admin", "platform_support"}:
            return all_payments
        user_inst_id = getattr(current, "institution_id", None) or getattr(current, "hospital_id", None)
        scoped: list[PaymentRecord] = []
        for p in all_payments:
            req = await self.request_repo.get_by_id(p.blood_request_id)
            if req and user_inst_id and req.hospital_id == user_inst_id:
                scoped.append(p)
            elif req and getattr(req, "requester_id", None) == current.id:
                scoped.append(p)
        return scoped

    async def update(self, payment_id: str, data: PaymentUpdate, current) -> PaymentRecord:
        p = await self.repo.get_by_id(payment_id)
        if not p:
            raise NotFoundError("Payment not found", code="PAYMENT_NOT_FOUND")
        req = await self.request_repo.get_by_id(p.blood_request_id)
        self._check_hospital_access(req, current)

        if data.payment_status is not None:
            if data.payment_status.lower() in {"paid", "completed", "success"}:
                raise ForbiddenError(
                    "Payment success can only be confirmed by the Paymob webhook, not set manually.",
                    code="MANUAL_PAID_STATUS_FORBIDDEN",
                )
            p.payment_status = data.payment_status
        if data.paid_at is not None:
            p.paid_at = data.paid_at
        if data.transaction_reference is not None:
            p.transaction_reference = data.transaction_reference
        if data.payment_method is not None:
            p.payment_method = data.payment_method

        return await self.repo.update(p)

    async def initiate_payment(self, data: PaymentInitiateRequest, current) -> PaymentInitiateResponse:
        req = await self.request_repo.get_by_id(data.blood_request_id)
        if not req:
            raise NotFoundError("Blood request not found", code="REQUEST_NOT_FOUND")
        self._check_hospital_access(req, current)

        # Guard against duplicate paid payments
        existing = await self.repo.list_for_request(data.blood_request_id)
        if any(p.payment_status.lower() in {"paid", "completed", "success"} for p in existing):
            raise ConflictError("This blood request has already been paid for.", code="ALREADY_PAID")

        # Ensure request has been reviewed and priced by the blood bank
        unit_price = getattr(req, "unit_price", None)
        if unit_price is None or float(unit_price) <= 0:
            raise ValidationAppError(
                "Blood bank has not set the price for this request yet. Please wait for the blood bank to review and price the request before initiating payment.",
                code="PRICE_NOT_SET",
            )

        # Compute amount server-side from request quantity units and blood bank's quoted unit_price
        units = getattr(req, "quantity_units", 1) or 1
        amount = round(float(units) * float(unit_price), 2)

        provider_order_id = None
        client_secret = None
        checkout_url = None

        if not self.paymob_client.secret_key:
            # Offline / CI mock mode when no Paymob credentials are provided
            logger.info("Paymob secret key not configured. Using local mock intention session.")
            provider_order_id = f"paymob_order_{uuid4().hex[:10]}"
            client_secret = f"cs_test_{uuid4().hex}"
            checkout_url = f"{self.paymob_client.base_url}/unifiedcheckout/?publicKey={self.paymob_client.public_key}&clientSecret={client_secret}"
        else:
            try:
                paymob_res = await self.paymob_client.create_intention(
                    amount=amount,
                    blood_request_id=data.blood_request_id,
                    currency="EGP",
                    payment_methods=[data.payment_method or "card"],
                )
                provider_order_id = paymob_res.get("provider_order_id")
                client_secret = paymob_res.get("client_secret")
                checkout_url = paymob_res.get("checkout_url")
            except Exception as e:
                logger.error("Paymob payment intention creation failed: %s", e)
                raise ServiceUnavailableError(
                    f"Failed to initiate payment gateway session: {e}",
                    code="PAYMENT_GATEWAY_ERROR",
                ) from e

        record = PaymentRecord(
            id=str(uuid4()),
            amount=amount,
            payment_status="pending",
            payment_method=data.payment_method or "card",
            paid_at=None,
            transaction_reference=None,
            created_at=datetime.now(timezone.utc),
            blood_request_id=data.blood_request_id,
            currency="EGP",
            provider="paymob",
            provider_order_id=provider_order_id,
        )
        saved = await self.repo.create(record)

        return PaymentInitiateResponse(
            payment_id=saved.id,
            blood_request_id=saved.blood_request_id,
            amount=Decimal(str(saved.amount)),
            currency=saved.currency,
            provider=saved.provider,
            provider_order_id=saved.provider_order_id,
            client_secret=client_secret,
            checkout_url=checkout_url,
            payment_status=saved.payment_status,
        )

    async def process_webhook(self, payload: dict, received_hmac: str) -> PaymentWebhookResponse:
        obj = payload.get("obj", payload)
        is_valid = self.paymob_client.verify_hmac(obj, received_hmac)
        if not is_valid:
            raise ValidationAppError("Invalid Paymob HMAC signature", code="INVALID_HMAC_SIGNATURE")

        order_data = obj.get("order")
        order_id = None
        if isinstance(order_data, dict):
            order_id = str(order_data.get("id") or "")
        elif order_data is not None:
            order_id = str(order_data)

        transaction_id = str(obj.get("id") or "")
        is_success = bool(obj.get("success") is True)

        payment = None
        if order_id:
            payment = await self.repo.get_by_provider_order_id(order_id)

        if not payment:
            extras = {}
            if isinstance(order_data, dict):
                extras = order_data.get("extras", {})
            req_id = extras.get("blood_request_id") or obj.get("data", {}).get("extra", {}).get("blood_request_id")
            if req_id:
                payments = await self.repo.list_for_request(str(req_id))
                if payments:
                    payment = payments[0]

        if not payment:
            logger.warning("No payment record found for Paymob order_id: %s", order_id)
            return PaymentWebhookResponse(status="ignored", message="Payment record not found")

        if payment.payment_status.lower() in {"paid", "completed", "success"}:
            return PaymentWebhookResponse(status="already_processed", message="Payment already recorded as paid")

        if is_success:
            payment.payment_status = "paid"
            payment.paid_at = datetime.now(timezone.utc)
            payment.transaction_reference = transaction_id
            await self.repo.update(payment)

            req = await self.request_repo.get_by_id(payment.blood_request_id)
            if req and req.status in {"requested", "acknowledged"}:
                req.status = "confirmed"
                await self.request_repo.update(req)

            return PaymentWebhookResponse(status="success", message="Payment processed and request confirmed successfully")
        else:
            payment.payment_status = "failed"
            payment.transaction_reference = transaction_id
            await self.repo.update(payment)
            return PaymentWebhookResponse(status="failed", message="Payment marked as failed")
