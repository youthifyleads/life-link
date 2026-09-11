from abc import ABC, abstractmethod
from app.repositories.models import SupportingDocumentRecord


class DocumentRepository(ABC):
    @abstractmethod
    async def create(self, document: SupportingDocumentRecord) -> SupportingDocumentRecord: ...

    @abstractmethod
    async def get_by_id(self, document_id: str) -> SupportingDocumentRecord | None: ...

    @abstractmethod
    async def list_for_request(self, request_id: str) -> list[SupportingDocumentRecord]: ...

    @abstractmethod
    async def update(self, document: SupportingDocumentRecord) -> SupportingDocumentRecord: ...
