import uuid
from datetime import datetime, timezone

from app.core.domain import Role
from app.core.exceptions import ForbiddenError, NotFoundError
from app.repositories.interfaces.inventory_repository import InventoryRepository
from app.repositories.models import InventoryItemRecord, UserRecord
from app.schemas.inventory import InventoryItemCreate, InventoryItemUpdate
from app.services.audit_service import AuditService


class InventoryService:
    """
    Reported/manual inventory attestation only (MVP scope). Does NOT
    implement clinical cross-matching or clinical release decisions -
    those remain the Medical Lead's authority outside this platform.
    """

    def __init__(self, inventory_repo: InventoryRepository, audit_service: AuditService):
        self._inventory_repo = inventory_repo
        self._audit_service = audit_service

    async def create_item(self, payload: InventoryItemCreate, current_user: UserRecord) -> InventoryItemRecord:
        self._assert_can_manage(current_user, payload.blood_bank_id)

        record = InventoryItemRecord(
            id=f"inv_{uuid.uuid4().hex[:12]}",
            blood_bank_id=payload.blood_bank_id,
            blood_type=payload.blood_type,
            component=payload.component,
            quantity_units=payload.quantity_units,
            is_available=payload.quantity_units > 0,
            expiry_date=payload.expiry_date,
        )
        created = await self._inventory_repo.create(record)
        await self._audit_service.record(
            actor_user_id=current_user.id,
            action="INVENTORY_UPDATED",
            details=f"inventory item {created.id} created",
        )
        return created

    async def get_item(self, item_id: str, current_user: UserRecord | None = None) -> InventoryItemRecord:
        item = await self._inventory_repo.get_by_id(item_id)
        if item is None:
            raise NotFoundError("Inventory item was not found", code="INVENTORY_ITEM_NOT_FOUND")
        if current_user is not None and current_user.role == Role.BLOOD_BANK_OPERATOR and current_user.institution_id != item.blood_bank_id:
            raise ForbiddenError("Not authorized to view this blood bank inventory", code="FORBIDDEN_INVENTORY_ACCESS")
        return item

    async def list_items(self, current_user: UserRecord) -> list[InventoryItemRecord]:
        if current_user.role == Role.BLOOD_BANK_OPERATOR:
            return await self._inventory_repo.list_all(blood_bank_id=current_user.institution_id)
        # Hospitals, admin, and platform support can view reported availability across banks.
        return await self._inventory_repo.list_all()

    async def update_item(
        self, item_id: str, payload: InventoryItemUpdate, current_user: UserRecord
    ) -> InventoryItemRecord:
        item = await self.get_item(item_id, current_user)
        self._assert_can_manage(current_user, item.blood_bank_id)

        if payload.quantity_units is not None:
            item.quantity_units = payload.quantity_units
        if payload.is_available is not None:
            item.is_available = payload.is_available
        item.last_updated = datetime.now(timezone.utc)

        updated = await self._inventory_repo.update(item)
        await self._audit_service.record(
            actor_user_id=current_user.id,
            action="INVENTORY_UPDATED",
            details=f"inventory item {updated.id} updated",
        )
        return updated

    def _assert_can_manage(self, current_user: UserRecord, blood_bank_id: str) -> None:
        if current_user.role == Role.ADMIN:
            return
        if current_user.role != Role.BLOOD_BANK_OPERATOR or current_user.institution_id != blood_bank_id:
            raise ForbiddenError(
                "Not authorized to manage inventory for this blood bank", code="FORBIDDEN_INVENTORY_ACCESS"
            )
