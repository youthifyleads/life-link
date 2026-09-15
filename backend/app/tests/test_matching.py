from datetime import date, timedelta
from app.services.matching_service import haversine_distance, COMPATIBLE_DONORS_FOR_RECIPIENT
from app.tests.conftest import auth_headers


def test_haversine_distance_accuracy():
    # Cairo Center (Tahrir) to Alexandria Center
    cairo_lat, cairo_lon = 30.0444, 31.2357
    alex_lat, alex_lon = 31.2001, 29.9187
    dist = haversine_distance(cairo_lat, cairo_lon, alex_lat, alex_lon)
    # Great circle distance is ~180 km
    assert 170 <= dist <= 190


def test_blood_compatibility_rules():
    # Universal donor O- can donate to all
    for recipient, donors in COMPATIBLE_DONORS_FOR_RECIPIENT.items():
        assert "O-" in donors, f"O- must be compatible for recipient {recipient}"

    # O- recipient only receives O-
    assert COMPATIBLE_DONORS_FOR_RECIPIENT["O-"] == {"O-"}

    # AB+ universal recipient receives from all 8
    assert len(COMPATIBLE_DONORS_FOR_RECIPIENT["AB+"]) == 8

    # A+ receives from O-, O+, A-, A+
    assert COMPATIBLE_DONORS_FOR_RECIPIENT["A+"] == {"O-", "O+", "A-", "A+"}


def _create_donor_user(client, admin_token, email, full_name, blood_type, eligibility, last_donation_days_ago, lat, lng, gov="Cairo"):
    # 1. Create user
    user_resp = client.post(
        "/api/v1/users",
        headers=auth_headers(admin_token),
        json={
            "email": email,
            "full_name": full_name,
            "password": "Test@Password123",
            "role": "normal_user",
            "phone": "01000000099",
        },
    )
    assert user_resp.status_code == 201, user_resp.text
    user_id = user_resp.json()["id"]

    # 2. Login as this user
    login_resp = client.post("/api/v1/auth/login", json={"email": email, "password": "Test@Password123"})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # 3. Create donor profile
    last_date = (date.today() - timedelta(days=last_donation_days_ago)) if last_donation_days_ago is not None else None
    donor_resp = client.post(
        "/api/v1/donors/me",
        headers=auth_headers(token),
        json={
            "blood_type": blood_type,
            "date_of_birth": "1995-05-15",
            "governorate": gov,
            "latitude": lat,
            "longitude": lng,
        },
    )
    assert donor_resp.status_code == 201, donor_resp.text

    # 4. Set eligibility status
    if eligibility != "pending":
        upd_resp = client.patch(
            "/api/v1/donors/me",
            headers=auth_headers(token),
            json={"eligibility_status": eligibility},
        )
        assert upd_resp.status_code == 200

    # 5. Set last_donation_date if provided
    if last_date:
        # Create a donation to set last_donation_date
        don_resp = client.post(
            "/api/v1/donors/me/donations",
            headers=auth_headers(token),
            json={
                "blood_type": blood_type,
                "quantity": 1,
                "donation_date": last_date.isoformat(),
                "blood_bank_id": "bloodbank_1",
                "status": "completed",
            },
        )
        assert don_resp.status_code == 201

    return user_id


def test_matching_donors_standalone_endpoint(client, admin_token, normal_user_token):
    # Setup test donors:
    # 1. Close eligible donor (Cairo center, A+, eligible, last donated 200 days ago) -> MATCH
    _create_donor_user(
        client, admin_token,
        email="donor_cairo_close@test.com", full_name="Cairo Close Donor",
        blood_type="A+", eligibility="eligible", last_donation_days_ago=200,
        lat=30.0450, lng=31.2360, gov="Cairo"
    )

    # 2. Far eligible donor (Alexandria, O-, eligible, never donated) -> MATCH, farther distance
    _create_donor_user(
        client, admin_token,
        email="donor_alex_far@test.com", full_name="Alex Far Donor",
        blood_type="O-", eligibility="eligible", last_donation_days_ago=None,
        lat=31.2001, lng=29.9187, gov="Alexandria"
    )

    # 3. Ineligible donor (Cairo, A+, ineligible) -> EXCLUDED by eligibility
    _create_donor_user(
        client, admin_token,
        email="donor_ineligible@test.com", full_name="Ineligible Donor",
        blood_type="A+", eligibility="ineligible", last_donation_days_ago=None,
        lat=30.0440, lng=31.2350, gov="Cairo"
    )

    # 4. Donor who donated 30 days ago -> EXCLUDED by 6-month rule
    _create_donor_user(
        client, admin_token,
        email="donor_recent@test.com", full_name="Recent Donor",
        blood_type="A+", eligibility="eligible", last_donation_days_ago=30,
        lat=30.0460, lng=31.2370, gov="Cairo"
    )

    # 5. Incompatible blood type (B+ for A+ recipient) -> EXCLUDED by compatibility
    _create_donor_user(
        client, admin_token,
        email="donor_b_pos@test.com", full_name="B Pos Donor",
        blood_type="B+", eligibility="eligible", last_donation_days_ago=200,
        lat=30.0444, lng=31.2357, gov="Cairo"
    )

    # Query matching donors for A+ at Cairo coordinates (30.0444, 31.2357)
    resp = client.get(
        "/api/v1/donors/matches?blood_type=A+&latitude=30.0444&longitude=31.2357",
        headers=auth_headers(normal_user_token),
    )
    assert resp.status_code == 200, resp.text
    matches = resp.json()

    # Only Cairo Close (A+) and Alex Far (O-) should match
    names = [m["full_name"] for m in matches]
    assert "Cairo Close Donor" in names
    assert "Alex Far Donor" in names
    assert "Ineligible Donor" not in names
    assert "Recent Donor" not in names
    assert "B Pos Donor" not in names

    # Verified distance sorting: Cairo close (< 2 km) must be before Alex far (> 150 km)
    assert matches[0]["full_name"] == "Cairo Close Donor"
    assert matches[0]["distance_km"] < 2.0
    assert matches[1]["full_name"] == "Alex Far Donor"
    assert matches[1]["distance_km"] > 150.0


