import pytest
from fastapi.testclient import TestClient

from app.services import dependencies as deps
from app.services.otp_service import OTPService


@pytest.fixture(autouse=True)
def _reset_repositories():
    """Ensure every test starts with fresh in-memory repositories (fresh seeded users, empty requests/inventory)."""
    deps.reset_all_repositories()
    OTPService.reset_store()
    yield
    deps.reset_all_repositories()
    OTPService.reset_store()


@pytest.fixture
def client():
    from app.main import app

    return TestClient(app)


def _login(client: TestClient, email: str, password: str) -> str:
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest.fixture
def hospital_token(client):
    return _login(client, "hospital@lifelink.dev", "Test@123")


@pytest.fixture
def bloodbank_token(client):
    return _login(client, "bloodbank@lifelink.dev", "Test@123")


@pytest.fixture
def admin_token(client):
    return _login(client, "admin@lifelink.dev", "Test@123")


@pytest.fixture
def normal_user_token(client):
    return _login(client, "user@lifelink.dev", "Test@123")


@pytest.fixture
def donor_token(client):
    return _login(client, "donor@lifelink.dev", "Test@123")


@pytest.fixture
def medicallead_token(client):
    return _login(client, "medicallead@lifelink.dev", "Test@123")


@pytest.fixture
def support_token(client):
    return _login(client, "support@lifelink.dev", "Test@123")


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
