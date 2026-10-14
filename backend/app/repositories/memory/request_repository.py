from datetime import datetime, timezone
from app.core.domain import RequestStatus
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.models import BloodRequestRecord


class InMemoryRequestRepository(RequestRepository):
    """Temporary in-memory implementation - see InMemoryUserRepository docstring."""

    def __init__(self) -> None:
        self._requests: dict[str, BloodRequestRecord] = {}
        self._seed_dev_requests()

    def _seed_dev_requests(self) -> None:
        tc78_id = "57b4a1d3-5b37-4f1d-9b70-2426dda6254f"
        tc78_ref = "REQ-57B4A1D3-5B37-4F1D-9B70-2426DDA6254F"
        self._requests[tc78_id] = BloodRequestRecord(
            id=tc78_id,
            hospital_id="hospital_1",
            blood_type="O+",
            component="whole_blood",
            quantity_units=2,
            urgency=True,
            notes="حاله جراحه طارئه - قسم الطوارئ",
            status=RequestStatus.ACKNOWLEDGED,
            tracking_reference=tc78_ref,
            created_by="usr_hospital_1",
            unit_price=450.0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    async def create(self, request: BloodRequestRecord) -> BloodRequestRecord:
        self._requests[request.id] = request
        return request

    async def get_by_id(self, request_id: str) -> BloodRequestRecord | None:
        if not request_id:
            return None
        if request_id in self._requests:
            return self._requests[request_id]
        clean_id = str(request_id).replace("REQ-", "").replace("req-", "").replace("BR-", "").replace("br-", "").replace("#", "").strip().lower()
        for k, req in self._requests.items():
            k_clean = str(k).replace("REQ-", "").replace("req-", "").replace("BR-", "").replace("br-", "").replace("#", "").strip().lower()
            if k_clean == clean_id:
                return req
        return None

    async def get_by_tracking_reference(self, reference: str) -> BloodRequestRecord | None:
        direct = await self.get_by_id(reference)
        if direct:
            return direct
        for req in self._requests.values():
            if req.tracking_reference == reference:
                return req
        return None

    async def list_all(self, hospital_id: str | None = None) -> list[BloodRequestRecord]:
        values = list(self._requests.values())
        if hospital_id:
            values = [r for r in values if r.hospital_id == hospital_id]
        return sorted(values, key=lambda r: r.created_at, reverse=True)

    async def update(self, request: BloodRequestRecord) -> BloodRequestRecord:
        self._requests[request.id] = request
        return request
