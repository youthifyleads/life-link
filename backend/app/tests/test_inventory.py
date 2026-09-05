from app.tests.conftest import auth_headers


def _create_item(client, bloodbank_token, **overrides):
    payload = {"blood_bank_id": "bloodbank_1", "blood_type": "A+", "component": "plasma", "quantity_units": 10}
    payload.update(overrides)
    return client.post("/api/v1/inventory", json=payload, headers=auth_headers(bloodbank_token))


def test_valid_inventory_creation_and_update(client, bloodbank_token):
    created = _create_item(client, bloodbank_token)
    assert created.status_code == 201
    item_id = created.json()["id"]

    updated = client.patch(f"/api/v1/inventory/{item_id}", json={"quantity_units": 5}, headers=auth_headers(bloodbank_token))
    assert updated.status_code == 200
    assert updated.json()["quantity_units"] == 5


def test_invalid_inventory_negative_quantity_rejected(client, bloodbank_token):
    resp = _create_item(client, bloodbank_token, quantity_units=-1)
    assert resp.status_code == 422


def test_unauthorized_update_of_other_blood_bank_rejected(client, bloodbank_token, admin_token):
    # bloodbank_token belongs to bloodbank_1; try to report inventory for a different bank
    resp = _create_item(client, bloodbank_token, blood_bank_id="bloodbank_2")
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "FORBIDDEN_INVENTORY_ACCESS"


def test_hospital_user_cannot_create_inventory(client, hospital_token):
    resp = client.post(
        "/api/v1/inventory",
        json={"blood_bank_id": "bloodbank_1", "blood_type": "O-", "component": "red_cells", "quantity_units": 3},
        headers=auth_headers(hospital_token),
    )
    assert resp.status_code == 403
