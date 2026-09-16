from datetime import date
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import dependencies as deps
from app.services.email_service import FakeEmailProvider
from app.tests.conftest import auth_headers


@pytest.fixture
def email_provider():
    provider = FakeEmailProvider()
    app.dependency_overrides[deps.get_email_provider] = lambda: provider
    yield provider
    app.dependency_overrides.clear()


def test_donor_vouchers_empty_initially(client: TestClient, donor_token: str):
    headers = auth_headers(donor_token)
    # Create donor profile first
    res = client.post(
        "/api/v1/donors/me",
        headers=headers,
        json={"blood_type": "O+", "latitude": 30.0444, "longitude": 31.2357},
    )
    assert res.status_code == 201

    vouchers_res = client.get("/api/v1/donors/me/vouchers", headers=headers)
    assert vouchers_res.status_code == 200
    assert vouchers_res.json() == []


def test_donation_generates_voucher_and_sends_email(
    client: TestClient, donor_token: str, email_provider: FakeEmailProvider
):
    headers = auth_headers(donor_token)
    # 1. Setup donor profile
    res = client.post(
        "/api/v1/donors/me",
        headers=headers,
        json={"blood_type": "A+", "latitude": 30.0444, "longitude": 31.2357},
    )
    assert res.status_code == 201

    # 2. Record donation
    donation_date = date.today().isoformat()
    donate_res = client.post(
        "/api/v1/donors/me/donations",
        headers=headers,
        json={
            "blood_type": "A+",
            "quantity": 1,
            "donation_date": donation_date,
            "blood_bank_id": "bloodbank_1",
            "status": "completed",
        },
    )
    assert donate_res.status_code == 201
    donation_id = donate_res.json()["id"]

    # 3. Verify voucher via API
    vouchers_res = client.get("/api/v1/donors/me/vouchers", headers=headers)
    assert vouchers_res.status_code == 200
    vouchers = vouchers_res.json()
    assert len(vouchers) == 1
    voucher = vouchers[0]
    assert voucher["donation_id"] == donation_id
    assert voucher["status"] == "issued"
    assert voucher["voucher_number"].startswith("LL-")
    assert "issued_at" in voucher

    # 4. Verify email notification sent
    voucher_emails = [x for x in email_provider.sent if x[0] == "donor@lifelink.dev" and "voucher" in x[2]]
    assert len(voucher_emails) == 1
    to_email, v_num, purpose = voucher_emails[0]
    assert to_email == "donor@lifelink.dev"
    assert v_num == voucher["voucher_number"]
    assert purpose == "voucher:direct"
