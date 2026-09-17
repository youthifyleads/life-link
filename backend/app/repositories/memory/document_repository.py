from app.repositories.interfaces.document_repository import DocumentRepository
from app.repositories.models import SupportingDocumentRecord


class InMemoryDocumentRepository(DocumentRepository):
    def __init__(self) -> None:
        self._items: dict[str, SupportingDocumentRecord] = {}

    async def create(self, document):
        self._items[document.id] = document
        return document

    async def get_by_id(self, document_id):
        return self._items.get(document_id)

    async def list_for_request(self, request_id):
        return [x for x in self._items.values() if x.blood_request_id == request_id]

    async def update(self, document):
        self._items[document.id] = document
        return document
