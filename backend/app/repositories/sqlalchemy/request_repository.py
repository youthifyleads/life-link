from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import BloodRequestModel
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.models import BloodRequestRecord
from app.repositories.sqlalchemy._mappers import request_to_record
from app.core.security import decode_tracking_reference


class SQLAlchemyRequestRepository(RequestRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, request: BloodRequestRecord) -> BloodRequestRecord:
        obj = BloodRequestModel(
            blood_request_id=request.id, hospital_id=request.hospital_id, created_by_user_id=request.created_by,
            blood_type=request.blood_type, requested_quantity=request.quantity_units,
            urgency="urgent" if request.urgency else "normal", status=request.status.value, reason=request.notes,
            created_at=request.created_at, required_by=request.required_by,

        )
        self.session.add(obj)
        await self.session.commit()
        return request

    async def get_by_id(self, request_id: str) -> BloodRequestRecord | None:
        result = await self.session.execute(select(BloodRequestModel).where(BloodRequestModel.blood_request_id == request_id))
        obj = result.scalar_one_or_none()
        return request_to_record(obj) if obj else None

    async def get_by_tracking_reference(self, reference: str) -> BloodRequestRecord | None:
        request_id = decode_tracking_reference(reference)
        if request_id is None:
            return None
        result = await self.session.execute(select(BloodRequestModel).where(BloodRequestModel.blood_request_id == request_id))
        obj = result.scalar_one_or_none()
        return request_to_record(obj) if obj else None

    async def list_all(self, hospital_id: str | None = None) -> list[BloodRequestRecord]:
        stmt = select(BloodRequestModel).order_by(BloodRequestModel.created_at.desc())
        if hospital_id:
            stmt = stmt.where(BloodRequestModel.hospital_id == hospital_id)
        result = await self.session.execute(stmt)
        return [request_to_record(o) for o in result.scalars().all()]

    async def update(self, request: BloodRequestRecord) -> BloodRequestRecord:
        result = await self.session.execute(select(BloodRequestModel).where(BloodRequestModel.blood_request_id == request.id))
        obj = result.scalar_one_or_none()
        if obj is None:
            return request
        obj.status = request.status.value
        obj.reason = request.notes
        await self.session.commit()
        return request
