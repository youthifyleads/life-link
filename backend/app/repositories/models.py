"""
Internal repository-layer records.

These are plain dataclasses, deliberately NOT SQLAlchemy models and NOT
exposed directly through the API (schemas/ handles the public shape).
They exist so services/repositories have something concrete to work
with today. When the real ERD arrives, the SQL Server repository
implementation should map ORM rows into (or replace) these shapes
without requiring changes to services or API routes.
"""
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
