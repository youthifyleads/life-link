import pytest
from fastapi.testclient import TestClient

from app.services import dependencies as deps


@pytest.fixture(autouse=True)
def _reset_repositories():
    """Ensure every test starts with fresh in-memory repositories (fresh seeded users, empty requests/inventory)."""
    deps.reset_all_repositories()
    yield
    deps.reset_all_repositories()


@pytest.fixture
def client():
    from app.main import app

    return TestClient(app)


def _login(client: TestClient, email: str, password: str = "password123") -> str:
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest.fixture
def hospital_token(client):
    return _login(client, "hospital@lifelink.dev")


@pytest.fixture
def bloodbank_token(client):
    return _login(client, "bloodbank@lifelink.dev")


@pytest.fixture
def admin_token(client):
    return _login(client, "admin@lifelink.dev")


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}
