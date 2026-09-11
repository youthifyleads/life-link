import pytest
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


def test_notification_linked_to_blood_request_preserves_related_request_id(client, hospital_token):
    create_resp = client.post(
        "/api/v1/requests",
        json={"blood_type": "A+", "component": "platelets", "quantity_units": 3},
        headers=auth_headers(hospital_token),
    )
    assert create_resp.status_code == 201
    created_request_id = create_resp.json()["id"]

    resp = client.get("/api/v1/notifications", headers=auth_headers(hospital_token))
    assert resp.status_code == 200
    notifications = resp.json()
    matching = [n for n in notifications if n.get("related_request_id") == created_request_id]
    assert len(matching) >= 1
    assert matching[0]["related_request_id"] == created_request_id


@pytest.mark.asyncio
async def test_generic_notification_has_null_related_request_id(client, hospital_token):
    from app.services.dependencies import _memory_notification_repository
    from app.services.notification_service import NotificationService
    from app.core.domain import NotificationTrigger
    
    # Send a generic notification without a related request
    notif_service = NotificationService(_memory_notification_repository())
    await notif_service.notify(
        user_id="usr_hospital_1",
        trigger=NotificationTrigger.REQUEST_STATUS_CHANGED,
        message="System broadcast: Maintenance scheduled",
        related_request_id=None,
    )

    resp = client.get("/api/v1/notifications", headers=auth_headers(hospital_token))
    assert resp.status_code == 200
    notifications = resp.json()
    broadcast = [n for n in notifications if "System broadcast" in n["message"]]
    assert len(broadcast) >= 1
    assert broadcast[0]["related_request_id"] is None
