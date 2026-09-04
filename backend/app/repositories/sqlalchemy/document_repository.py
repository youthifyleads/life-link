from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import SupportingDocumentModel
from app.repositories.interfaces.document_repository import DocumentRepository
from app.repositories.models import SupportingDocumentRecord


def _to_record(o):
    return SupportingDocumentRecord(o.document_id, o.blood_request_id, o.file_name, o.status, o.uploaded_at, o.file_type, o.file_path, o.reviewed_at, o.rejection_reason, o.uploaded_by_user_id, o.reviewed_by_user_id)


class SQLAlchemyDocumentRepository(DocumentRepository):
    def __init__(self, session: AsyncSession): self.session = session

    async def create(self, document):
        self.session.add(SupportingDocumentModel(document_id=document.id, blood_request_id=document.blood_request_id, file_name=document.file_name, status=document.status, uploaded_at=document.uploaded_at, file_type=document.file_type, file_path=document.file_path, reviewed_at=document.reviewed_at, rejection_reason=document.rejection_reason, uploaded_by_user_id=document.uploaded_by_user_id, reviewed_by_user_id=document.reviewed_by_user_id))
        await self.session.commit(); return document

    async def get_by_id(self, document_id):
        o=(await self.session.execute(select(SupportingDocumentModel).where(SupportingDocumentModel.document_id==document_id))).scalar_one_or_none()
        return _to_record(o) if o else None

    async def list_for_request(self, request_id):
        r=await self.session.execute(select(SupportingDocumentModel).where(SupportingDocumentModel.blood_request_id==request_id).order_by(SupportingDocumentModel.uploaded_at.desc()))
        return [_to_record(o) for o in r.scalars().all()]

    async def update(self, document):
        o=(await self.session.execute(select(SupportingDocumentModel).where(SupportingDocumentModel.document_id==document.id))).scalar_one_or_none()
        if o:
            o.status=document.status; o.reviewed_at=document.reviewed_at; o.rejection_reason=document.rejection_reason; o.reviewed_by_user_id=document.reviewed_by_user_id; await self.session.commit()
        return document