def test_matching_donors_for_blood_request(client, admin_token, hospital_token, normal_user_token):
    # 1. Hospital creates a blood request for O+
    req_resp = client.post(
        "/api/v1/requests",
        headers=auth_headers(hospital_token),
        json={
            "blood_type": "O+",
            "component": "red_cells",
            "quantity_units": 3,
            "urgency": True,
            "reason": "ICU trauma patient",
        },
    )
    assert req_resp.status_code == 201
    req_id = req_resp.json()["id"]

    # 2. Create an O- donor (compatible)
    _create_donor_user(
        client, admin_token,
        email="donor_req_o_neg@test.com", full_name="O Neg Compatible",
        blood_type="O-", eligibility="eligible", last_donation_days_ago=250,
        lat=30.0500, lng=31.2400, gov="Cairo"
    )

    # 3. Create an AB+ donor (incompatible for O+ recipient)
    _create_donor_user(
        client, admin_token,
        email="donor_req_ab_pos@test.com", full_name="AB Pos Incompatible",
        blood_type="AB+", eligibility="eligible", last_donation_days_ago=250,
        lat=30.0510, lng=31.2410, gov="Cairo"
    )

    # 4. Fetch matching donors for request
    match_resp = client.get(
        f"/api/v1/requests/{req_id}/matching-donors",
        headers=auth_headers(normal_user_token),
    )
    assert match_resp.status_code == 200, match_resp.text
    donors = match_resp.json()

    matched_names = [d["full_name"] for d in donors]
    assert "O Neg Compatible" in matched_names
    assert "AB Pos Incompatible" not in matched_names

    # Check returned fields
    matched_donor = next(d for d in donors if d["full_name"] == "O Neg Compatible")
    assert matched_donor["blood_type"] == "O-"
    assert matched_donor["eligibility_status"] == "eligible"
    assert matched_donor["days_since_last_donation"] >= 180
    assert matched_donor["distance_km"] is not None


def test_matching_donors_exact_match_flag(client, admin_token, normal_user_token):
    # Setup test donors: A+ and O-
    _create_donor_user(
        client, admin_token,
        email="exact_a_pos@test.com", full_name="A Pos Exact Donor",
        blood_type="A+", eligibility="eligible", last_donation_days_ago=200,
        lat=30.0450, lng=31.2360, gov="Cairo"
    )
    _create_donor_user(
        client, admin_token,
        email="exact_o_neg@test.com", full_name="O Neg Compat Donor",
        blood_type="O-", eligibility="eligible", last_donation_days_ago=200,
        lat=30.0460, lng=31.2370, gov="Cairo"
    )

    # Standalone matches with exact_match=False: both A+ and O- match
    resp_compat = client.get(
        "/api/v1/donors/matches?blood_type=A+&exact_match=false",
        headers=auth_headers(normal_user_token),
    )
    assert resp_compat.status_code == 200
    compat_types = {d["blood_type"] for d in resp_compat.json()}
    assert "A+" in compat_types
    assert "O-" in compat_types

    # Standalone matches with exact_match=True: only A+ matches
    resp_exact = client.get(
        "/api/v1/donors/matches?blood_type=A+&exact_match=true",
        headers=auth_headers(normal_user_token),
    )
    assert resp_exact.status_code == 200
    exact_types = {d["blood_type"] for d in resp_exact.json()}
    assert "A+" in exact_types
    assert "O-" not in exact_types


