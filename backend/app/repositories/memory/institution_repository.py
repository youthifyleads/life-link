from app.repositories.institution_models import InstitutionRecord
from app.repositories.interfaces.institution_repository import InstitutionRepository

class InMemoryInstitutionRepository(InstitutionRepository):
    def __init__(self): self._items: dict[tuple[str,str], InstitutionRecord] = {}
    async def list(self, kind): return [v for (k,_),v in self._items.items() if k == kind]
    async def get(self, kind, institution_id): return self._items.get((kind, institution_id))
    async def create(self, record): self._items[(record.kind, record.id)] = record; return record
