from app.services import dependencies as deps


def test_public_endpoints_do_not_require_bearer(client):
    schema = client.get("/openapi.json").json()
    assert "security" not in schema["paths"]["/api/v1/auth/login"]["post"]
    assert "security" not in schema["paths"]["/api/v1/auth/signup"]["post"]
    assert "security" not in schema["paths"]["/health"]["get"]


def test_protected_endpoint_has_bearer_security(client):
    schema = client.get("/openapi.json").json()
    assert schema["paths"]["/api/v1/auth/me"]["get"]["security"] == [{"HTTPBearer": []}]


def test_signup_otp_is_public_and_one_time(client, monkeypatch):
    from app.services import dependencies as deps
    from app.services.email_service import FakeEmailProvider
    provider=FakeEmailProvider(); client.app.dependency_overrides[deps.get_email_provider]=lambda:provider
    first=client.post('/api/v1/auth/signup',json={'name':'OTP User','email':'otp@example.com','phone':'01022222222','password':'Strong@123','date_of_birth':'2000-01-01'})
    assert first.status_code==201
    code=provider.sent[-1][1]
    verified=client.post('/api/v1/auth/signup/verify',json={'email':'otp@example.com','otp':code})
    assert verified.status_code==200
    second=client.post('/api/v1/auth/signup/verify',json={'email':'otp@example.com','otp':code})
    assert second.status_code==401
    client.app.dependency_overrides.clear()


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
