import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

from app.main import app
from app.services import dependencies as deps


def auth(client: TestClient, email: str, password: str = "Test@123") -> dict[str, str]:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    return {"Authorization": "Bearer " + res.json()["access_token"]}


@pytest.fixture(autouse=True)
def reset():
    deps.reset_all_repositories()
    yield
    deps.reset_all_repositories()


def test_full_request_bag_allocation_lifecycle():
    client = TestClient(app)
    hosp_headers = auth(client, "hospital@lifelink.dev")
    bb_headers = auth(client, "bloodbank@lifelink.dev")
    caregiver_headers = auth(client, "user@lifelink.dev")

    # 1. Hospital creates request for 2 units of O-
    req_res = client.post(
        "/api/v1/requests",
        headers=hosp_headers,
        json={
            "blood_type": "O-",
            "quantity_units": 2,
            "urgency": True,
            "component": "packed_red_blood_cells",
            "notes": "Patient in ICU, emergency surgery",
        },
    )
    assert req_res.status_code == 201, req_res.text
    req_data = req_res.json()
    req_id = req_data["id"]
    qr_code = req_data["tracking_reference"]
    assert req_data["status"] == "requested"
    assert req_data["quantity_units"] == 2

    # 2. Blood bank acknowledges request and sets unit price to 350.0 EGP
    ack_res = client.post(
        f"/api/v1/requests/{req_id}/acknowledge",
        headers=bb_headers,
        json={"unit_price": 350.0, "notes": "We have matching units ready for allocation"},
    )
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "acknowledged"
    assert ack_res.json()["unit_price"] == 350.0

    # 3. Blood bank adds blood bags to inventory
    # Valid bag 1
    b1_res = client.post(
        "/api/v1/blood-bags",
        headers=bb_headers,
        json={
            "blood_type": "O-",
            "component": "packed_red_blood_cells",
            "quantity": 1,
            "collection_date": "2026-09-01",
            "current_location": "Nile Bank Main Storage",
        },
    )
    assert b1_res.status_code == 201
    b1_barcode = b1_res.json()["qr_code"]

    # Valid bag 2
    b2_res = client.post(
        "/api/v1/blood-bags",
        headers=bb_headers,
        json={
            "blood_type": "O-",
            "component": "packed_red_blood_cells",
            "quantity": 1,
            "collection_date": "2026-09-02",
            "current_location": "Nile Bank Main Storage",
        },
    )
    assert b2_res.status_code == 201
    b2_barcode = b2_res.json()["qr_code"]

    # Wrong blood type bag (A+)
    b_wrong = client.post(
        "/api/v1/blood-bags",
        headers=bb_headers,
        json={
            "blood_type": "A+",
            "component": "packed_red_blood_cells",
            "quantity": 1,
            "collection_date": "2026-09-01",
        },
    )
    assert b_wrong.status_code == 201
    b_wrong_barcode = b_wrong.json()["qr_code"]

    # Expired bag (expired 2 days ago)
    expired_date = (datetime.now(timezone.utc) - timedelta(days=2)).date().isoformat()
    b_exp = client.post(
        "/api/v1/blood-bags",
        headers=bb_headers,
        json={
            "blood_type": "O-",
            "component": "packed_red_blood_cells",
            "quantity": 1,
            "collection_date": "2026-08-01",
            "expiry_date": expired_date,
        },
    )
    assert b_exp.status_code == 201
    b_exp_barcode = b_exp.json()["qr_code"]

    # 4. Try allocating wrong blood type -> 409 Conflict
    alloc_wrong = client.post(
        f"/api/v1/requests/{req_id}/allocate-bag",
        headers=bb_headers,
        json={"barcode": b_wrong_barcode},
    )
    assert alloc_wrong.status_code == 409
    assert alloc_wrong.json()["error"]["code"] == "BLOOD_TYPE_MISMATCH"

    # 5. Try allocating expired bag -> 409 Conflict
    alloc_exp = client.post(
        f"/api/v1/requests/{req_id}/allocate-bag",
        headers=bb_headers,
        json={"barcode": b_exp_barcode},
    )
    assert alloc_exp.status_code == 409
    assert alloc_exp.json()["error"]["code"] == "BAG_EXPIRED"

    # 6. Allocate Bag 1 -> Success (1/2)
    alloc_1 = client.post(
        f"/api/v1/requests/{req_id}/allocate-bag",
        headers=bb_headers,
        json={"barcode": b1_barcode},
    )
    assert alloc_1.status_code == 200
    a1_data = alloc_1.json()
    assert a1_data["currently_allocated"] == 1
    assert a1_data["required_quantity"] == 2
    assert a1_data["is_fulfilled"] is False

    # Check request status is still acknowledged
    req_chk = client.get(f"/api/v1/requests/{req_id}", headers=bb_headers).json()
    assert req_chk["status"] == "acknowledged"

    # 7. Caregiver scans Request QR -> receives consolidated summary and pricing
    scan_res = client.post(
        "/api/v1/caregiver/scan-bag",
        headers=caregiver_headers,
        json={"qr_code": qr_code},
    )
    assert scan_res.status_code == 200
    info = scan_res.json()
    assert info["blood_type"] == "O-"
    assert info["quantity"] == 2
    assert info["unit_price"] == 350.0
    assert info["total_price"] == 700.0
    assert info["payment_status"] == "unpaid"
    assert info["bank_name"] is not None

    # 8. Allocate Bag 2 -> Success (2/2) & Auto-advances to CONFIRMED
    alloc_2 = client.post(
        f"/api/v1/requests/{req_id}/allocate-bag",
        headers=bb_headers,
        json={"barcode": b2_barcode},
    )
    assert alloc_2.status_code == 200
    a2_data = alloc_2.json()
    assert a2_data["currently_allocated"] == 2
    assert a2_data["is_fulfilled"] is True

    # Request is now confirmed
    req_chk2 = client.get(f"/api/v1/requests/{req_id}", headers=bb_headers).json()
    assert req_chk2["status"] == "confirmed"

    # 9. Trying to allocate a 3rd bag -> 409 Conflict
    b3 = client.post(
        "/api/v1/blood-bags",
        headers=bb_headers,
        json={
            "blood_type": "O-",
            "component": "packed_red_blood_cells",
            "quantity": 1,
            "collection_date": "2026-09-03",
        },
    ).json()
    alloc_overflow = client.post(
        f"/api/v1/requests/{req_id}/allocate-bag",
        headers=bb_headers,
        json={"barcode": b3["qr_code"]},
    )
    assert alloc_overflow.status_code == 409
    assert alloc_overflow.json()["error"]["code"] == "QUOTA_ALREADY_FULFILLED"

    # Verify listing allocated bags
    allocated_bags = client.get(f"/api/v1/requests/{req_id}/allocated-bags", headers=bb_headers).json()
    assert len(allocated_bags) == 2
    barcodes = {b["qr_code"] for b in allocated_bags}
    assert b1_barcode in barcodes
    assert b2_barcode in barcodes

    # 10. Blood bank dispatches to caregiver -> Bags become in_transit and history is recorded
    dispatch_res = client.post(
        f"/api/v1/requests/{req_id}/dispatch",
        headers=bb_headers,
        json={"notes": "Handed over to caregiver in cold storage box"},
    )
    assert dispatch_res.status_code == 200
    assert dispatch_res.json()["status"] == "prepared"

    # Check both bags have in_transit status and history
    for bid in [alloc_1.json()["allocated_bag_id"], alloc_2.json()["allocated_bag_id"]]:
        hist = client.get(f"/api/v1/blood-bags/{bid}/history", headers=bb_headers).json()
        statuses = [h["status"] for h in hist]
        assert "allocated" in statuses
        assert "in_transit" in statuses

    # 11. Hospital receives the blood units -> Request completed, bags marked received
    receive_res = client.post(
        f"/api/v1/requests/{req_id}/receive",
        headers=hosp_headers,
        json={"notes": "Checked temperature at hospital lab, blood intact"},
    )
    assert receive_res.status_code == 200
    assert receive_res.json()["status"] == "completed"

    for bid in [alloc_1.json()["allocated_bag_id"], alloc_2.json()["allocated_bag_id"]]:
        hist = client.get(f"/api/v1/blood-bags/{bid}/history", headers=bb_headers).json()
        statuses = [h["status"] for h in hist]
        assert "received" in statuses


