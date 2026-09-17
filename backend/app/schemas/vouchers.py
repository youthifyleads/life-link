from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

from app.core.domain import VoucherStatus


class VoucherIssueRequest(BaseModel):
    donation_id: str = Field(min_length=1, max_length=50)


class PartnerVoucherValidationRequest(BaseModel):
    voucher_code: str = Field(min_length=8, max_length=64)
    donor_id: str = Field(min_length=1, max_length=50)
    partner_id: str = Field(min_length=1, max_length=50)


class PartnerVoucherRedemptionRequest(PartnerVoucherValidationRequest):
    value: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    status: VoucherStatus
    redeemed_at: datetime

    @field_validator("redeemed_at")
    @classmethod
    def require_timezone(cls, value):
        if value.tzinfo is None:
            raise ValueError("redeemed_at must include a timezone")
        return value


class VoucherPublic(BaseModel):
    id: str
    code: str
    donor_id: str
    partner_id: str | None
    value: Decimal
    status: VoucherStatus
    issued_at: datetime
    expires_at: datetime
    redeemed_at: datetime | None
    transaction_reference: str | None


class VoucherValidationPublic(BaseModel):
    valid: bool
    voucher: VoucherPublic
