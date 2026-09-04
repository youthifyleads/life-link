from dataclasses import dataclass, field
from datetime import datetime, timezone

@dataclass
class InstitutionRecord:
    id: str
    name: str
    governorate: str | None
    address: str | None
    status: str = "active"
    phones: list[str] = field(default_factory=list)
    kind: str = "hospital"