def test_notify_matching_donors_for_request(client, admin_token, hospital_token):
    # 0. Create donor to be notified
    _create_donor_user(
        client, admin_token,
        email="notify_donor_1@test.com", full_name="Notify Donor 1",
        blood_type="A+", eligibility="eligible", last_donation_days_ago=200,
        lat=30.0450, lng=31.2360, gov="Cairo"
    )

    # 1. Hospital creates request for 2 bags of A+
    req_resp = client.post(
        "/api/v1/requests",
        headers=auth_headers(hospital_token),
        json={
            "blood_type": "A+",
            "component": "whole_blood",
            "quantity_units": 2,
            "urgency": True,
            "notes": "Urgent surgery needing blood",
        },
    )
    assert req_resp.status_code == 201
    req_id = req_resp.json()["id"]

    # 2. Notify closest 3 donors
    notify_resp = client.post(
        f"/api/v1/requests/{req_id}/notify-matching-donors",
        headers=auth_headers(hospital_token),
        json={"count": 3, "exact_match": False},
    )
    assert notify_resp.status_code == 200, notify_resp.text
    data = notify_resp.json()
    assert data["request_id"] == req_id
    assert data["total_notified"] >= 1
    assert len(data["notified_donors"]) == data["total_notified"]


def test_donor_nearby_requests_feed_and_quota_fulfillment(client, admin_token, hospital_token):
    # 1. Create a blood request with quantity_units = 1
    req_resp = client.post(
        "/api/v1/requests",
        headers=auth_headers(hospital_token),
        json={
            "blood_type": "B+",
            "component": "whole_blood",
            "quantity_units": 1,
            "urgency": True,
            "notes": "Emergency unit needed",
        },
    )
    assert req_resp.status_code == 201
    req_id = req_resp.json()["id"]

    # 2. Create donor 1 with B+
    donor1_email = "donor_b1@test.com"
    u1_resp = client.post(
        "/api/v1/users",
        headers=auth_headers(admin_token),
        json={"email": donor1_email, "full_name": "Donor B1", "password": "Test@Password123", "role": "normal_user"},
    )
    assert u1_resp.status_code == 201
    t1 = client.post("/api/v1/auth/login", json={"email": donor1_email, "password": "Test@Password123"}).json()["access_token"]
    client.post(
        "/api/v1/donors/me",
        headers=auth_headers(t1),
        json={"blood_type": "B+", "governorate": "Cairo", "latitude": 30.0444, "longitude": 31.2357},
    )

    # 3. Create donor 2 with B+
    donor2_email = "donor_b2@test.com"
    u2_resp = client.post(
        "/api/v1/users",
        headers=auth_headers(admin_token),
        json={"email": donor2_email, "full_name": "Donor B2", "password": "Test@Password123", "role": "normal_user"},
    )
    assert u2_resp.status_code == 201
    t2 = client.post("/api/v1/auth/login", json={"email": donor2_email, "password": "Test@Password123"}).json()["access_token"]
    client.post(
        "/api/v1/donors/me",
        headers=auth_headers(t2),
        json={"blood_type": "B+", "governorate": "Cairo", "latitude": 30.0450, "longitude": 31.2360},
    )

    # 4. Donor 1 checks nearby requests: must see the B+ request!
    feed1 = client.get("/api/v1/donors/me/nearby-requests", headers=auth_headers(t1))
    assert feed1.status_code == 200
    feed1_ids = [r["request_id"] for r in feed1.json()]
    assert req_id in feed1_ids

    # 5. Donor 1 accepts the request
    accept_resp = client.post(
        "/api/v1/donors/me/responses",
        headers=auth_headers(t1),
        json={"blood_request_id": req_id, "status": "accepted", "notes": "On my way"},
    )
    assert accept_resp.status_code == 201

    # 6. Now quota (1 unit) is reached!
    # Donor 2 checks nearby requests: the request must NOT appear anymore (cancelled/hidden)
    feed2 = client.get("/api/v1/donors/me/nearby-requests", headers=auth_headers(t2))
    assert feed2.status_code == 200
    feed2_ids = [r["request_id"] for r in feed2.json()]
    assert req_id not in feed2_ids

    # 7. If Donor 2 still tries to accept, system rejects with REQUEST_ALREADY_FULFILLED
    dup_accept = client.post(
        "/api/v1/donors/me/responses",
        headers=auth_headers(t2),
        json={"blood_request_id": req_id, "status": "accepted"},
    )
    assert dup_accept.status_code == 422
    assert dup_accept.json()["error"]["code"] == "REQUEST_ALREADY_FULFILLED"
