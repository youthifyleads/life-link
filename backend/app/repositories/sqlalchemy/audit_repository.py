from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AuditLogModel
from app.repositories.interfaces.audit_repository import AuditRepository
from app.repositories.models import AuditLogRecord
from app.repositories.sqlalchemy._mappers import audit_to_record


class SQLAlchemyAuditRepository(AuditRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, entry: AuditLogRecord) -> AuditLogRecord:
        entity_type, _, entity_id = entry.details.partition(":")
        obj = AuditLogModel(
            audit_id=entry.id, user_id=entry.actor_user_id,
            entity_type=entity_type or "system", entity_id=entity_id or None,
            action=entry.action, reason=entry.details,
            timestamp=entry.created_at,
        )
        self.session.add(obj)
        await self.session.commit()
        return entry

    async def list_all(self) -> list[AuditLogRecord]:
        result = await self.session.execute(select(AuditLogModel).order_by(AuditLogModel.timestamp.desc()))
        return [audit_to_record(o) for o in result.scalars().all()]
