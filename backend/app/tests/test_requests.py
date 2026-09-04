from app.tests.conftest import auth_headers


def _create_request(client, hospital_token, **overrides):
    payload = {"blood_type": "O+", "component": "whole_blood", "quantity_units": 2}
    payload.update(overrides)
    return client.post("/api/v1/requests", json=payload, headers=auth_headers(hospital_token))


def test_create_valid_request(client, hospital_token):
    resp = _create_request(client, hospital_token)
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "requested"
    assert body["tracking_reference"].startswith("LL-")


def test_create_request_invalid_quantity_rejected(client, hospital_token):
    resp = _create_request(client, hospital_token, quantity_units=0)
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "VALIDATION_ERROR"


def test_create_request_missing_field_rejected(client, hospital_token):
    resp = client.post(
        "/api/v1/requests", json={"component": "whole_blood", "quantity_units": 1}, headers=auth_headers(hospital_token)
    )
    assert resp.status_code == 422


def test_only_hospital_user_can_create_request(client, bloodbank_token):
    resp = _create_request(client, bloodbank_token)
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "FORBIDDEN_ROLE"


def test_get_nonexistent_request_returns_404(client, hospital_token):
    resp = client.get("/api/v1/requests/does-not-exist", headers=auth_headers(hospital_token))
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "REQUEST_NOT_FOUND"


def test_valid_status_transition_lifecycle(client, hospital_token, bloodbank_token):
    created = _create_request(client, hospital_token).json()
    request_id = created["id"]

    r = client.post(f"/api/v1/requests/{request_id}/acknowledge", headers=auth_headers(bloodbank_token))
    assert r.status_code == 200
    assert r.json()["status"] == "acknowledged"

    r = client.post(f"/api/v1/requests/{request_id}/confirm", headers=auth_headers(bloodbank_token))
    assert r.status_code == 200
    assert r.json()["status"] == "confirmed"

    r = client.post(f"/api/v1/requests/{request_id}/prepare", headers=auth_headers(bloodbank_token))
    assert r.status_code == 200
    assert r.json()["status"] == "prepared"

    r = client.post(f"/api/v1/requests/{request_id}/complete", headers=auth_headers(bloodbank_token))
    assert r.status_code == 200
    assert r.json()["status"] == "completed"


def test_invalid_status_transition_rejected(client, hospital_token, bloodbank_token):
    created = _create_request(client, hospital_token).json()
    request_id = created["id"]

    # Cannot jump straight to "complete" from "requested"
    r = client.post(f"/api/v1/requests/{request_id}/complete", headers=auth_headers(bloodbank_token))
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "INVALID_STATUS_TRANSITION"


def test_completed_request_cannot_transition_further(client, hospital_token, bloodbank_token):
    created = _create_request(client, hospital_token).json()
    request_id = created["id"]
    for action in ("acknowledge", "confirm", "prepare", "complete"):
        client.post(f"/api/v1/requests/{request_id}/{action}", headers=auth_headers(bloodbank_token))

    r = client.post(f"/api/v1/requests/{request_id}/cancel", headers=auth_headers(bloodbank_token))
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "INVALID_STATUS_TRANSITION"


def test_cancellation_from_requested(client, hospital_token):
    created = _create_request(client, hospital_token).json()
    request_id = created["id"]
    r = client.post(f"/api/v1/requests/{request_id}/cancel", headers=auth_headers(hospital_token))
    assert r.status_code == 200
    assert r.json()["status"] == "cancelled"


def test_duplicate_request_allowed_as_separate_records(client, hospital_token):
    # The MVP does not block duplicate requests outright (edge case is
    # tracked, not rejected) - two identical requests should just create
    # two distinct tracking references.
    r1 = _create_request(client, hospital_token)
    r2 = _create_request(client, hospital_token)
    assert r1.status_code == 201 and r2.status_code == 201
    assert r1.json()["id"] != r2.json()["id"]
    assert r1.json()["tracking_reference"] != r2.json()["tracking_reference"]


def test_hospital_user_cannot_view_other_hospitals_request(client, hospital_token, admin_token):
    # Create a second hospital user scoped to a different hospital via admin
    resp = client.post(
        "/api/v1/users",
        json={
            "email": "hospital2@lifelink.dev",
            "full_name": "Second Hospital",
            "password": "password123",
            "role": "hospital_user",
            "institution_id": "hospital_2",
        },
        headers=auth_headers(admin_token),
    )
    assert resp.status_code == 201

    login_resp = client.post("/api/v1/auth/login", json={"email": "hospital2@lifelink.dev", "password": "password123"})
    other_hospital_token = login_resp.json()["access_token"]

    created = _create_request(client, hospital_token).json()
    r = client.get(f"/api/v1/requests/{created['id']}", headers=auth_headers(other_hospital_token))
    assert r.status_code == 403
    assert r.json()["error"]["code"] == "FORBIDDEN_REQUEST_ACCESS"
