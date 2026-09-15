import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import dependencies as deps
from app.services.email_service import FakeEmailProvider


def auth(client: TestClient, email: str, password: str) -> dict[str, str]:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return {"Authorization": "Bearer " + res.json()["access_token"]}


@pytest.fixture(autouse=True)
def reset():
    deps.reset_all_repositories()
    yield
    deps.reset_all_repositories()


@pytest.fixture
def email_provider():
    provider = FakeEmailProvider()
    app.dependency_overrides[deps.get_email_provider] = lambda: provider
    yield provider
    app.dependency_overrides.clear()


def test_signup_email_otp_refresh_and_unverified_block(email_provider):
    client = TestClient(app)
    res = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "New User",
            "email": "new@example.com",
            "phone": "01012345678",
            "password": "Strong@123",
            "date_of_birth": "2000-01-01",
        },
    )
    assert res.status_code == 201

    blocked = client.post(
        "/api/v1/auth/login",
        json={"email": "new@example.com", "password": "Strong@123"},
    )
    assert blocked.status_code == 401
    assert blocked.json()["error"]["code"] == "ACCOUNT_INACTIVE"

    code = email_provider.sent[-1][1]
    verify_res = client.post(
        "/api/v1/auth/signup/verify",
        json={"email": "new@example.com", "otp": code},
    )
    assert verify_res.status_code == 200

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "new@example.com", "password": "Strong@123"},
    )
    assert login_res.status_code == 200
    refresh_token = login_res.json().get("refresh_token")
    assert refresh_token

    # Rotate refresh token
    rotate_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert rotate_res.status_code == 200

    # Token reuse detection
    reuse_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert reuse_res.status_code == 401
    assert reuse_res.json()["error"]["code"] == "REFRESH_TOKEN_REUSE"


def test_signup_defaults_to_normal_user_and_optional_fields(email_provider):
    client = TestClient(app)
    res = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Optional",
            "email": "optional@example.com",
            "phone": "01011111111",
            "password": "Strong@123",
            "date_of_birth": "1999-05-05",
        },
    )
    assert res.status_code == 201
    code = email_provider.sent[-1][1]
    verify_res = client.post(
        "/api/v1/auth/signup/verify",
        json={"email": "optional@example.com", "otp": code},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["role"] == "normal_user"


def test_password_reset_is_generic_and_revokes_refresh(email_provider):
    client = TestClient(app)
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "hospital@lifelink.dev", "password": "Test@123"},
    )
    rt = login.json()["refresh_token"]

    forgot = client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "hospital@lifelink.dev"},
    )
    assert forgot.status_code == 200
    assert "hospital" not in forgot.json()["message"].lower()

    code = email_provider.sent[-1][1]
    reset_res = client.post(
        "/api/v1/auth/reset-password",
        json={"email": "hospital@lifelink.dev", "code": code, "new_password": "NewPass@123"},
    )
    assert reset_res.status_code == 200

    # Old refresh token is revoked
    revoked = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": rt},
    )
    assert revoked.status_code == 401


def test_blood_bag_lifecycle_and_qr():
    client = TestClient(app)
    headers = auth(client, "bloodbank@lifelink.dev", "Test@123")
    create_res = client.post(
        "/api/v1/blood-bags",
        headers=headers,
        json={"blood_type": "O-", "quantity": 1, "collection_date": "2026-09-01", "current_location": "Cairo"},
    )
    assert create_res.status_code == 201
    bag = create_res.json()

    for status_val in ["reserved", "allocated", "in_transit", "delivered", "received"]:
        patch_res = client.patch(
            f"/api/v1/blood-bags/{bag['id']}/status",
            headers=headers,
            json={"status": status_val},
        )
        assert patch_res.status_code == 200

    hist_res = client.get(f"/api/v1/blood-bags/{bag['id']}/history", headers=headers)
    assert hist_res.status_code == 200
    assert len(hist_res.json()) == 6

    qr_payload = client.get(f"/api/v1/blood-bags/{bag['id']}/qr", headers=headers).json()["qr_payload"]
    scan_res = client.post(
        "/api/v1/blood-bags/scan",
        headers=headers,
        json={"qr_code": qr_payload},
    )
    assert scan_res.status_code == 200
    assert scan_res.json()["blood_bag"]["id"] == bag["id"]
    assert len(scan_res.json()["movement_history"]) == 6


def test_invalid_blood_bag_transition_rejected():
    client = TestClient(app)
    headers = auth(client, "bloodbank@lifelink.dev", "Test@123")
    create_res = client.post(
        "/api/v1/blood-bags",
        headers=headers,
        json={"blood_type": "A+", "quantity": 1, "collection_date": "2026-09-01"},
    )
    bid = create_res.json()["id"]
    bad_patch = client.patch(
        f"/api/v1/blood-bags/{bid}/status",
        headers=headers,
        json={"status": "received"},
    )
    assert bad_patch.status_code == 409


def test_device_token_register_list_remove():
    client = TestClient(app)
    headers = auth(client, "user@lifelink.dev", "Test@123")
    payload = {"token": "fcm-device-token-12345", "provider": "fcm"}
    reg_res = client.post("/api/v1/notifications/devices", headers=headers, json=payload)
    assert reg_res.status_code == 201

    list_res = client.get("/api/v1/notifications/devices", headers=headers)
    assert len(list_res.json()) == 1

    del_res = client.request("DELETE", "/api/v1/notifications/devices", headers=headers, json=payload)
    assert del_res.status_code == 200

    empty_res = client.get("/api/v1/notifications/devices", headers=headers)
    assert empty_res.json() == []
