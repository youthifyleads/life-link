from pydantic import BaseModel, Field

class OTPRequest(BaseModel):
    phone: str = Field(min_length=7, max_length=30)

class OTPVerify(BaseModel):
    phone: str = Field(min_length=7, max_length=30)
    otp: str = Field(min_length=4, max_length=10)

class OTPResponse(BaseModel):
    message: str
    dev_otp: str | None = None
