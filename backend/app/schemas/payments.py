from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class PaymentCreate(BaseModel):
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    currency: str = Field(default="EGP", min_length=3, max_length=3)
    provider: str = Field(default="paymob", min_length=1, max_length=50)
    provider_order_id: str | None = Field(default=None, max_length=100)
    payment_method: str | None = Field(default=None, max_length=100)
    blood_request_id: str

class PaymentUpdate(BaseModel):
    payment_status: str = Field(min_length=1, max_length=40)
    transaction_reference: str | None = Field(default=None, max_length=255)
    provider_order_id: str | None = Field(default=None, max_length=100)

class PaymentPublic(BaseModel):
    id: str
    amount: Decimal
    currency: str = "EGP"
    provider: str = "paymob"
    provider_order_id: str | None = None
    payment_status: str
    payment_method: str | None
    paid_at: datetime | None
    transaction_reference: str | None
    created_at: datetime
    blood_request_id: str

class PaymentInitiateRequest(BaseModel):
    blood_request_id: str
    payment_method: str | None = Field(default="card", max_length=50)

class PaymentInitiateResponse(BaseModel):
    payment_id: str
    blood_request_id: str
    amount: Decimal
    currency: str
    provider: str
    provider_order_id: str | None = None
    client_secret: str | None = None
    checkout_url: str | None = None
    payment_status: str

class PaymentWebhookResponse(BaseModel):
    status: str
    message: str
