from abc import ABC, abstractmethod
from app.repositories.institution_models import InstitutionRecord

class InstitutionRepository(ABC):
    @abstractmethod
    async def list(self, kind: str) -> list[InstitutionRecord]: ...
    @abstractmethod
    async def get(self, kind: str, institution_id: str) -> InstitutionRecord | None: ...
    @abstractmethod
    async def create(self, record: InstitutionRecord) -> InstitutionRecord: ...
