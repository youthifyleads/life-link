from app.tests.conftest import auth_headers


def _create_assignment(client, admin_token):
    resp = client.post(
        "/api/v1/caregiver/assignments",
        headers=auth_headers(admin_token),
        json={
            "blood_bag_id": "bag_1",
            "caregiver_user_id": "usr_normal_1",
            "hospital_id": "hospital_1",
            "status": "assigned",
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_admin_can_create_caregiver_assignment(client, admin_token):
    body = _create_assignment(client, admin_token)
    assert body["caregiver_user_id"] == "usr_normal_1"
    assert body["status"] == "assigned"


def test_admin_sees_all_assignments_even_without_a_hospital(client, admin_token):
    """Regression test: admin has no hospital_id, so listing used to always
    return an empty list for admin/medical_lead/platform_support."""
    _create_assignment(client, admin_token)
    resp = client.get("/api/v1/caregiver/assignments", headers=auth_headers(admin_token))
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_caregiver_sees_their_own_assignment(client, admin_token, normal_user_token):
    _create_assignment(client, admin_token)
    resp = client.get("/api/v1/caregiver/assignments", headers=auth_headers(normal_user_token))
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["caregiver_user_id"] == "usr_normal_1"


def test_unrelated_user_cannot_view_someone_elses_assignment(client, admin_token, bloodbank_token):
    created = _create_assignment(client, admin_token)
    resp = client.get(
        f"/api/v1/caregiver/assignments/{created['id']}", headers=auth_headers(bloodbank_token)
    )
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "FORBIDDEN_ASSIGNMENT_ACCESS"


def test_creating_assignment_for_unknown_user_is_rejected(client, admin_token):
    resp = client.post(
        "/api/v1/caregiver/assignments",
        headers=auth_headers(admin_token),
        json={
            "blood_bag_id": "bag_1",
            "caregiver_user_id": "usr_does_not_exist",
            "hospital_id": "hospital_1",
        },
    )
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "CAREGIVER_NOT_FOUND"
