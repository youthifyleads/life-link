from datetime import datetime, timedelta, timezone
from decimal import Decimal
import logging
import secrets
from uuid import uuid4

from app.core.config import get_settings
from app.core.domain import Role, VoucherStatus
from app.core.exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationAppError
from app.repositories.interfaces.donor_repository import DonorRepository
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.interfaces.voucher_repository import VoucherRepository
from app.repositories.models import DonationVoucherRecord
from app.services.email_service import EmailProvider

logger = logging.getLogger(__name__)


class VoucherService:
    def __init__(self, vouchers: VoucherRepository, donors: DonorRepository, users: UserRepository, email: EmailProvider):
        self.vouchers, self.donors, self.users, self.email = vouchers, donors, users, email

    async def issue(self, donation_id: str, actor=None):
        donation = await self.donors.get_donation(donation_id)
        if not donation:
            raise NotFoundError("Donation not found", code="DONATION_NOT_FOUND")
        if (donation.status or "").upper() != "CONFIRMED":
            raise ValidationAppError("Only CONFIRMED donations can receive a voucher.", code="DONATION_NOT_CONFIRMED")
        if actor and actor.role != Role.ADMIN:
            if actor.role != Role.BLOOD_BANK_OPERATOR or actor.institution_id != donation.blood_bank_id:
                raise ForbiddenError("You cannot issue a voucher for this donation.", code="FORBIDDEN_VOUCHER_ISSUE")
        if await self.vouchers.get_by_donation(donation_id):
            raise ConflictError("A voucher has already been issued for this donation.", code="VOUCHER_ALREADY_ISSUED")

        responses = await self.donors.list_responses(donation.donor_id)
        request_based = any((r.status or "").upper() in {"CONFIRMED", "ACCEPTED"} and r.blood_request_id for r in responses)
        settings = get_settings()
        value = Decimal(str(settings.VOUCHER_REQUEST_BASED_VALUE if request_based else settings.VOUCHER_DIRECT_DONATION_VALUE))
        now = datetime.now(timezone.utc)
        voucher = DonationVoucherRecord(str(uuid4()), self._new_code(), donation.donor_id, None, value,
                                        VoucherStatus.ACTIVE.value, now, now + timedelta(days=settings.VOUCHER_EXPIRY_DAYS),
                                        None, None, donation.id)
        try:
            voucher = await self.vouchers.create(voucher)
        except ValueError as exc:
            raise ConflictError("A voucher has already been issued for this donation.", code="VOUCHER_ALREADY_ISSUED") from exc

        # Issuance is durable before email delivery. A provider outage must not create duplicate vouchers on retry.
        donor = await self.donors.get_by_id(donation.donor_id)
        user = await self.users.get_by_id(donor.user_id) if donor else None
        if user:
            try:
                await self.email.send_voucher(to_email=user.email, code=voucher.code, value=voucher.value, expires_at=voucher.expires_at)
            except Exception:
                logger.exception("Voucher %s issued but notification delivery failed", voucher.id)
        return voucher

    async def list_mine(self, user_id: str):
        donor = await self.donors.get_by_user_id(user_id)
        if not donor:
            return []
        return await self._expire(await self.vouchers.list_for_donor(donor.id))

    async def validate(self, code: str, donor_id: str, partner_id: str, actor):
        self._assert_partner(actor, partner_id)
        voucher = await self.vouchers.get_by_code_and_donor(code, donor_id)
        if not voucher:
            raise NotFoundError("Voucher was not found.", code="VOUCHER_NOT_FOUND")
        voucher = (await self._expire([voucher]))[0]
        if voucher.status != VoucherStatus.ACTIVE.value:
            raise ConflictError("Voucher is not active.", code="VOUCHER_NOT_ACTIVE")
        return voucher

    async def redeem(self, data, actor):
        self._assert_partner(actor, data.partner_id)
        if data.status != VoucherStatus.REDEEMED:
            raise ValidationAppError("status must be REDEEMED for redemption.", code="INVALID_VOUCHER_STATUS")
        voucher = await self.validate(data.voucher_code, data.donor_id, data.partner_id, actor)
        if data.value != voucher.value:
            raise ValidationAppError("Voucher value does not match.", code="VOUCHER_VALUE_MISMATCH")
        now = datetime.now(timezone.utc)
        if data.redeemed_at > now + timedelta(minutes=5):
            raise ValidationAppError("redeemed_at cannot be in the future.", code="INVALID_REDEEMED_AT")
        redeemed = await self.vouchers.redeem_active(code=data.voucher_code, donor_id=data.donor_id,
                                                     partner_id=data.partner_id, redeemed_at=data.redeemed_at)
        if not redeemed:
            raise ConflictError("Voucher has already been redeemed or is no longer active.", code="VOUCHER_NOT_ACTIVE")
        return redeemed

    @staticmethod
    def _new_code() -> str:
        return f"LLV-{secrets.token_urlsafe(12).upper()}"

    @staticmethod
    def _assert_partner(actor, partner_id):
        if actor.role not in {Role.HOSPITAL_USER, Role.BLOOD_BANK_OPERATOR}:
            raise ForbiddenError("Only authenticated partner accounts can process vouchers.", code="FORBIDDEN_PARTNER")
        if actor.id != partner_id:
            raise ForbiddenError("partner_id must match the authenticated partner.", code="FORBIDDEN_PARTNER")

    async def _expire(self, vouchers):
        # Expiry is enforced at every read/validation. Persistent expiry state is
        # updated by the database implementation during scheduled reconciliation.
        now = datetime.now(timezone.utc)
        return [v if v.status != "ACTIVE" or v.expires_at > now else DonationVoucherRecord(
            v.id, v.code, v.donor_id, v.partner_id, v.value, "EXPIRED", v.issued_at,
            v.expires_at, v.redeemed_at, v.transaction_reference, v.donation_id) for v in vouchers]
