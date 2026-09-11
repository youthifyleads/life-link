from pydantic import BaseModel, ConfigDict, Field

class InstitutionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    governorate: str | None = Field(default=None, max_length=100)
    address: str | None = Field(default=None, max_length=500)
    status: str = Field(default="active", max_length=40)
    phones: list[str] = Field(default_factory=list, max_length=10)

class InstitutionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    governorate: str | None
    address: str | None
    status: str
    phones: list[str]
    kind: str
