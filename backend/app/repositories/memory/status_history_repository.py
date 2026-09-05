from app.repositories.interfaces.status_history_repository import StatusHistoryRepository


class InMemoryStatusHistoryRepository(StatusHistoryRepository):
    def __init__(self) -> None:
        self._items = []

    async def create(self, entry):
        self._items.append(entry)
        return entry

    async def list_for_request(self, request_id):
        return [x for x in self._items if x.blood_request_id == request_id]
