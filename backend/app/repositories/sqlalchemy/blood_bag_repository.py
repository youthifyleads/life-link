from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import BloodBagModel, BloodBagStatusHistoryModel
from app.repositories.interfaces.blood_bag_repository import BloodBagRepository
from app.repositories.models import BloodBagHistoryRecord, BloodBagRecord


class SQLAlchemyBloodBagRepository(BloodBagRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_record(self, obj: BloodBagModel) -> BloodBagRecord:
        return BloodBagRecord(
            id=obj.blood_bag_id,
            blood_type=obj.blood_type,
            quantity=obj.quantity,
            collection_date=obj.collection_date,
            expiry_date=obj.expiry_date,
            qr_code=obj.qr_code,
            status=obj.status,
            current_location=obj.current_location,
            created_at=obj.created_at,
            donation_id=obj.donation_id,
            current_blood_bank_id=obj.current_blood_bank_id,
            component=getattr(obj, "component", "whole_blood") or "whole_blood",
            allocated_request_id=getattr(obj, "allocated_request_id", None),
        )

    async def get(self, bag_id: str) -> BloodBagRecord | None:
        obj = (
            await self.session.execute(
                select(BloodBagModel).where(BloodBagModel.blood_bag_id == bag_id)
            )
        ).scalar_one_or_none()
        return self._to_record(obj) if obj else None

    async def list(self, bank_id: str | None = None) -> list[BloodBagRecord]:
        query = select(BloodBagModel).order_by(BloodBagModel.created_at.desc())
        if bank_id:
            query = query.where(BloodBagModel.current_blood_bank_id == bank_id)
        result = (await self.session.execute(query)).scalars().all()
        return [self._to_record(obj) for obj in result]

    async def list_by_request(self, request_id: str) -> list[BloodBagRecord]:
        query = (
            select(BloodBagModel)
            .where(BloodBagModel.allocated_request_id == request_id)
            .order_by(BloodBagModel.created_at.asc())
        )
        result = (await self.session.execute(query)).scalars().all()
        return [self._to_record(obj) for obj in result]

    async def create(self, record: BloodBagRecord) -> BloodBagRecord:
        obj = BloodBagModel(
            blood_bag_id=record.id,
            blood_type=record.blood_type,
            quantity=record.quantity,
            collection_date=record.collection_date,
            expiry_date=record.expiry_date,
            qr_code=record.qr_code,
            status=record.status,
            current_location=record.current_location,
            created_at=record.created_at,
            donation_id=record.donation_id,
            current_blood_bank_id=record.current_blood_bank_id,
            component=getattr(record, "component", "whole_blood"),
            allocated_request_id=getattr(record, "allocated_request_id", None),
        )
        self.session.add(obj)
        await self.session.commit()
        return record

    async def update(self, record: BloodBagRecord) -> BloodBagRecord:
        obj = (
            await self.session.execute(
                select(BloodBagModel).where(BloodBagModel.blood_bag_id == record.id)
            )
        ).scalar_one_or_none()
        if obj:
            obj.status = record.status
            obj.current_location = record.current_location
            if hasattr(obj, "allocated_request_id"):
                obj.allocated_request_id = getattr(record, "allocated_request_id", None)
            if hasattr(obj, "component"):
                obj.component = getattr(record, "component", obj.component)
            await self.session.commit()
        return record

    async def add_history(self, record: BloodBagHistoryRecord) -> BloodBagHistoryRecord:
        obj = BloodBagStatusHistoryModel(
            history_id=record.id,
            blood_bag_id=record.blood_bag_id,
            status=record.status,
            changed_at=record.changed_at,
            changed_by_user_id=record.changed_by_user_id,
            location=record.location,
            notes=record.notes,
        )
        self.session.add(obj)
        await self.session.commit()
        return record

    async def history(self, bag_id: str) -> list[BloodBagHistoryRecord]:
        query = (
            select(BloodBagStatusHistoryModel)
            .where(BloodBagStatusHistoryModel.blood_bag_id == bag_id)
            .order_by(BloodBagStatusHistoryModel.changed_at.asc())
        )
        result = (await self.session.execute(query)).scalars().all()
        return [
            BloodBagHistoryRecord(
                id=obj.history_id,
                blood_bag_id=obj.blood_bag_id,
                status=obj.status,
                changed_at=obj.changed_at,
                changed_by_user_id=obj.changed_by_user_id,
                location=obj.location,
                notes=obj.notes,
            )
            for obj in result
        ]

    async def get_by_qr(self, qr_code: str) -> BloodBagRecord | None:
        obj = (
            await self.session.execute(
                select(BloodBagModel).where(BloodBagModel.qr_code == qr_code)
            )
        ).scalar_one_or_none()
        return self._to_record(obj) if obj else None