def test_deallocate_bag_moves_to_quarantine_and_reverts_request_status():
    client = TestClient(app)
    hosp_headers = auth(client, "hospital@lifelink.dev")
    bb_headers = auth(client, "bloodbank@lifelink.dev")

    # 1. Create a 1-unit request
    req = client.post(
        "/api/v1/requests",
        headers=hosp_headers,
        json={"blood_type": "B+", "quantity_units": 1, "urgency": False, "component": "whole_blood"},
    ).json()

    # 2. Acknowledge and create bag
    client.post(f"/api/v1/requests/{req['id']}/acknowledge", headers=bb_headers, json={"unit_price": 200.0})
    bag = client.post(
        "/api/v1/blood-bags",
        headers=bb_headers,
        json={"blood_type": "B+", "quantity": 1, "collection_date": "2026-09-01"},
    ).json()

    # 3. Allocate bag -> Request fulfilled and confirmed
    client.post(
        f"/api/v1/requests/{req['id']}/allocate-bag",
        headers=bb_headers,
        json={"barcode": bag["qr_code"]},
    )
    chk = client.get(f"/api/v1/requests/{req['id']}", headers=bb_headers).json()
    assert chk["status"] == "confirmed"

    # 4. Deallocate bag -> Bag moves to quarantine for safety, request reverts to acknowledged
    deal_res = client.post(
        f"/api/v1/requests/{req['id']}/deallocate-bag",
        headers=bb_headers,
        json={"barcode": bag["qr_code"], "reason": "Accidental scan / Wrong cooler"},
    )
    assert deal_res.status_code == 200
    data = deal_res.json()
    assert data["status"] == "quarantine"
    assert data["currently_allocated"] == 0
    assert data["is_fulfilled"] is False

    # Check request reverted
    chk_revert = client.get(f"/api/v1/requests/{req['id']}", headers=bb_headers).json()
    assert chk_revert["status"] == "acknowledged"

    # Check bag history has quarantine entry
    hist = client.get(f"/api/v1/blood-bags/{bag['id']}/history", headers=bb_headers).json()
    assert hist[-1]["status"] == "quarantine"
    assert "Accidental scan" in hist[-1]["notes"]


