from app.repositories.institution_models import InstitutionRecord
from app.repositories.interfaces.institution_repository import InstitutionRepository

class InMemoryInstitutionRepository(InstitutionRepository):
    def __init__(self):
        self._items: dict[tuple[str,str], InstitutionRecord] = {
            ("blood_bank", "bloodbank_1"): InstitutionRecord(
                id="bloodbank_1",
                name="Central Blood Bank",
                governorate="Cairo",
                address="15 Tahrir Square, Cairo",
                status="active",
                phones=["01000000002"],
                kind="blood_bank",
            ),
            ("hospital", "hospital_1"): InstitutionRecord(
                id="hospital_1",
                name="Central Hospital",
                governorate="Cairo",
                address="Kasr Al Ainy, Cairo",
                status="active",
                phones=["01000000001"],
                kind="hospital",
            ),
        }
    async def list(self, kind): return [v for (k,_),v in self._items.items() if k == kind]
    async def get(self, kind, institution_id): return self._items.get((kind, institution_id))
    async def create(self, record): self._items[(record.kind, record.id)] = record; return record
