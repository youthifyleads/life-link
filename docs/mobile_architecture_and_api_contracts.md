# LifeLink — Mobile Architecture & Shared System Specification

**Author:** Mobile System Architect & Senior Flutter Developer  
**Target Clients:** Flutter Mobile (Donor & Caregiver) + React Web (Institutions & Caregivers)  
**Backend:** FastAPI (Single Source of Truth)  
**Database:** Azure SQL / SQL Server (`LifeLinkDb`)  
**Push Notifications:** Firebase Cloud Messaging (FCM) + Backend Dispatcher  

---

## 1. System Vision & Architecture Alignment

LifeLink is **ONE unified healthcare platform** accessed through two specialized client applications sharing the exact same FastAPI backend, business logic, and Azure SQL database:

```
                  ┌────────────────────────┐
                  │    React Web Client    │
                  │ (Hospitals/Banks/Web)  │
                  └───────────┬────────────┘
                              │
                              │ HTTPS REST API
                              ↓
              ┌───────────────────────────────┐
              │        FastAPI Backend        │
              │  - Authentication & RBAC      │
              │  - 6-Month Donor Eligibility  │
              │  - Bidirectional Matching     │
              │  - Blood Bag Lifecycle & QR   │
              │  - Payment State Machine      │
              │  - FCM Notification Engine    │
              │  - Rewards & Audit Log        │
              └───────┬───────────────┬───────┘
                      │               │
       SQLAlchemy ORM │               │ Push Notifications (FCM)
                      ↓               ↓
              ┌───────────────┐ ┌───────────────┐
              │   Azure SQL   │ │  Firebase FCM │
              │  (LifeLinkDb) │ └───────┬───────┘
              └───────────────┘         │
                      ▲                 │
                      │ HTTPS REST API  │ Push Events
                      │                 ↓
              ┌───────┴───────────────────────┐
              │     Flutter Mobile Client     │
              │      (Donor & Caregiver)      │
              └───────────────────────────────┘
```

> [!IMPORTANT]
> **No Business Logic or Database Access in Flutter:**
> - Flutter never connects directly to Azure SQL.
> - Flutter never calculates donor medical eligibility or the 6-month rule.
> - Flutter never marks payments or donations as completed client-side.
> - Every action is authorized, validated, and processed by the FastAPI backend, ensuring 100% real-time synchronization between Mobile and Web.

---

## 2. Core Workflows & Bidirectional Matching

### A. Caregiver Blood Request & Donor Notification (6-Month Rule)
1. **Creation:** Caregiver creates an urgent or normal blood request from Mobile or Web (`POST /api/v1/blood-requests`).
2. **Backend Validation:** FastAPI records the request in Azure SQL.
3. **Automated Matching Engine:**
   - Matches compatible blood types (`blood_type`).
   - Checks donor eligibility status (`eligibility_status = 'eligible'`).
   - **Enforces the 6-Month Rule:** Calculates `DATEDIFF(DAY, last_donation_date, CURRENT_TIMESTAMP) >= 180` (or backend-configured threshold). Donors who donated within the last 6 months are excluded.
   - Verifies donor notification consent (`consents.granted = 1` for `EMERGENCY_SMS_ALERT` / `PUSH_NOTIFICATION`).
   - Confirms request is still active (`status = 'requested'`).
4. **Notification Dispatch:** Backend sends FCM push notification with minimal payload (`{"type": "blood_request", "reference_id": "REQ-1092"}`).
5. **Mobile Handling:** Matching donors receive instant alert $\rightarrow$ tap deep link $\rightarrow$ view details in Flutter $\rightarrow$ accept/respond.

---

### B. Donor Proactive Post ("I Can Donate") $\leftrightarrow$ Caregiver Matching
1. **Creation:** Eligible donor posts availability from Flutter Mobile (`POST /api/v1/donor-posts`). Blood type is locked to their verified profile.
2. **Backend Validation:** FastAPI validates donor status and creates the post.
3. **Matching Engine:** FastAPI queries active blood requests matching the donor's blood type and governorate.
4. **Caregiver Alert:** Caregivers whose patients have active matching requests receive instant FCM push notifications (`{"type": "donor_available", "reference_id": "POST-304"}`).
5. **Synchronization:** The post and matching status are immediately visible to authorized caregivers on both Mobile and Web.

---

