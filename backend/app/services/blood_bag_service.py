from __future__ import annotations

from datetime import datetime, timezone
import secrets
import uuid

from app.core.domain import AuditAction, BLOOD_BAG_TRANSITIONS, BloodBagStatus, Role
from app.core.exceptions import ForbiddenError, InvalidStatusTransitionError, NotFoundError
from app.repositories.interfaces.blood_bag_repository import BloodBagRepository
from app.repositories.models import BloodBagHistoryRecord, BloodBagRecord, UserRecord


class BloodBagService:
    def __init__(self, repo: BloodBagRepository, audit) -> None:
        self.repo = repo
        self.audit = audit

    def can_manage(self, user: UserRecord) -> None:
        if user.role not in {Role.BLOOD_BANK_OPERATOR, Role.ADMIN}:
            raise ForbiddenError(
                "Only blood bank staff or admin can manage blood bags",
                code="FORBIDDEN_ROLE",
            )

    async def create(self, payload, user: UserRecord) -> BloodBagRecord:
        self.can_manage(user)
        now = datetime.now(timezone.utc)
        bank_id = getattr(payload, "current_blood_bank_id", None) or user.institution_id
        if user.role == Role.BLOOD_BANK_OPERATOR and not bank_id:
            raise ForbiddenError(
                "A blood bank is required for blood bank staff",
                code="BLOOD_BANK_REQUIRED",
            )
        if user.role == Role.BLOOD_BANK_OPERATOR and getattr(payload, "current_blood_bank_id", None) not in {None, user.institution_id}:
            raise ForbiddenError(
                "Cannot create a blood bag for another blood bank",
                code="FORBIDDEN_BLOOD_BANK_ACCESS",
            )

        component_val = getattr(payload, "component", "whole_blood") or "whole_blood"
        record = BloodBagRecord(
            id=str(uuid.uuid4()),
            blood_type=payload.blood_type,
            quantity=payload.quantity,
            collection_date=payload.collection_date,
            expiry_date=payload.expiry_date,
            qr_code="LL-BAG-" + secrets.token_urlsafe(18),
            status=BloodBagStatus.AVAILABLE.value,
            current_location=payload.current_location,
            created_at=now,
            donation_id=payload.donation_id,
            current_blood_bank_id=bank_id,
            component=component_val,
        )
        await self.repo.create(record)
        await self.repo.add_history(
            BloodBagHistoryRecord(
                id=str(uuid.uuid4()),
                blood_bag_id=record.id,
                status=record.status,
                changed_at=now,
                changed_by_user_id=user.id,
                location=record.current_location,
                notes="Bag created",
            )
        )
        return record

    async def list(self, user: UserRecord) -> list[BloodBagRecord]:
        return await self.repo.list(
            user.institution_id if user.role == Role.BLOOD_BANK_OPERATOR else None
        )

    async def get(self, bag_id: str) -> BloodBagRecord:
        record = await self.repo.get(bag_id)
        if record is None:
            raise NotFoundError("Blood bag was not found", code="BLOOD_BAG_NOT_FOUND")
        return record

    def _assert_view_access(self, record: BloodBagRecord, user: UserRecord) -> None:
        if user.role == Role.BLOOD_BANK_OPERATOR and user.institution_id and record.current_blood_bank_id:
            if user.institution_id != record.current_blood_bank_id:
                raise ForbiddenError(
                    "Not authorized to access this blood bag",
                    code="FORBIDDEN_BLOOD_BAG_ACCESS",
                )

    async def update_status(self, bag_id: str, payload, user: UserRecord) -> BloodBagRecord:
        self.can_manage(user)
        record = await self.get(bag_id)
        self._assert_view_access(record, user)

        current = BloodBagStatus(record.status)
        target_status = payload.status if isinstance(payload.status, BloodBagStatus) else BloodBagStatus(payload.status)
        if target_status not in BLOOD_BAG_TRANSITIONS[current]:
            raise InvalidStatusTransitionError(
                f"Cannot move blood bag from {current.value} to {target_status.value}",
                code="INVALID_BLOOD_BAG_TRANSITION",
            )

        now = datetime.now(timezone.utc)
        record.status = target_status.value
        if getattr(payload, "location", None):
            record.current_location = payload.location
        await self.repo.update(record)
        await self.repo.add_history(
            BloodBagHistoryRecord(
                id=str(uuid.uuid4()),
                blood_bag_id=record.id,
                status=record.status,
                changed_at=now,
                changed_by_user_id=user.id,
                location=record.current_location,
                notes=getattr(payload, "notes", None),
            )
        )
        return record

    async def history(self, bag_id: str, user: UserRecord) -> list[BloodBagHistoryRecord]:
        record = await self.get(bag_id)
        self._assert_view_access(record, user)
        return await self.repo.history(bag_id)

    async def issue_qr(self, bag_id: str, user: UserRecord) -> tuple[BloodBagRecord, str]:
        record = await self.get(bag_id)
        self._assert_view_access(record, user)
        if self.audit:
            await self.audit.record(
                actor_user_id=user.id,
                action=AuditAction.QR_ACCESSED,
                entity_type="blood_bag",
                entity_id=record.id,
            )
        return record, record.qr_code

    async def scan(self, qr_code: str, user: UserRecord) -> tuple[BloodBagRecord, list[BloodBagHistoryRecord]]:
        record = await self.repo.get_by_qr(qr_code)
        if record is None:
            raise NotFoundError(
                "Blood bag QR was not found",
                code="BLOOD_BAG_QR_NOT_FOUND",
            )
        self._assert_view_access(record, user)
        history = await self.repo.history(record.id)
        if self.audit:
            await self.audit.record(
                actor_user_id=user.id,
                action=AuditAction.QR_ACCESSED,
                entity_type="blood_bag",
                entity_id=record.id,
            )
        return record, history
