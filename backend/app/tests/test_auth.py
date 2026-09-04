from app.tests.conftest import auth_headers


def test_valid_login_returns_token(client):
    resp = client.post("/api/v1/auth/login", json={"email": "hospital@lifelink.dev", "password": "password123"})
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_invalid_credentials_rejected(client):
    resp = client.post("/api/v1/auth/login", json={"email": "hospital@lifelink.dev", "password": "wrong"})
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_unknown_email_rejected(client):
    resp = client.post("/api/v1/auth/login", json={"email": "nobody@lifelink.dev", "password": "password123"})
    assert resp.status_code == 401


def test_missing_authentication_on_protected_route(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "MISSING_TOKEN"


def test_me_returns_current_user(client, hospital_token):
    resp = client.get("/api/v1/auth/me", headers=auth_headers(hospital_token))
    assert resp.status_code == 200
    assert resp.json()["email"] == "hospital@lifelink.dev"


def test_invalid_token_rejected(client):
    resp = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "INVALID_TOKEN"
