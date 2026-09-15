from __future__ import annotations
import secrets
import uuid
from datetime import datetime, timezone

from app.core.domain import AuditAction, BLOOD_BAG_TRANSITIONS, BloodBagStatus, Role
from app.core.exceptions import ForbiddenError, InvalidStatusTransitionError, NotFoundError
from app.repositories.models import BloodBagHistoryRecord, BloodBagRecord, UserRecord


class BloodBagService:
    def __init__(self, repo, audit):
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
        bank_id = payload.current_blood_bank_id or user.institution_id
        if user.role == Role.BLOOD_BANK_OPERATOR and not bank_id:
            raise ForbiddenError(
                "A blood bank is required for blood bank staff",
                code="BLOOD_BANK_REQUIRED",
            )
        if user.role == Role.BLOOD_BANK_OPERATOR and payload.current_blood_bank_id not in {None, user.institution_id}:
            raise ForbiddenError(
                "Cannot create a blood bag for another blood bank",
                code="FORBIDDEN_BLOOD_BANK_ACCESS",
            )

        record = BloodBagRecord(
            str(uuid.uuid4()),
            payload.blood_type,
            payload.quantity,
            payload.collection_date,
            payload.expiry_date,
            "LL-BAG-" + secrets.token_urlsafe(18),
            BloodBagStatus.AVAILABLE.value,
            payload.current_location,
            now,
            payload.donation_id,
            bank_id,
        )
        await self.repo.create(record)
        await self.repo.add_history(
            BloodBagHistoryRecord(
                str(uuid.uuid4()),
                record.id,
                record.status,
                now,
                user.id,
                record.current_location,
                "Bag created",
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
        if user.role == Role.BLOOD_BANK_OPERATOR and user.institution_id != record.current_blood_bank_id:
            raise ForbiddenError(
                "Not authorized to access this blood bag",
                code="FORBIDDEN_BLOOD_BAG_ACCESS",
            )

    async def update_status(self, bag_id, payload, user: UserRecord) -> BloodBagRecord:
        self.can_manage(user)
        record = await self.get(bag_id)
        self._assert_view_access(record, user)

        current = BloodBagStatus(record.status)
        if payload.status not in BLOOD_BAG_TRANSITIONS[current]:
            raise InvalidStatusTransitionError(
                f"Cannot move blood bag from {current.value} to {payload.status.value}",
                code="INVALID_BLOOD_BAG_TRANSITION",
            )

        now = datetime.now(timezone.utc)
        record.status = payload.status.value
        if payload.location:
            record.current_location = payload.location
        await self.repo.update(record)
        await self.repo.add_history(
            BloodBagHistoryRecord(
                str(uuid.uuid4()),
                record.id,
                record.status,
                now,
                user.id,
                record.current_location,
                payload.notes,
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
        await self.audit.record(
            actor_user_id=user.id,
            action=AuditAction.QR_ACCESSED,
            entity_type="blood_bag",
            entity_id=record.id,
        )
        return record, record.qr_code

    async def scan(self, qr_code: str, user: UserRecord):
        record = await self.repo.get_by_qr(qr_code)
        if record is None:
            raise NotFoundError(
                "Blood bag QR was not found",
                code="BLOOD_BAG_QR_NOT_FOUND",
            )
        self._assert_view_access(record, user)
        history = await self.repo.history(record.id)
        await self.audit.record(
            actor_user_id=user.id,
            action=AuditAction.QR_ACCESSED,
            entity_type="blood_bag",
            entity_id=record.id,
        )
        return record, history
