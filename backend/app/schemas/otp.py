from pydantic import BaseModel, Field, field_validator


class OTPRequest(BaseModel):
    phone: str = Field(min_length=7, max_length=30)

    @field_validator("phone", mode="before")
    @classmethod
    def normalize_phone(cls, value):
        return value.strip() if isinstance(value, str) else value


class OTPVerify(BaseModel):
    phone: str = Field(min_length=7, max_length=30)
    otp: str = Field(min_length=4, max_length=10)

    @field_validator("phone", "otp", mode="before")
    @classmethod
    def normalize_strings(cls, value):
        return value.strip() if isinstance(value, str) else value


class OTPResponse(BaseModel):
    message: str
    dev_otp: str | None = None
