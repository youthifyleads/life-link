"""Service-layer records kept independent of SQLAlchemy ORM models."""
from dataclasses import dataclass, field
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
    id: str
    actor_user_id: str | None
    action: str
    details: str
    reason: str | None = None    
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
    eligibility_status: str = "pending"
    last_donation_date: object | None = None

@dataclass
class DonationRecord:
    id: str
    blood_type: str
    quantity: int
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
    voucher_number: str
    issued_at: datetime
    status: str
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
