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