### C. Caregiver Blood Bag Tracking & QR Scanning
1. **Allocation:** Blood bank allocates a physical blood bag (`blood_bags`) to the patient's request.
2. **Real-Time Timeline:** Caregiver sees live status in Flutter:
   $$\text{Allocated} \longrightarrow \text{Collected} \longrightarrow \text{In Transit} \longrightarrow \text{Arrived at Destination} \longrightarrow \text{Ready for Patient}$$
3. **QR Verification:** When authorized, caregiver or staff scans the bag's QR code using the mobile scanner. Flutter sends the scanned string to `POST /api/v1/tracking/scan`. FastAPI validates the barcode, verifies permissions, records the `scan_events` row, and updates `blood_bags` atomically.

---

### D. Caregiver Payment Workflow
1. **Initiation:** Caregiver opens the payment sheet for the allocated blood bag/service in Flutter.
2. **Order Creation:** Flutter calls `POST /api/v1/payments/create-intent`.
3. **Processing & Verification:** Payment is processed through the approved gateway (or backend mock in dev). The gateway webhook notifies FastAPI (`POST /api/v1/payments/webhook`).
4. **Atomic Update:** FastAPI verifies the transaction reference, updates `payments` table (`payment_status = 'paid'`), updates the blood request status, and emits an event.
5. **Universal Sync:** Both Web and Mobile immediately reflect the updated payment status.

---

## 3. Flutter Clean Architecture Structure

```text
mobile/
├── lib/
│   ├── main.dart                      # App entry point & dependency wiring
│   ├── app.dart                       # MaterialApp with theme & router
│   │
│   ├── core/                          # Core infrastructure
│   │   ├── config/                    # Environment (dev/prod) & endpoints
│   │   ├── constants/                 # Colors, typography, spacing, assets
│   │   ├── errors/                    # Failure classes & API exception handlers
│   │   ├── network/                   # Dio HTTP client, JWT interceptor, token refresh
│   │   ├── storage/                   # FlutterSecureStorage & shared preferences
│   │   ├── notifications/             # FirebaseMessaging handler & local notifications
│   │   └── routing/                   # GoRouter with role-based auth guards
│   │
│   └── features/                      # Domain features
│       ├── auth/                      # Login, Registration, OTP verification
│       │   ├── data/                  # AuthApi, AuthRepositoryImpl, TokenDto
│       │   ├── domain/                # AuthRepository, User, Role
│       │   └── presentation/          # LoginScreen, OtpScreen, AuthCubit
│       │
│       ├── donor/                     # Donor hub, eligibility, donation history
│       │   ├── data/                  # DonorApi, DonorRepositoryImpl
│       │   ├── domain/                # DonorProfile, DonationRecord
│       │   └── presentation/          # DonorHomeScreen, DonationHistoryScreen
│       │
│       ├── caregiver/                 # Caregiver hub, patient requests
│       │   ├── data/                  # CaregiverApi, CaregiverRepositoryImpl
│       │   ├── domain/                # PatientRequest, CaregiverProfile
│       │   └── presentation/          # CaregiverHomeScreen, MyRequestsScreen
│       │
│       ├── blood_requests/            # Request creation, feed & response
│       │   ├── data/                  # RequestsApi, RequestRepositoryImpl
│       │   ├── domain/                # BloodRequest, UrgencyLevel
│       │   └── presentation/          # CreateRequestScreen, RequestDetailsScreen
│       │
│       ├── donor_posts/               # "I Can Donate" posts & matching feed
│       │   ├── data/                  # DonorPostsApi, DonorPostRepositoryImpl
│       │   ├── domain/                # DonorPost, AvailabilityStatus
│       │   └── presentation/          # CreateDonorPostScreen, MatchingDonorsScreen
│       │
│       ├── tracking/                  # Blood bag QR scanner & live timeline
│       │   ├── data/                  # TrackingApi, TrackingRepositoryImpl
│       │   ├── domain/                # BloodBagTracking, ScanEvent
│       │   └── presentation/          # TrackingTimelineScreen, QrScannerScreen
│       │
│       ├── payments/                  # Caregiver blood bag payment flow
│       │   ├── data/                  # PaymentApi, PaymentRepositoryImpl
│       │   ├── domain/                # PaymentIntent, PaymentReceipt
│       │   └── presentation/          # PaymentScreen, PaymentSuccessScreen
│       │
│       ├── rewards/                   # Verified donation rewards & vouchers
│       │   ├── data/                  # RewardsApi, RewardsRepositoryImpl
│       │   ├── domain/                # RewardVoucher
│       │   └── presentation/          # RewardsListScreen, VoucherDetailsScreen
│       │
│       └── notifications/             # Notification center & deep linking
│           ├── data/                  # NotificationApi, NotificationRepositoryImpl
│           ├── domain/                # AppNotification
│           └── presentation/          # NotificationCenterScreen
```

