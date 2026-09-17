from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(min_length=20)


from app.core.domain import BloodType, VALID_BLOOD_TYPES


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200, examples=["ahmed"])
    email: EmailStr = Field(examples=["ahmed@example.com"])
    phone: str = Field(min_length=7, max_length=30, examples=["01023914005"])
    password: str = Field(min_length=8, max_length=128, examples=["Ahmed123*"])
    date_of_birth: str = Field(description="Date of birth (YYYY-MM-DD or DD-MM-YYYY)", examples=["2005-10-10"])
    governorate: str | None = Field(default=None, max_length=100, examples=["Cairo"])
    blood_type: BloodType | None = Field(default=None, description="Blood type", examples=[BloodType.O_POS])

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("phone", "name", mode="before")
    @classmethod
    def strip_strings(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("governorate", mode="before")
    @classmethod
    def clean_governorate(cls, value: object) -> object:
        if isinstance(value, str):
            val = value.strip()
            if val.lower() in ("", "string", "null", "none"):
                return None
            return val
        return value

    @field_validator("blood_type", mode="before")
    @classmethod
    def validate_blood_type(cls, value: object) -> object:
        if value is None or value == "":
            return None
        if isinstance(value, str):
            clean = value.strip().upper()
            if clean in ("", "STRING", "STR", "NULL", "NONE"):
                return None
            if clean not in VALID_BLOOD_TYPES:
                raise ValueError(f"blood_type must be one of: {', '.join(sorted(VALID_BLOOD_TYPES))}")
            return clean
        return value

    @field_validator("date_of_birth", mode="before")
    @classmethod
    def validate_dob(cls, value: object) -> str:
        from datetime import date as _date, datetime as _datetime
        if isinstance(value, _date):
            d = value
        elif isinstance(value, str):
            val_str = value.strip()
            parsed = None
            for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d"):
                try:
                    parsed = _datetime.strptime(val_str, fmt).date()
                    break
                except ValueError:
                    pass
            if parsed is None:
                raise ValueError("date_of_birth must be a valid date in YYYY-MM-DD or DD-MM-YYYY format")
            d = parsed
        else:
            raise ValueError("Invalid date_of_birth")

        if d >= _date.today():
            raise ValueError("date_of_birth must be in the past")
        return d.isoformat()


class SignupResponse(BaseModel):
    message: str = "Account created. Verification code sent to email."
    user_id: str
    email: EmailStr
    email_verification_required: bool = True
    dev_otp: str | None = None


class EmailOTPRequest(BaseModel):
    email: EmailStr


class EmailOTPVerify(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")
    new_password: str = Field(min_length=8, max_length=128)
