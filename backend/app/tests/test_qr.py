from app.tests.conftest import auth_headers


def test_valid_reference_scan_returns_no_sensitive_info(client, hospital_token):
    created = client.post(
        "/api/v1/requests",
        json={"blood_type": "B+", "component": "platelets", "quantity_units": 1},
        headers=auth_headers(hospital_token),
    ).json()

    resp = client.post(
        "/api/v1/qr/scan", json={"reference": created["tracking_reference"]}, headers=auth_headers(hospital_token)
    )
    assert resp.status_code == 200
    body = resp.json()
    assert set(body.keys()) == {"reference", "status", "blood_type", "component", "last_updated"}
    assert "notes" not in body
    assert "hospital_id" not in body


def test_invalid_reference_returns_404(client, hospital_token):
    resp = client.post("/api/v1/qr/scan", json={"reference": "LL-does-not-exist"}, headers=auth_headers(hospital_token))
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "REFERENCE_NOT_FOUND"


def test_unauthorized_scan_rejected(client, hospital_token, admin_token):
    # A second hospital's user should not be able to scan hospital_1's request
    client.post(
        "/api/v1/users",
        json={
            "email": "hospital3@lifelink.dev",
            "full_name": "Third Hospital",
            "password": "Hospital@123",
            "role": "hospital_user",
            "institution_id": "hospital_3",
        },
        headers=auth_headers(admin_token),
    )
    other_token = client.post(
        "/api/v1/auth/login", json={"email": "hospital3@lifelink.dev", "password": "Hospital@123"}
    ).json()["access_token"]

    created = client.post(
        "/api/v1/requests",
        json={"blood_type": "AB-", "component": "red_cells", "quantity_units": 1},
        headers=auth_headers(hospital_token),
    ).json()

    resp = client.post(
        "/api/v1/qr/scan", json={"reference": created["tracking_reference"]}, headers=auth_headers(other_token)
    )
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "FORBIDDEN_TRACKING_ACCESS"


def test_tracking_endpoint_matches_scan(client, hospital_token):
    created = client.post(
        "/api/v1/requests",
        json={"blood_type": "O+", "component": "whole_blood", "quantity_units": 1},
        headers=auth_headers(hospital_token),
    ).json()
    resp = client.get(f"/api/v1/tracking/{created['tracking_reference']}", headers=auth_headers(hospital_token))
    assert resp.status_code == 200
    assert resp.json()["status"] == "requested"


def test_blood_bag_qr_resolves_real_bag_status_and_movement_history(client, admin_token):
    created = client.post(
        "/api/v1/blood-bags",
        json={
            "blood_type": "O-",
            "quantity": 1,
            "collection_date": "2026-09-01",
            "current_location": "Blood Bank A",
        },
        headers=auth_headers(admin_token),
    )
    assert created.status_code == 201, created.text
    bag = created.json()

    for status in ["reserved", "allocated", "in_transit", "delivered", "received"]:
        response = client.patch(
            f"/api/v1/blood-bags/{bag['id']}/status",
            json={"status": status},
            headers=auth_headers(admin_token),
        )
        assert response.status_code == 200, response.text

    issued = client.get(f"/api/v1/blood-bags/{bag['id']}/qr", headers=auth_headers(admin_token))
    assert issued.status_code == 200
    payload = issued.json()
    assert payload["blood_bag_id"] == bag["id"]
    assert payload["qr_payload"] == bag["qr_code"]

    scanned = client.post(
        "/api/v1/blood-bags/scan",
        json={"qr_code": payload["qr_payload"]},
        headers=auth_headers(admin_token),
    )
    assert scanned.status_code == 200, scanned.text
    body = scanned.json()
    assert body["blood_bag"]["id"] == bag["id"]
    assert body["blood_bag"]["status"] == "received"
    assert body["blood_bag"]["qr_code"] == payload["qr_payload"]
    assert len(body["movement_history"]) == 6
    assert [x["status"] for x in body["movement_history"]] == [
        "available", "reserved", "allocated", "in_transit", "delivered", "received"
    ]


def test_blood_bag_qr_scan_invalid_code_returns_404(client, admin_token):
    response = client.post(
        "/api/v1/blood-bags/scan",
        json={"qr_code": "LL-BAG-does-not-exist"},
        headers=auth_headers(admin_token),
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "BLOOD_BAG_QR_NOT_FOUND"
