import pytest
from app.services.dependencies import get_user_repository, get_donor_repository
from app.tests.conftest import auth_headers


def _signup_payload(**overrides):
    payload = {
        "name": "Test Person",
        "email": "signup.test@example.com",
        "phone": "01055512345",
        "password": "SuperSecret1",
        "date_of_birth": "1995-05-20",
    }
    payload.update(overrides)
    return payload


def test_signup_creates_unverified_normal_user_with_dev_otp(client):
    resp = client.post("/api/v1/auth/signup", json=_signup_payload())
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert body["email"] == "signup.test@example.com"
    assert body["dev_otp"] is not None
    assert len(body["dev_otp"]) == 6 and body["dev_otp"].isdigit()


def test_signup_requires_all_mandatory_fields(client):
    for missing in ["name", "email", "phone", "password", "date_of_birth"]:
        payload = _signup_payload()
        payload.pop(missing)
        resp = client.post("/api/v1/auth/signup", json=payload)
        assert resp.status_code == 422, f"expected 422 when {missing} is missing, got {resp.status_code}"


def test_signup_governorate_and_blood_type_are_optional(client):
    resp = client.post(
        "/api/v1/auth/signup",
        json=_signup_payload(email="optional.test@example.com", phone="01055512399"),
    )
    assert resp.status_code == 201, resp.text


def test_signup_rejects_future_date_of_birth(client):
    resp = client.post("/api/v1/auth/signup", json=_signup_payload(date_of_birth="2099-01-01"))
    assert resp.status_code == 422


def test_signup_duplicate_email_rejected(client):
    client.post("/api/v1/auth/signup", json=_signup_payload())
    resp = client.post("/api/v1/auth/signup", json=_signup_payload(phone="01055512346"))
    assert resp.status_code == 409
    assert resp.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"


def test_signup_duplicate_phone_rejected(client):
    client.post("/api/v1/auth/signup", json=_signup_payload())
    resp = client.post("/api/v1/auth/signup", json=_signup_payload(email="another@example.com"))
    assert resp.status_code == 409
    assert resp.json()["error"]["code"] == "PHONE_ALREADY_EXISTS"


def test_login_rejected_before_email_verification(client):
    client.post("/api/v1/auth/signup", json=_signup_payload())
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "signup.test@example.com", "password": "SuperSecret1"},
    )
    assert login_resp.status_code == 401
    assert login_resp.json()["error"]["code"] in {"ACCOUNT_INACTIVE", "EMAIL_NOT_VERIFIED"}


def test_verify_email_activates_account_and_allows_login(client):
    resp = client.post("/api/v1/auth/signup", json=_signup_payload(email="verify.test@example.com", phone="01099988877"))
    assert resp.status_code == 201
    dev_otp = resp.json()["dev_otp"]

    # Verify email
    v_resp = client.post(
        "/api/v1/auth/verify-email",
        json={"email": "verify.test@example.com", "otp": dev_otp},
    )
    assert v_resp.status_code == 200, v_resp.text

    # Login now succeeds
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "verify.test@example.com", "password": "SuperSecret1"},
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


def test_verify_email_wrong_otp_rejected(client):
    client.post("/api/v1/auth/signup", json=_signup_payload(email="wrong.otp@example.com", phone="01099988866"))
    v_resp = client.post(
        "/api/v1/auth/verify-email",
        json={"email": "wrong.otp@example.com", "otp": "000000"},
    )
    assert v_resp.status_code == 401
    assert v_resp.json()["error"]["code"] == "INVALID_OTP"


def test_resend_verification_email(client):
    client.post("/api/v1/auth/signup", json=_signup_payload(email="resend@example.com", phone="01099988855"))
    
    # Wait or immediate resend triggers cooldown or new code
    resend = client.post(
        "/api/v1/auth/resend-verification-email",
        json={"email": "resend@example.com"},
    )
    # Could be 429 if within 60s cooldown or 200 if cool
    assert resend.status_code in {200, 429}
