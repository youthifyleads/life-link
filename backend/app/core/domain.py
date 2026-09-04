"""
Shared domain-level enums.

These represent business concepts (roles, lifecycle states) rather than
database columns. They are intentionally decoupled from any ORM model so
they can be reused unchanged once the real SQL Server schema arrives -
the Database Developer's schema should map INTO these, not replace them,
unless the final ERD requires a documented change here.
"""
from enum import Enum


class Role(str, Enum):
    HOSPITAL_USER = "hospital_user"
    BLOOD_BANK_OPERATOR = "blood_bank_operator"
    MEDICAL_LEAD = "medical_lead"
    ADMIN = "admin"
    PLATFORM_SUPPORT = "platform_support"


class RequestStatus(str, Enum):
    REQUESTED = "requested"
    ACKNOWLEDGED = "acknowledged"
    CONFIRMED = "confirmed"
    PREPARED = "prepared"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


# Valid forward transitions in the MVP lifecycle.
# Cancellation is allowed from any non-terminal state; expiration is
# handled the same way (treated as a system-triggered cancellation path).
VALID_TRANSITIONS: dict[RequestStatus, set[RequestStatus]] = {
    RequestStatus.REQUESTED: {RequestStatus.ACKNOWLEDGED, RequestStatus.CANCELLED, RequestStatus.EXPIRED},
    RequestStatus.ACKNOWLEDGED: {RequestStatus.CONFIRMED, RequestStatus.CANCELLED, RequestStatus.EXPIRED},
    RequestStatus.CONFIRMED: {RequestStatus.PREPARED, RequestStatus.CANCELLED},
    RequestStatus.PREPARED: {RequestStatus.COMPLETED, RequestStatus.CANCELLED},
    RequestStatus.COMPLETED: set(),
    RequestStatus.CANCELLED: set(),
    RequestStatus.EXPIRED: set(),
}


class NotificationTrigger(str, Enum):
    REQUEST_CREATED = "REQUEST_CREATED"
    REQUEST_ACKNOWLEDGED = "REQUEST_ACKNOWLEDGED"
    REQUEST_STATUS_CHANGED = "REQUEST_STATUS_CHANGED"
    URGENT_REQUEST = "URGENT_REQUEST"


class AuditAction(str, Enum):
    LOGIN = "LOGIN"
    REQUEST_CREATED = "REQUEST_CREATED"
    REQUEST_STATUS_CHANGED = "REQUEST_STATUS_CHANGED"
    INVENTORY_UPDATED = "INVENTORY_UPDATED"
    QR_ACCESSED = "QR_ACCESSED"
    AUTHORIZATION_DENIED = "AUTHORIZATION_DENIED"
