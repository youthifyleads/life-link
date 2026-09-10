import pytest
from app.core.domain import Role
from app.repositories.sqlalchemy._mappers import role_from_db, role_to_db_aliases
from app.tests.conftest import auth_headers


def test_role_from_db_maps_all_database_names():
    """Verify that all PascalCase DB names, snake_case names, and legacy aliases map cleanly to domain Role."""
    test_cases = [
        # Admin
        ("SystemAdmin", Role.ADMIN),
        ("system_admin", Role.ADMIN),
        ("admin", Role.ADMIN),
        ("systemadmin", Role.ADMIN),
        # Hospital
        ("HospitalStaff", Role.HOSPITAL_USER),
        ("hospital_staff", Role.HOSPITAL_USER),
        ("hospital_user", Role.HOSPITAL_USER),
        ("hospitalstaff", Role.HOSPITAL_USER),
        # Blood Bank
        ("BloodBankStaff", Role.BLOOD_BANK_OPERATOR),
        ("blood_bank_staff", Role.BLOOD_BANK_OPERATOR),
        ("blood_bank_operator", Role.BLOOD_BANK_OPERATOR),
        ("bloodbankstaff", Role.BLOOD_BANK_OPERATOR),
        # Medical Lead
        ("MedicalLead", Role.MEDICAL_LEAD),
        ("medical_lead", Role.MEDICAL_LEAD),
        ("medicallead", Role.MEDICAL_LEAD),
        # Platform Support
        ("PlatformSupport", Role.PLATFORM_SUPPORT),
        ("platform_support", Role.PLATFORM_SUPPORT),
        ("platformsupport", Role.PLATFORM_SUPPORT),
        # Normal User / Donor / Caregiver
        ("NormalUser", Role.NORMAL_USER),
        ("normal_user", Role.NORMAL_USER),
        ("normaluser", Role.NORMAL_USER),
        ("Donor", Role.NORMAL_USER),
        ("donor", Role.NORMAL_USER),
        ("Caregiver", Role.NORMAL_USER),
        ("caregiver", Role.NORMAL_USER),
    ]

    for raw_name, expected_role in test_cases:
        mapped = role_from_db(raw_name)
        assert mapped == expected_role, f"Expected {raw_name} -> {expected_role}, got {mapped}"


def test_role_from_db_rejects_unknown_roles():
    with pytest.raises(ValueError):
        role_from_db("super_user")
    with pytest.raises(ValueError):
        role_from_db("")
    with pytest.raises(ValueError):
        role_from_db(None)


def test_role_to_db_aliases():
    for role in Role:
        aliases = role_to_db_aliases(role)
        assert isinstance(aliases, list)
        assert len(aliases) >= 1
        # Each alias must map back to the same role
        for alias in aliases:
            assert role_from_db(alias) == role


def test_all_seed_accounts_can_login_with_standard_password(client):
    """Verify that all active seed accounts authenticate successfully with Test@123."""
    accounts = [
        ("admin@lifelink.dev", "admin"),
        ("hospital@lifelink.dev", "hospital_user"),
        ("bloodbank@lifelink.dev", "blood_bank_operator"),
        ("medicallead@lifelink.dev", "medical_lead"),
        ("support@lifelink.dev", "platform_support"),
        ("donor@lifelink.dev", "normal_user"),
        ("user@lifelink.dev", "normal_user"),
    ]

    for email, expected_role in accounts:
        resp = client.post("/api/v1/auth/login", json={"email": email, "password": "Test@123"})
        assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
        body = resp.json()
        assert "access_token" in body

        # Verify /me endpoint returns the right profile and role
        me_resp = client.get("/api/v1/auth/me", headers=auth_headers(body["access_token"]))
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == email
        assert me_data["role"] == expected_role


def test_banned_user_login_is_rejected(client):
    resp = client.post("/api/v1/auth/login", json={"email": "banned@lifelink.dev", "password": "Test@123"})
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "ACCOUNT_BANNED"


def test_blood_request_creation_permission_matrix(client, hospital_token, admin_token, bloodbank_token):
    payload = {
        "blood_type": "O+",
        "component": "whole_blood",
        "quantity_units": 2,
        "urgency": False,
        "notes": "Test request",
    }

    # 1. Hospital user can create blood request
    hosp_resp = client.post("/api/v1/requests", headers=auth_headers(hospital_token), json=payload)
    assert hosp_resp.status_code == 201, hosp_resp.text
    created_id = hosp_resp.json()["id"]

    # 2. Admin cannot create blood request (restricted by business rule)
    admin_resp = client.post("/api/v1/requests", headers=auth_headers(admin_token), json=payload)
    assert admin_resp.status_code == 403
    assert admin_resp.json()["error"]["code"] == "FORBIDDEN_ROLE"

    # 3. Blood bank user cannot create blood request
    bb_resp = client.post("/api/v1/requests", headers=auth_headers(bloodbank_token), json=payload)
    assert bb_resp.status_code == 403
    assert bb_resp.json()["error"]["code"] == "FORBIDDEN_ROLE"

    # 4. Admin CAN view the created request
    get_resp = client.get(f"/api/v1/requests/{created_id}", headers=auth_headers(admin_token))
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == created_id
