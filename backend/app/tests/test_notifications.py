from app.tests.conftest import auth_headers


def test_notification_created_on_request_creation(client, hospital_token):
    client.post(
        "/api/v1/requests",
        json={"blood_type": "O+", "component": "whole_blood", "quantity_units": 1},
        headers=auth_headers(hospital_token),
    )
    resp = client.get("/api/v1/notifications", headers=auth_headers(hospital_token))
    assert resp.status_code == 200
    notifications = resp.json()
    assert any(n["trigger"] == "REQUEST_CREATED" for n in notifications)


def test_urgent_request_triggers_urgent_notification(client, hospital_token):
    client.post(
        "/api/v1/requests",
        json={"blood_type": "O+", "component": "whole_blood", "quantity_units": 1, "urgency": True},
        headers=auth_headers(hospital_token),
    )
    resp = client.get("/api/v1/notifications", headers=auth_headers(hospital_token))
    notifications = resp.json()
    assert any(n["trigger"] == "URGENT_REQUEST" for n in notifications)


def test_mark_notification_as_read(client, hospital_token):
    client.post(
        "/api/v1/requests",
        json={"blood_type": "O+", "component": "whole_blood", "quantity_units": 1},
        headers=auth_headers(hospital_token),
    )
    notifications = client.get("/api/v1/notifications", headers=auth_headers(hospital_token)).json()
    notification_id = notifications[0]["id"]

    resp = client.post(f"/api/v1/notifications/{notification_id}/read", headers=auth_headers(hospital_token))
    assert resp.status_code == 200
    assert resp.json()["is_read"] is True


def test_mark_nonexistent_notification_read_returns_404(client, hospital_token):
    resp = client.post("/api/v1/notifications/does-not-exist/read", headers=auth_headers(hospital_token))
    assert resp.status_code == 404
