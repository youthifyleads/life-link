from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class PaymentCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    payment_method: str | None = Field(default=None, max_length=100)
    blood_request_id: str

class PaymentUpdate(BaseModel):
    payment_status: str = Field(min_length=1, max_length=40)
    transaction_reference: str | None = Field(default=None, max_length=255)

class PaymentPublic(BaseModel):
    id: str
    amount: Decimal
    payment_status: str
    payment_method: str | None
    paid_at: datetime | None
    transaction_reference: str | None
    created_at: datetime
    blood_request_id: str
