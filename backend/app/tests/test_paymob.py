import hashlib
import hmac
from unittest.mock import AsyncMock, patch

from app.core.paymob import PaymobClient
from app.tests.conftest import auth_headers


def _generate_hmac(obj: dict, hmac_secret: str) -> str:
    keys = [
        "amount_cents",
        "created_at",
        "currency",
        "error_occured",
        "has_parent_transaction",
        "id",
        "integration_id",
        "is_3d_secure",
        "is_auth",
        "is_capture",
        "is_refunded",
        "is_standalone_payment",
        "is_voided",
        "order.id",
        "owner",
        "pending",
        "source_data.pan",
        "source_data.sub_type",
        "source_data.type",
        "success",
    ]

    parts = []
    for k in keys:
        if "." in k:
            p1, p2 = k.split(".")
            val = obj.get(p1, {}).get(p2) if isinstance(obj.get(p1), dict) else ""
        else:
            val = obj.get(k)

        if val is None:
            parts.append("")
        elif isinstance(val, bool):
            parts.append("true" if val else "false")
        else:
            parts.append(str(val))

    s = "".join(parts)
    return hmac.new(hmac_secret.encode(), s.encode(), hashlib.sha512).hexdigest()


def test_paymob_hmac_calculation_and_verification():
    client = PaymobClient(hmac_secret="42F9F7F61E81C60BAE9FD707C8FC31D8")
    sample_obj = {
        "amount_cents": 100000,
        "created_at": "2026-09-13T00:00:00.000000",
        "currency": "EGP",
        "error_occured": False,
        "has_parent_transaction": False,
        "id": 12345678,
        "integration_id": 99999,
        "is_3d_secure": True,
        "is_auth": False,
        "is_capture": False,
        "is_refunded": False,
        "is_standalone_payment": True,
        "is_voided": False,
        "order": {"id": 888888},
        "owner": 100,
        "pending": False,
        "source_data": {"pan": "2345", "sub_type": "MasterCard", "type": "card"},
        "success": True,
    }

    valid_hmac = _generate_hmac(sample_obj, "42F9F7F61E81C60BAE9FD707C8FC31D8")
    assert client.verify_hmac(sample_obj, valid_hmac) is True
    assert client.verify_hmac(sample_obj, "invalid_hmac_string") is False


def test_initiate_payment_flow(client, hospital_token):
    # 1. Create a blood request
    req_resp = client.post(
        "/api/v1/requests",
        json={"blood_type": "A+", "component": "whole_blood", "quantity_units": 2},
        headers=auth_headers(hospital_token),
    )
    assert req_resp.status_code == 201
    blood_request_id = req_resp.json()["id"]

    # 2. Initiate payment
    init_resp = client.post(
        "/api/v1/payments/initiate",
        json={"blood_request_id": blood_request_id, "payment_method": "card"},
        headers=auth_headers(hospital_token),
    )
    assert init_resp.status_code == 201
    body = init_resp.json()

    assert body["blood_request_id"] == blood_request_id
    assert body["payment_status"] == "pending"
    assert body["currency"] == "EGP"
    assert body["provider"] == "paymob"
    assert float(body["amount"]) == 1000.0  # 2 units * 500 EGP default
    assert "unifiedcheckout" in (body["checkout_url"] or "")

    # 3. Verify it is listed in payments for this request
    list_resp = client.get(
        f"/api/v1/payments/request/{blood_request_id}",
        headers=auth_headers(hospital_token),
    )
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1


