from app.tests.conftest import auth_headers


def test_admin_can_list_users(client, admin_token):
    resp = client.get("/api/v1/users", headers=auth_headers(admin_token))
    assert resp.status_code == 200
    assert len(resp.json()) >= 3


def test_non_admin_forbidden_from_listing_users(client, hospital_token):
    resp = client.get("/api/v1/users", headers=auth_headers(hospital_token))
    assert resp.status_code == 403
    assert resp.json()["error"]["code"] == "FORBIDDEN_ROLE"


def test_unauthorized_request_to_rbac_route(client):
    resp = client.get("/api/v1/users")
    assert resp.status_code == 401


def test_admin_can_create_donor_with_phone_and_then_otp_login(client, admin_token):
    """A donor created by admin with a phone must be able to sign in via OTP -
    without this, POST /users had no way to create any account that could
    ever complete the mobile OTP flow (see UserCreate.phone)."""
    create_resp = client.post(
        "/api/v1/users",
        headers=auth_headers(admin_token),
        json={
            "email": "new.donor@lifelink.dev",
            "full_name": "New Donor",
            "password": "Donor@12345",
            "role": "normal_user",
            "phone": "01099999999",
        },
    )
    assert create_resp.status_code == 201, create_resp.text
    assert create_resp.json()["phone"] == "01099999999"

    otp_request = client.post("/api/v1/auth/otp/request", json={"phone": "01099999999"})
    assert otp_request.status_code == 200, otp_request.text
    dev_otp = otp_request.json()["dev_otp"]

    otp_verify = client.post("/api/v1/auth/otp/verify", json={"phone": "01099999999", "otp": dev_otp})
    assert otp_verify.status_code == 200, otp_verify.text
    assert "access_token" in otp_verify.json()
