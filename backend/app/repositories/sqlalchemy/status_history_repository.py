from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import RequestStatusHistoryModel
from app.repositories.interfaces.status_history_repository import StatusHistoryRepository
from app.repositories.models import RequestStatusHistoryRecord


class SQLAlchemyStatusHistoryRepository(StatusHistoryRepository):
    def __init__(self, session: AsyncSession): self.session=session

    async def create(self, entry):
        self.session.add(RequestStatusHistoryModel(history_id=entry.id, blood_request_id=entry.blood_request_id, status=entry.status.value, notes=entry.notes, changed_at=entry.changed_at, changed_by_user_id=entry.changed_by_user_id))
        await self.session.commit(); return entry

    async def list_for_request(self, request_id):
        result=await self.session.execute(select(RequestStatusHistoryModel).where(RequestStatusHistoryModel.blood_request_id==request_id).order_by(RequestStatusHistoryModel.changed_at.asc()))
        return [RequestStatusHistoryRecord(o.history_id,o.blood_request_id,__import__('app.core.domain',fromlist=['RequestStatus']).RequestStatus(o.status),o.notes,o.changed_at,o.changed_by_user_id) for o in result.scalars().all()]
