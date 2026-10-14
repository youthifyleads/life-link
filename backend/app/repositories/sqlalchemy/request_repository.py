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
        import uuid
        try:
            req_id = str(uuid.UUID(request.id))
        except (ValueError, TypeError):
            req_id = str(uuid.uuid4())
            request.id = req_id
        unit_p = getattr(request, "unit_price", None)

        obj = BloodRequestModel(
            blood_request_id=req_id, hospital_id=request.hospital_id, created_by_user_id=request.created_by,
            blood_type=request.blood_type, requested_quantity=request.quantity_units,
            component=request.component or "whole_blood",
            urgency="urgent" if request.urgency else "normal", status=request.status.value, reason=request.notes,
            unit_price=unit_p,
            created_at=request.created_at, required_by=request.required_by,
        )
        self.session.add(obj)
        await self.session.commit()
        return request

    async def get_by_id(self, request_id: str) -> BloodRequestRecord | None:
        clean_id = str(request_id).replace("REQ-", "").replace("req-", "").replace("BR-", "").replace("br-", "").replace("#", "").strip()
        ids_to_try = {str(request_id), clean_id, clean_id.lower(), clean_id.upper()}
        try:
            import uuid
            normalized = str(uuid.UUID(clean_id))
            ids_to_try.add(normalized)
        except (ValueError, TypeError):
            pass

        result = await self.session.execute(
            select(BloodRequestModel).where(BloodRequestModel.blood_request_id.in_(list(ids_to_try)))
        )
        obj = result.scalar_one_or_none()
        return request_to_record(obj) if obj else None

    async def get_by_tracking_reference(self, reference: str) -> BloodRequestRecord | None:
        direct = await self.get_by_id(reference)
        if direct:
            return direct
        request_id = decode_tracking_reference(reference)
        if request_id:
            return await self.get_by_id(request_id)
        return None

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
        if hasattr(request, "unit_price") and request.unit_price is not None:
            obj.unit_price = request.unit_price
        await self.session.commit()
        return request
