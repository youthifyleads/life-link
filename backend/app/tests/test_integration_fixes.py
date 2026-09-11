from app.services import dependencies as deps


def test_public_endpoints_do_not_require_bearer(client):
    schema = client.get("/openapi.json").json()
    assert "security" not in schema["paths"]["/api/v1/auth/login"]["post"]
    assert "security" not in schema["paths"]["/api/v1/auth/otp/request"]["post"]
    assert "security" not in schema["paths"]["/health"]["get"]


def test_protected_endpoint_has_bearer_security(client):
    schema = client.get("/openapi.json").json()
    assert schema["paths"]["/api/v1/auth/me"]["get"]["security"] == [{"HTTPBearer": []}]


def test_otp_request_verify_is_single_use(client):
    first = client.post("/api/v1/auth/otp/request", json={"phone": "01000000003"})
    assert first.status_code == 200
    assert first.json()["dev_otp"] == "123456"

    verified = client.post("/api/v1/auth/otp/verify", json={"phone": "01000000003", "otp": "123456"})
    assert verified.status_code == 200

    second = client.post("/api/v1/auth/otp/verify", json={"phone": "01000000003", "otp": "123456"})
    assert second.status_code == 401
    assert second.json()["error"]["code"] == "OTP_NOT_REQUESTED"


def test_validation_error_exposes_field_without_leaking_internals(client):
    resp = client.post("/api/v1/auth/login", json={"email": "not-an-email", "password": "x"})
    assert resp.status_code == 422
    body = resp.json()
    assert body["error"]["code"] == "VALIDATION_ERROR"
    assert "email" in body["error"]["message"]


def test_admin_seed_account_is_available(client):
    resp = client.post("/api/v1/auth/login", json={"email": "admin@lifelink.dev", "password": "Test@123"})
    assert resp.status_code == 200


def test_invalid_role_is_not_silently_mapped(client):
    from app.repositories.sqlalchemy._mappers import role_from_db
    import pytest
    with pytest.raises(ValueError):
        role_from_db("some_unknown_role")
