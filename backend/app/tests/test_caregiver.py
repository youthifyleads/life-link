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


def test_caregiver_can_scan_blood_bag_by_post(client, bloodbank_token, normal_user_token):
    # 1. Create a blood bag in inventory
    inv_resp = client.post(
        "/api/v1/inventory",
        headers=auth_headers(bloodbank_token),
        json={
            "blood_bank_id": "bloodbank_1",
            "blood_type": "A+",
            "component": "red_cells",
            "quantity_units": 5,
        },
    )
    assert inv_resp.status_code == 201
    item = inv_resp.json()
    bag_id = item["id"]

    # 2. Caregiver scans the bag via POST /caregiver/scan-bag
    scan_resp = client.post(
        "/api/v1/caregiver/scan-bag",
        headers=auth_headers(normal_user_token),
        json={"qr_code": bag_id},
    )
    assert scan_resp.status_code == 200, scan_resp.text
    body = scan_resp.json()
    assert body["blood_bag_id"] == bag_id
    assert body["blood_type"] == "A+"
    assert body["status"] == "available"
    assert body["bank_name"] == "Central Blood Bank"
    assert "Cairo" in body["bank_location"]

    # 3. Caregiver also scans using the bag's qr_code string
    scan_by_qr = client.post(
        "/api/v1/caregiver/scan-bag",
        headers=auth_headers(normal_user_token),
        json={"qr_code": body["qr_code"]},
    )
    assert scan_by_qr.status_code == 200
    assert scan_by_qr.json()["blood_bag_id"] == bag_id


def test_caregiver_can_get_blood_bag_by_qr_path(client, bloodbank_token, normal_user_token):
    # 1. Create a blood bag in inventory
    inv_resp = client.post(
        "/api/v1/inventory",
        headers=auth_headers(bloodbank_token),
        json={
            "blood_bank_id": "bloodbank_1",
            "blood_type": "O-",
            "component": "whole_blood",
            "quantity_units": 2,
        },
    )
    assert inv_resp.status_code == 201
    bag_id = inv_resp.json()["id"]

    # 2. Caregiver scans the bag via GET /caregiver/bag/{qr_code}
    resp = client.get(
        f"/api/v1/caregiver/bag/{bag_id}",
        headers=auth_headers(normal_user_token),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["blood_bag_id"] == bag_id
    assert body["blood_type"] == "O-"
    assert body["status"] == "available"
    assert body["bank_name"] == "Central Blood Bank"
    assert body["bank_location"] != ""


def test_qr_bag_scan_alias_endpoint(client, bloodbank_token, normal_user_token):
    inv_resp = client.post(
        "/api/v1/inventory",
        headers=auth_headers(bloodbank_token),
        json={
            "blood_bank_id": "bloodbank_1",
            "blood_type": "B+",
            "component": "platelets",
            "quantity_units": 1,
        },
    )
    bag_id = inv_resp.json()["id"]

    resp = client.post(
        "/api/v1/qr/bag-scan",
        headers=auth_headers(normal_user_token),
        json={"qr_code": bag_id},
    )
    assert resp.status_code == 200
    assert resp.json()["blood_type"] == "B+"
    assert resp.json()["bank_name"] == "Central Blood Bank"


def test_scan_bag_from_caregiver_assignment(client, admin_token, normal_user_token):
    _create_assignment(client, admin_token)
    resp = client.get(
        "/api/v1/caregiver/bag/bag_1",
        headers=auth_headers(normal_user_token),
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["blood_bag_id"] == "bag_1"
    assert body["status"] == "assigned"
    assert "bank_name" in body
    assert "bank_location" in body


def test_scan_nonexistent_bag_returns_404(client, normal_user_token):
    resp = client.post(
        "/api/v1/caregiver/scan-bag",
        headers=auth_headers(normal_user_token),
        json={"qr_code": "unknown_bag_999"},
    )
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "BLOOD_BAG_NOT_FOUND"


def test_caregiver_scans_hospital_staff_generated_qr(client, hospital_token, normal_user_token):
    # 1. Hospital staff creates a blood request
    req_resp = client.post(
        "/api/v1/requests",
        headers=auth_headers(hospital_token),
        json={
            "blood_type": "AB+",
            "component": "plasma",
            "quantity_units": 2,
            "urgency": True,
            "reason": "Emergency surgery",
        },
    )
    assert req_resp.status_code == 201
    req_id = req_resp.json()["id"]

    # 2. Hospital staff generates the QR for this request
    qr_resp = client.post(
        f"/api/v1/requests/{req_id}/qr",
        headers=auth_headers(hospital_token),
    )
    assert qr_resp.status_code == 200
    qr_data = qr_resp.json()
    qr_payload = qr_data["qr_payload"]
    assert qr_payload

    # 3. Caregiver scans this hospital staff-generated QR via POST /caregiver/scan-bag
    scan_resp = client.post(
        "/api/v1/caregiver/scan-bag",
        headers=auth_headers(normal_user_token),
        json={"qr_code": qr_payload},
    )
    assert scan_resp.status_code == 200, scan_resp.text
    body = scan_resp.json()
    assert body["blood_type"] == "AB+"
    assert body["status"] == "requested"
    assert body["bank_name"] == "Central Blood Bank"
    assert "Cairo" in body["bank_location"]
    assert body["request_id"] == req_id

    # 4. Caregiver can also scan via GET /caregiver/bag/{qr_code}
    get_resp = client.get(
        f"/api/v1/caregiver/bag/{qr_payload}",
        headers=auth_headers(normal_user_token),
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["bank_name"] == "Central Blood Bank"

    # 5. Caregiver can also scan via POST /qr/bag-scan
    tracking_resp = client.post(
        "/api/v1/qr/bag-scan",
        headers=auth_headers(normal_user_token),
        json={"qr_code": qr_payload},
    )
    assert tracking_resp.status_code == 200
    t_body = tracking_resp.json()
    assert t_body["bank_name"] == "Central Blood Bank"
    assert "Cairo" in t_body["bank_location"]
    assert t_body["blood_type"] == "AB+"
    assert t_body["status"] == "requested"
