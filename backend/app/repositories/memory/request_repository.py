from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.models import BloodRequestRecord


class InMemoryRequestRepository(RequestRepository):
    """Temporary in-memory implementation - see InMemoryUserRepository docstring."""

    def __init__(self) -> None:
        self._requests: dict[str, BloodRequestRecord] = {}

    async def create(self, request: BloodRequestRecord) -> BloodRequestRecord:
        self._requests[request.id] = request
        return request

    async def get_by_id(self, request_id: str) -> BloodRequestRecord | None:
        return self._requests.get(request_id)

    async def get_by_tracking_reference(self, reference: str) -> BloodRequestRecord | None:
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
