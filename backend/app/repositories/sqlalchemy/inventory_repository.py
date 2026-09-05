from datetime import datetime, timezone
import secrets

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import BloodBagModel
from app.repositories.interfaces.inventory_repository import InventoryRepository
from app.repositories.models import InventoryItemRecord
from app.repositories.sqlalchemy._mappers import inventory_to_record


class SQLAlchemyInventoryRepository(InventoryRepository):
    """Maps the existing reported-inventory API to BLOOD_BAG in the ERD."""
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, item: InventoryItemRecord) -> InventoryItemRecord:
        # The MVP explicitly permits manual inventory attestation. The ERD models
        # availability through BLOOD_BAG, so a manually reported row is represented
        # as a bag without a donation_id; a later donation flow can populate it.
        now = datetime.now(timezone.utc)
        obj = BloodBagModel(
            blood_bag_id=item.id, donation_id=None, current_blood_bank_id=item.blood_bank_id,
            collection_date=now, created_at=now, blood_type=item.blood_type,
            qr_code=f"LL-BAG-{secrets.token_urlsafe(12)}",
            status="available" if item.is_available else "unavailable",
            expiry_date=item.expiry_date, current_location=item.blood_bank_id,
            quantity=item.quantity_units,
        )
        self.session.add(obj)
        await self.session.commit()
        return item

    async def get_by_id(self, item_id: str) -> InventoryItemRecord | None:
        result = await self.session.execute(select(BloodBagModel).where(BloodBagModel.blood_bag_id == item_id))
        obj = result.scalar_one_or_none()
        return inventory_to_record(obj) if obj else None

    async def list_all(self, blood_bank_id: str | None = None) -> list[InventoryItemRecord]:
        stmt = select(BloodBagModel).order_by(BloodBagModel.created_at.desc())
        if blood_bank_id:
            stmt = stmt.where(BloodBagModel.current_blood_bank_id == blood_bank_id)
        result = await self.session.execute(stmt)
        return [inventory_to_record(o) for o in result.scalars().all()]

    async def update(self, item: InventoryItemRecord) -> InventoryItemRecord:
        result = await self.session.execute(select(BloodBagModel).where(BloodBagModel.blood_bag_id == item.id))
        obj = result.scalar_one_or_none()
        if obj is None:
            return item
        obj.quantity = item.quantity_units
        obj.status = "available" if item.is_available else "unavailable"
        await self.session.commit()
        return item
