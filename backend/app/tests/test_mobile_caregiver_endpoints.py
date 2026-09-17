import pytest
from starlette.testclient import TestClient
from app.tests.conftest import auth_headers


def test_caregiver_patients_and_blood_request_flow(client: TestClient, normal_user_token: str):
    headers = auth_headers(normal_user_token)

    # 1. List patients initially empty
    resp = client.get("/api/v1/caregiver/patients", headers=headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    # 2. Create patient
    create_resp = client.post(
        "/api/v1/caregiver/patients",
        json={
            "full_name": "Ahmed Patient",
            "blood_type": "O+",
            "hospital_id": "hosp_1",
            "notes": "Post-surgery recovery",
        },
        headers=headers,
    )
    assert create_resp.status_code == 201
    patient = create_resp.json()
    assert patient["full_name"] == "Ahmed Patient"
    assert patient["blood_type"] == "O+"
    assert "id" in patient

    # 3. List patients contains created patient
    list_resp = client.get("/api/v1/caregiver/patients", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1
    assert list_resp.json()[0]["id"] == patient["id"]

    # 4. Create blood request for patient as hospital user
    # (Note: request creation requires hospital_user role in RequestService)


def test_donor_vouchers_compatibility_alias(client: TestClient, donor_token: str):
    headers = auth_headers(donor_token)

    # Calling /api/v1/donors/me/vouchers should return 200 with list
    resp = client.get("/api/v1/donors/me/vouchers", headers=headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_payments_initiate_normal_user_role_allowed(client: TestClient, normal_user_token: str, hospital_token: str, bloodbank_token: str):
    # 1. Hospital creates and blood bank prices a blood request
    req_resp = client.post(
        "/api/v1/requests",
        json={"blood_type": "A+", "component": "whole_blood", "quantity_units": 1},
        headers=auth_headers(hospital_token),
    )
    assert req_resp.status_code == 201
    req_id = req_resp.json()["id"]

    price_resp = client.post(
        f"/api/v1/requests/{req_id}/acknowledge",
        json={"unit_price": 450.0},
        headers=auth_headers(bloodbank_token),
    )
    assert price_resp.status_code == 200

    # 2. Normal user (mobile app user / caregiver) initiates payment -> should NOT be 403 Forbidden
    init_resp = client.post(
        "/api/v1/payments/initiate",
        json={"blood_request_id": req_id, "payment_method": "card"},
        headers=auth_headers(normal_user_token),
    )
    assert init_resp.status_code == 201
    assert float(init_resp.json()["amount"]) == 450.0
    assert init_resp.json()["payment_status"] == "pending"
