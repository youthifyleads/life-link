"""Service-layer records kept independent of SQLAlchemy ORM models."""
from dataclasses import dataclass, field
from decimal import Decimal
from datetime import datetime, timezone

from app.core.domain import NotificationTrigger, RequestStatus, Role


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class UserRecord:
    id: str
    email: str
    full_name: str
    hashed_password: str
    role: Role
    institution_id: str | None = None
    is_active: bool = True
    status: str = "active"
    phone: str | None = None
    hospital_id: str | None = None
    blood_bank_id: str | None = None
    created_at: datetime = field(default_factory=_utcnow)
    date_of_birth: object | None = None
    email_verified: bool = True


@dataclass
class BloodRequestRecord:
    id: str
    hospital_id: str
    blood_type: str
    component: str
    quantity_units: int
    urgency: bool
    notes: str | None
    status: RequestStatus
    tracking_reference: str
    created_by: str
    unit_price: float | None = None
    required_by: datetime | None = None
    created_at: datetime = field(default_factory=_utcnow)
    updated_at: datetime = field(default_factory=_utcnow)


@dataclass
class InventoryItemRecord:
    id: str
    blood_bank_id: str
    blood_type: str
    component: str
    quantity_units: int
    is_available: bool
    expiry_date: datetime | None
    last_updated: datetime = field(default_factory=_utcnow)
    qr_code: str | None = None
    status: str = "available"


@dataclass
class NotificationRecord:
    id: str
    user_id: str
    trigger: NotificationTrigger
    message: str
    is_read: bool
    related_request_id: str | None
    created_at: datetime = field(default_factory=_utcnow)


@dataclass
class AuditLogRecord:
    """Mirrors the SQL `audit_logs` table exactly: entity_type/entity_id/action.

    There is no free-text description column in the supplied schema, so the
    service layer must supply a structured entity_type/entity_id pair rather
    than a human-readable sentence - a sentence cannot be losslessly
    round-tripped through those two columns.
    """
    id: str
    actor_user_id: str | None
    action: str
    entity_type: str
    entity_id: str | None = None
    created_at: datetime = field(default_factory=_utcnow)


@dataclass
class SupportingDocumentRecord:
    id: str
    blood_request_id: str
    file_name: str
    status: str
    uploaded_at: datetime
    file_type: str | None
    file_path: str
    reviewed_at: datetime | None = None
    rejection_reason: str | None = None
    uploaded_by_user_id: str | None = None
    reviewed_by_user_id: str | None = None


@dataclass
class RequestStatusHistoryRecord:
    id: str
    blood_request_id: str
    status: RequestStatus
    notes: str | None
    changed_at: datetime = field(default_factory=_utcnow)
    changed_by_user_id: str | None = None


@dataclass
class DonorRecord:
    id: str
    user_id: str
    blood_type: str | None = None
    date_of_birth: object | None = None
    governorate: str | None = None
    eligibility_status: str = "eligible"
    last_donation_date: object | None = None
    latitude: float | None = None
    longitude: float | None = None

@dataclass
class DonationRecord:
    id: str
    blood_type: str
    quantity: Decimal
    donation_date: object
    status: str
    created_at: datetime = field(default_factory=_utcnow)
    donor_id: str = ""
    blood_bank_id: str = ""

@dataclass
class DonationResponseRecord:
    id: str
    response_date: datetime
    status: str
    notes: str | None
    blood_request_id: str
    donor_id: str

@dataclass
class ConsentRecord:
    id: str
    donor_id: str
    consent_type: str
    granted: bool
    granted_at: datetime | None = None
    revoked_at: datetime | None = None

@dataclass
class DonationVoucherRecord:
    id: str
    code: str
    donor_id: str
    partner_id: str | None
    value: Decimal
    status: str
    issued_at: datetime
    expires_at: datetime
    redeemed_at: datetime | None
    transaction_reference: str | None
    donation_id: str

@dataclass
class CaregiverAssignmentRecord:
    id: str
    assignment_date: datetime | None
    status: str
    notes: str | None
    blood_bag_id: str
    caregiver_user_id: str
    hospital_id: str

@dataclass
class PaymentRecord:
    id: str
    amount: float
    payment_status: str
    payment_method: str | None
    paid_at: datetime | None
    transaction_reference: str | None
    created_at: datetime
    blood_request_id: str
    currency: str = "EGP"
    provider: str = "paymob"
    provider_order_id: str | None = None


@dataclass
class RefreshTokenRecord:
    id: str
    user_id: str
    token_hash: str
    expires_at: datetime
    created_at: datetime = field(default_factory=_utcnow)
    revoked_at: datetime | None = None
    replaced_by_token_id: str | None = None


@dataclass
class PasswordResetTokenRecord:
    id: str
    user_id: str
    token_hash: str
    expires_at: datetime
    created_at: datetime = field(default_factory=_utcnow)
    used_at: datetime | None = None
    attempts: int = 0


@dataclass
class DeviceTokenRecord:
    id: str
    user_id: str
    token: str
    provider: str
    active: bool = True
    created_at: datetime = field(default_factory=_utcnow)
    updated_at: datetime = field(default_factory=_utcnow)


@dataclass
class BloodBagRecord:
    id: str
    blood_type: str
    quantity: int
    collection_date: object
    expiry_date: object | None
    qr_code: str
    status: str
    current_location: str | None
    created_at: datetime = field(default_factory=_utcnow)
    donation_id: str | None = None
    current_blood_bank_id: str | None = None
    component: str = "whole_blood"
    allocated_request_id: str | None = None


@dataclass
class BloodBagHistoryRecord:
    id: str
    blood_bag_id: str
    status: str
    changed_at: datetime = field(default_factory=_utcnow)
    changed_by_user_id: str = ""
    location: str | None = None
    notes: str | None = None
