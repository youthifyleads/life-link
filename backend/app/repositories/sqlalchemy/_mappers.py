from app.core.domain import NotificationTrigger, RequestStatus, Role
from app.core.security import create_tracking_reference
from app.db.models import AuditLogModel, BloodRequestModel, NotificationModel, UserModel, BloodBagModel
from app.repositories.models import AuditLogRecord, BloodRequestRecord, InventoryItemRecord, NotificationRecord, UserRecord


import logging

logger = logging.getLogger(__name__)


def role_from_db(name: str | None) -> Role:
    """Map only explicitly supported DB role names; never guess a role."""
    if not name:
        raise ValueError("User role is missing from the database")

    cleaned = name.strip().lower().replace(" ", "_").replace("-", "_")
    aliases = {
        "hospital_staff": Role.HOSPITAL_USER,
        "hospital_user": Role.HOSPITAL_USER,
        "blood_bank_staff": Role.BLOOD_BANK_OPERATOR,
        "blood_bank_operator": Role.BLOOD_BANK_OPERATOR,
        "normal_user": Role.NORMAL_USER,
        "donor": Role.NORMAL_USER,
        "medical_lead": Role.MEDICAL_LEAD,
        "admin": Role.ADMIN,
        "platform_support": Role.PLATFORM_SUPPORT,
    }
    try:
        return aliases[cleaned]
    except KeyError as exc:
        raise ValueError(f"Unknown database role: {name}") from exc


def user_to_record(m: UserModel) -> UserRecord:
    institution_id = m.hospital_id or m.blood_bank_id
    role = role_from_db(m.role.name if m.role else None)

    return UserRecord(
        id=m.user_id, email=m.email, full_name=m.name, hashed_password=m.password_hash,
        role=role,
        institution_id=institution_id, hospital_id=m.hospital_id, blood_bank_id=m.blood_bank_id,
        phone=(m.phones[0].phone if m.phones else None), is_active=(m.status or "active").lower() == "active", status=(m.status or "active").lower(),
    )


def request_to_record(m: BloodRequestModel) -> BloodRequestRecord:
    return BloodRequestRecord(
        id=m.blood_request_id, hospital_id=m.hospital_id, blood_type=m.blood_type,
        component="unspecified", quantity_units=m.requested_quantity,
        urgency=(str(m.urgency).lower() in {"urgent", "true", "1"}), notes=m.reason, status=RequestStatus(m.status),
        tracking_reference=create_tracking_reference(m.blood_request_id),
        created_by=m.created_by_user_id, required_by=m.required_by, created_at=m.created_at, updated_at=m.created_at,
    )


def inventory_to_record(m: BloodBagModel) -> InventoryItemRecord:
    return InventoryItemRecord(
        id=m.blood_bag_id, blood_bank_id=m.current_blood_bank_id, blood_type=m.blood_type,
        component="blood_bag", quantity_units=m.quantity,
        is_available=(m.status or "").lower() in {"available", "reserved"},
        expiry_date=m.expiry_date, last_updated=m.created_at,
    )


def notification_to_record(m: NotificationModel) -> NotificationRecord:
    try:
        trigger = NotificationTrigger(m.type)
    except ValueError:
        trigger = NotificationTrigger.REQUEST_STATUS_CHANGED
    return NotificationRecord(
        id=m.notification_id, user_id=m.user_id, trigger=trigger, message=m.message,
        is_read=(m.status or "unread").lower() == "read" or m.read_at is not None,
        related_request_id=m.related_request_id, created_at=m.created_at,
    )


def audit_to_record(m: AuditLogModel) -> AuditLogRecord:
    # 1:1 with the SQL audit_logs columns - no lossy string packing/unpacking.
    return AuditLogRecord(
        id=m.audit_id, actor_user_id=m.user_id, action=m.action,
        entity_type=m.entity_type, entity_id=m.entity_id, created_at=m.logged_at,
    )