def test_cancel_request_moves_all_allocated_bags_to_quarantine():
    client = TestClient(app)
    hosp_headers = auth(client, "hospital@lifelink.dev")
    bb_headers = auth(client, "bloodbank@lifelink.dev")

    # 1. Create a 2-unit request
    req = client.post(
        "/api/v1/requests",
        headers=hosp_headers,
        json={"blood_type": "AB+", "quantity_units": 2, "urgency": False, "component": "whole_blood"},
    ).json()

    client.post(f"/api/v1/requests/{req['id']}/acknowledge", headers=bb_headers, json={"unit_price": 400.0})

    # 2. Create and allocate 1 bag
    bag = client.post(
        "/api/v1/blood-bags",
        headers=bb_headers,
        json={"blood_type": "AB+", "quantity": 1, "collection_date": "2026-09-01"},
    ).json()

    client.post(
        f"/api/v1/requests/{req['id']}/allocate-bag",
        headers=bb_headers,
        json={"barcode": bag["qr_code"]},
    )

    # 3. Hospital cancels request
    cancel_res = client.post(
        f"/api/v1/requests/{req['id']}/cancel",
        headers=hosp_headers,
        json={"reason": "Patient condition stabilized, no transfusion needed"},
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # 4. Verify allocated bag was safely transitioned to quarantine
    hist = client.get(f"/api/v1/blood-bags/{bag['id']}/history", headers=bb_headers).json()
    assert hist[-1]["status"] == "quarantine"
    assert "Patient condition stabilized" in hist[-1]["notes"]
