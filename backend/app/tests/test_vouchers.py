from datetime import datetime, timezone

from app.tests.conftest import auth_headers


def _confirmed_donation(client, donor_token):
    assert client.post("/api/v1/donors/me", json={"blood_type": "A+"}, headers=auth_headers(donor_token)).status_code == 201
    response = client.post("/api/v1/donors/me/donations", json={
        "blood_type": "A+", "quantity": "1", "donation_date": "2026-01-01",
        "blood_bank_id": "bloodbank_1", "status": "CONFIRMED",
    }, headers=auth_headers(donor_token))
    assert response.status_code == 201, response.text
    return response.json()


def test_confirmed_donation_automatically_issues_and_lists_own_voucher(client, donor_token):
    _confirmed_donation(client, donor_token)
    vouchers = client.get("/api/v1/vouchers/me", headers=auth_headers(donor_token))
    assert vouchers.status_code == 200
    item = vouchers.json()[0]
    assert item["code"].startswith("LLV-")
    assert item["status"] == "ACTIVE"
    assert item["donor_id"]
    assert item["partner_id"] is None
    assert item["transaction_reference"] is None


def test_issue_rejects_unconfirmed_and_duplicate_donations(client, donor_token, bloodbank_token):
    assert client.post("/api/v1/donors/me", json={"blood_type": "A+"}, headers=auth_headers(donor_token)).status_code == 201
    donation = client.post("/api/v1/donors/me/donations", json={
        "blood_type": "A+", "quantity": "1", "donation_date": "2026-01-01", "blood_bank_id": "bloodbank_1",
    }, headers=auth_headers(donor_token)).json()
    rejected = client.post("/api/v1/vouchers/issue", json={"donation_id": donation["id"]}, headers=auth_headers(bloodbank_token))
    assert rejected.status_code == 422
    assert rejected.json()["error"]["code"] == "DONATION_NOT_CONFIRMED"

    confirmed_response = client.post("/api/v1/donors/me/donations", json={
        "blood_type": "A+", "quantity": "1", "donation_date": "2026-02-01",
        "blood_bank_id": "bloodbank_1", "status": "CONFIRMED",
    }, headers=auth_headers(donor_token))
    assert confirmed_response.status_code == 201
    confirmed = confirmed_response.json()
    duplicate = client.post("/api/v1/vouchers/issue", json={"donation_id": confirmed["id"]}, headers=auth_headers(bloodbank_token))
    assert duplicate.status_code == 409
    assert duplicate.json()["error"]["code"] == "VOUCHER_ALREADY_ISSUED"


def test_partner_validation_redemption_and_double_redeem_protection(client, donor_token, bloodbank_token):
    _confirmed_donation(client, donor_token)
    voucher = client.get("/api/v1/vouchers/me", headers=auth_headers(donor_token)).json()[0]
    partner = "usr_bloodbank_1"
    validation_payload = {"voucher_code": voucher["code"], "donor_id": voucher["donor_id"], "partner_id": partner}
    validated = client.post("/api/v1/partners/vouchers/validate", json=validation_payload, headers=auth_headers(bloodbank_token))
    assert validated.status_code == 200, validated.text
    assert validated.json()["valid"] is True

    payload = {**validation_payload, "value": voucher["value"], "status": "REDEEMED", "redeemed_at": datetime.now(timezone.utc).isoformat()}
    redeemed = client.post("/api/v1/partners/vouchers/redeem", json=payload, headers=auth_headers(bloodbank_token))
    assert redeemed.status_code == 200, redeemed.text
    assert redeemed.json()["status"] == "REDEEMED"
    assert redeemed.json()["partner_id"] == partner
    assert redeemed.json()["transaction_reference"].startswith("VXR-")

    duplicate = client.post("/api/v1/partners/vouchers/redeem", json=payload, headers=auth_headers(bloodbank_token))
    assert duplicate.status_code == 409
    assert duplicate.json()["error"]["code"] == "VOUCHER_NOT_ACTIVE"


def test_partner_cannot_impersonate_or_alter_value(client, donor_token, bloodbank_token, hospital_token):
    _confirmed_donation(client, donor_token)
    voucher = client.get("/api/v1/vouchers/me", headers=auth_headers(donor_token)).json()[0]
    partner = "usr_bloodbank_1"
    forbidden = client.post("/api/v1/partners/vouchers/validate", json={
        "voucher_code": voucher["code"], "donor_id": voucher["donor_id"], "partner_id": partner,
    }, headers=auth_headers(hospital_token))
    assert forbidden.status_code == 403

    bad_value = client.post("/api/v1/partners/vouchers/redeem", json={
        "voucher_code": voucher["code"], "donor_id": voucher["donor_id"], "partner_id": partner,
        "value": "999", "status": "REDEEMED", "redeemed_at": datetime.now(timezone.utc).isoformat(),
    }, headers=auth_headers(bloodbank_token))
    assert bad_value.status_code == 422
    assert bad_value.json()["error"]["code"] == "VOUCHER_VALUE_MISMATCH"
