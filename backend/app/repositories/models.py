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