def test_paymob_webhook_success_and_idempotency(client, hospital_token):
    # 1. Create a blood request
    req_resp = client.post(
        "/api/v1/requests",
        json={"blood_type": "O-", "component": "whole_blood", "quantity_units": 1},
        headers=auth_headers(hospital_token),
    )
    blood_request_id = req_resp.json()["id"]

    # 2. Initiate payment
    init_resp = client.post(
        "/api/v1/payments/initiate",
        json={"blood_request_id": blood_request_id, "payment_method": "card"},
        headers=auth_headers(hospital_token),
    )
    assert init_resp.status_code == 201
    order_id = init_resp.json()["provider_order_id"]

    # 3. Construct webhook transaction callback
    transaction_obj = {
        "amount_cents": 50000,
        "created_at": "2026-09-13T00:00:00.000000",
        "currency": "EGP",
        "error_occured": False,
        "has_parent_transaction": False,
        "id": 99887766,
        "integration_id": 1234,
        "is_3d_secure": True,
        "is_auth": False,
        "is_capture": False,
        "is_refunded": False,
        "is_standalone_payment": True,
        "is_voided": False,
        "order": {"id": order_id, "extras": {"blood_request_id": blood_request_id}},
        "owner": 100,
        "pending": False,
        "source_data": {"pan": "1234", "sub_type": "Visa", "type": "card"},
        "success": True,
    }
    hmac_secret = "42F9F7F61E81C60BAE9FD707C8FC31D8"
    valid_hmac = _generate_hmac(transaction_obj, hmac_secret)

    # 4. Post Webhook with HMAC
    webhook_resp = client.post(
        f"/api/v1/payments/webhook?hmac={valid_hmac}",
        json={"type": "TRANSACTION", "obj": transaction_obj},
    )
    assert webhook_resp.status_code == 200
    assert webhook_resp.json()["status"] == "success"

    # 5. Check request status updated to confirmed
    get_req = client.get(f"/api/v1/requests/{blood_request_id}", headers=auth_headers(hospital_token))
    assert get_req.status_code == 200
    assert get_req.json()["status"] == "confirmed"

    # 6. Idempotency test: duplicate webhook call returns already_processed
    dup_resp = client.post(
        f"/api/v1/payments/webhook?hmac={valid_hmac}",
        json={"type": "TRANSACTION", "obj": transaction_obj},
    )
    assert dup_resp.status_code == 200
    assert dup_resp.json()["status"] == "already_processed"


def test_paymob_webhook_invalid_hmac_rejected(client, hospital_token):
    # Post Webhook with invalid HMAC signature
    webhook_resp = client.post(
        "/api/v1/payments/webhook?hmac=completely_invalid_hmac",
        json={"type": "TRANSACTION", "obj": {"id": 111, "success": True}},
    )
    assert webhook_resp.status_code == 422
    assert webhook_resp.json()["error"]["code"] == "INVALID_HMAC_SIGNATURE"


def test_initiate_payment_duplicate_when_paid_rejected(client, hospital_token):
    # 1. Create request & initiate payment
    req_resp = client.post(
        "/api/v1/requests",
        json={"blood_type": "B+", "component": "whole_blood", "quantity_units": 1},
        headers=auth_headers(hospital_token),
    )
    blood_request_id = req_resp.json()["id"]

    init_resp = client.post(
        "/api/v1/payments/initiate",
        json={"blood_request_id": blood_request_id},
        headers=auth_headers(hospital_token),
    )
    order_id = init_resp.json()["provider_order_id"]

    # 2. Mark paid via webhook
    transaction_obj = {
        "amount_cents": 50000,
        "created_at": "2026-09-13T00:00:00.000000",
        "currency": "EGP",
        "error_occured": False,
        "has_parent_transaction": False,
        "id": 55443322,
        "integration_id": 1234,
        "is_3d_secure": True,
        "is_auth": False,
        "is_capture": False,
        "is_refunded": False,
        "is_standalone_payment": True,
        "is_voided": False,
        "order": {"id": order_id, "extras": {"blood_request_id": blood_request_id}},
        "owner": 100,
        "pending": False,
        "source_data": {"pan": "1234", "sub_type": "Visa", "type": "card"},
        "success": True,
    }
    hmac_secret = "42F9F7F61E81C60BAE9FD707C8FC31D8"
    valid_hmac = _generate_hmac(transaction_obj, hmac_secret)

    client.post(
        f"/api/v1/payments/webhook?hmac={valid_hmac}",
        json={"type": "TRANSACTION", "obj": transaction_obj},
    )

    # 3. Attempt to initiate another payment for the same request
    dup_init = client.post(
        "/api/v1/payments/initiate",
        json={"blood_request_id": blood_request_id},
        headers=auth_headers(hospital_token),
    )
    assert dup_init.status_code == 409
    assert dup_init.json()["error"]["code"] == "ALREADY_PAID"
