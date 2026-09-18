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

    # 4. Caregiver cannot create blood request (only hospital creates blood requisitions)
    bad_req = client.post(
        f"/api/v1/caregiver/patients/{patient['id']}/blood-requests",
        json={"blood_type": "O+", "quantity_units": 1},
        headers=headers,
    )
    assert bad_req.status_code == 404


def test_caregiver_scans_hospital_request_qr_and_pays(
    client: TestClient,
    normal_user_token: str,
    hospital_token: str,
    bloodbank_token: str,
):
    caregiver_headers = auth_headers(normal_user_token)

    # 1. Hospital creates the official blood requisition
    req_resp = client.post(
        "/api/v1/requests",
        json={"blood_type": "B+", "component": "plasma", "quantity_units": 2},
        headers=auth_headers(hospital_token),
    )
    assert req_resp.status_code == 201
    req_id = req_resp.json()["id"]

    # 2. Blood bank sets price
    price_resp = client.post(
        f"/api/v1/requests/{req_id}/acknowledge",
        json={"unit_price": 300.0},
        headers=auth_headers(bloodbank_token),
    )
    assert price_resp.status_code == 200

    # 3. Hospital displays/issues QR code for the request
    qr_issue_resp = client.post(
        f"/api/v1/requests/{req_id}/qr",
        headers=auth_headers(hospital_token),
    )
    assert qr_issue_resp.status_code == 200
    qr_payload = qr_issue_resp.json()["qr_payload"]
    assert qr_payload

    # 4. Caregiver scans the hospital's request QR on their mobile phone
    scan_resp = client.post(
        "/api/v1/caregiver/scan-request",
        json={"qr_code": qr_payload},
        headers=caregiver_headers,
    )
    assert scan_resp.status_code == 200
    data = scan_resp.json()
    assert data["request_id"] == req_id
    assert data["blood_type"] == "B+"
    assert data["component"] == "plasma"
    assert data["quantity"] == 2
    assert float(data["unit_price"]) == 300.0
    assert float(data["total_price"]) == 600.0
    assert data["payment_status"] == "unpaid"

    # 5. Caregiver initiates payment from the scan screen
    pay_resp = client.post(
        "/api/v1/caregiver/payments/initiate",
        json={"blood_request_id": data["request_id"]},
        headers=caregiver_headers,
    )
    assert pay_resp.status_code == 201
    assert float(pay_resp.json()["amount"]) == 600.0


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