---

## 4. FastAPI Endpoint Contracts (Mobile Dependencies)

| Area | HTTP Method | Endpoint | Role Required | Request Body / Query | Expected Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | `{"name", "email", "phone", "password", "role"}` | `{"user_id", "status": "otp_sent"}` |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | `{"email", "password"}` | `{"status": "otp_sent", "temp_token"}` |
| **Auth** | `POST` | `/api/v1/auth/verify-otp` | Public | `{"email", "otp_code"}` | `{"access_token", "refresh_token", "user": {...}}` |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Authenticated | `{"refresh_token"}` | `{"access_token", "refresh_token"}` |
| **Profile**| `GET` | `/api/v1/donor/profile` | `Donor` | Headers: `Bearer Token` | `{"donor_id", "blood_type", "eligibility_status", "last_donation_date", "days_until_eligible"}` |
| **Consent**| `POST` | `/api/v1/donor/consents` | `Donor` | `{"consent_type", "granted": true}` | `{"consent_id", "status": "active"}` |
| **Requests**| `POST` | `/api/v1/blood-requests` | `Caregiver`, `Hospital` | `{"blood_type", "quantity", "urgency", "reason", "required_by", "hospital_id"}` | `{"blood_request_id", "status": "requested", "created_at"}` |
| **Requests**| `GET` | `/api/v1/blood-requests/feed`| `Donor` | `?blood_type=O+&governorate=Cairo` | `[{"blood_request_id", "blood_type", "quantity", "urgency", "hospital_name", ...}]` |
| **Donor Post**| `POST`| `/api/v1/donor-posts` | `Donor` | `{"availability_date", "governorate", "notes"}` | `{"post_id", "status": "active", "matched_requests_count"}` |
| **Donor Post**| `GET` | `/api/v1/donor-posts/matching`| `Caregiver`| Headers: `Bearer Token` | `[{"post_id", "donor_name", "blood_type", "governorate", "created_at"}]` |
| **Tracking**| `GET` | `/api/v1/tracking/bag/{bag_id}`| `Caregiver`, `Staff`| Headers: `Bearer Token` | `{"blood_bag_id", "status", "current_location", "timeline": [...]}` |
| **Tracking**| `POST`| `/api/v1/tracking/scan` | Authenticated | `{"qr_code", "location", "scan_type"}` | `{"valid": true, "bag_id", "new_status", "timestamp"}` |
| **Payment** | `POST` | `/api/v1/payments/create-intent`| `Caregiver` | `{"blood_request_id", "amount", "payment_method"}` | `{"payment_id", "client_secret", "amount", "status": "pending"}` |
| **Payment** | `GET` | `/api/v1/payments/{payment_id}/status`| `Caregiver` | Headers: `Bearer Token` | `{"payment_id", "payment_status": "paid", "paid_at", "receipt_url"}` |
| **Rewards** | `GET` | `/api/v1/donor/rewards` | `Donor` | Headers: `Bearer Token` | `[{"voucher_id", "voucher_number", "issued_at", "status": "issued"}]` |
| **Notifs**  | `GET` | `/api/v1/notifications` | Authenticated | `?page=1&limit=20` | `{"unread_count": 2, "items": [{"id", "title", "message", "type", "ref_id", "read"}]}` |
| **Notifs**  | `POST`| `/api/v1/notifications/push-token`| Authenticated | `{"fcm_token", "platform": "android"}` | `{"status": "registered"}` |

---

## 5. Security & Mobile Compliance Checklist

- [x] **Zero Database Credentials:** Flutter repo has zero SQL/DB connection strings.
- [x] **Secure Keystore:** Access and refresh tokens stored in `FlutterSecureStorage` (AES-256 encrypted with Android Keystore / iOS Keychain).
- [x] **Zero Sensitive Data in Push Notifications:** Push payloads carry only `{"type", "reference_id"}`. All protected patient data is loaded over HTTPS after JWT verification.
- [x] **Server-Side Enforcement:** Medical eligibility, the 6-month rule, and payment verification are solely enforced by FastAPI.
- [x] **Universal State Sync:** Database triggers and transactional stored procedures in `LifeLinkDb` ensure updates made on Mobile immediately appear on React Web and vice-versa.
