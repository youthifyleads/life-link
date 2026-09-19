# Life Link — Supplied Schema Mapping

`schema.pdf` is treated as the physical-schema source of truth. The ORM table
and column names below match it, including the separate phone tables.

## Tables mapped 1:1

- `users(user_id, name, email, password_hash, status, created_at, role_id, hospital_id, blood_bank_id)`
- `user_phones(user_id, phone)`
- `roles(role_id, name, description)`
- `permissions(permission_id, name, description)`
- `role_permissions(role_id, permission_id)`
- `hospitals(hospital_id, name, governorate, address, status)`
- `hospital_phones(hospital_id, phone)`
- `blood_banks(blood_bank_id, name, governorate, address, status)`
- `blood_bank_phones(blood_bank_id, phone)`
- `donors(donor_id, user_id, blood_type, date_of_birth, governorate, eligibility_status, last_donation_date)`
- `consents(consent_id, donor_id, consent_type, granted, granted_at, revoked_at)`
- `donations(donation_id, blood_type, quantity, donation_date, status, created_at, donor_id, blood_bank_id)`
- `donation_responses(response_id, response_date, status, notes, blood_request_id, donor_id)`
- `donation_vouchers(voucher_id, voucher_number, issued_at, status, donation_id)`
- `blood_requests(blood_request_id, blood_type, requested_quantity, urgency, reason, status, required_by, created_at, hospital_id, created_by_user_id)`
- `blood_bags(blood_bag_id, blood_type, quantity, collection_date, expiry_date, qr_code, status, current_location, created_at, donation_id, current_blood_bank_id)`
- `request_allocations(allocation_id, quantity, unit_price, status, allocated_at, blood_request_id, blood_bank_id, blood_bag_id)`
- `scan_events(scan_id, blood_bag_id, scanned_by_user_id, scan_type, scanned_at, location, notes)`
- `supporting_documents(document_id, file_name, file_path, file_type, uploaded_at, status, reviewed_at, rejection_reason, blood_request_id, uploaded_by_user_id, reviewed_by_user_id)`
- `request_status_history(history_id, status, changed_at, notes, blood_request_id, changed_by_user_id)`
- `notifications(notification_id, title, message, type, status, created_at, read_at, user_id)`
- `payments(payment_id, amount, currency, provider, provider_order_id, payment_status, payment_method, paid_at, transaction_reference, created_at, blood_request_id)`
- `audit_logs(audit_id, entity_type, entity_id, action, logged_at, user_id)`
- `caregiver_assignments(assignment_id, assignment_date, status, notes, blood_bag_id, caregiver_user_id, hospital_id)`

## Application-level notes

1. The supplied schema does **not** contain a `tracking_reference` column on
   `blood_requests`. The API therefore derives a signed opaque tracking token
   from the request ID; no extra tracking column is added to the database.
2. The existing MVP API historically exposed `component`, but it is not a
   physical column in the supplied schema. It remains an API compatibility
   value (`unspecified`) and is not persisted.
3. Manual reported inventory is represented through `blood_bags`, with
   `donation_id` nullable so MVP inventory can exist before a donation record.
   This is a persistence bridge, not a clinical release decision.
4. Payment, donor-response, voucher, and caregiver tables are mapped because
   they are present in the supplied schema. Provider/payment and advanced
   donor business behavior is not invented without an approved workflow.

## Resolved additions (Approved & Migrated)

1. `notifications.related_request_id` (nullable FK -> `blood_requests.blood_request_id`, ON DELETE SET NULL).
   - Approved and implemented via migration `006_add_notifications_related_request_id.sql`.
   - Populated on request creation and status transitions to allow clients to deep-link directly from a notification to the associated blood request.
   - Nullable so that generic/system notifications can still exist without being tied to a specific blood request.

2. `request_allocations.unit_price` & `payments` Uniqueness Update.
   - Approved and implemented via migration `007_update_payments_and_allocations_pricing.sql`.
   - Added `unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00` to `request_allocations` for per-bag pricing.
   - Dropped restrictive 1:1 `UNIQUE (blood_request_id)` constraint on `payments` to enable retry attempts on failed payments.
   - Added filtered unique index `ux_payments_single_paid_per_request` on `payments(blood_request_id) WHERE payment_status = 'paid'` to guarantee at most one successful payment per request.

3. `payments` Gateway Integration Fields (`currency`, `provider`, `provider_order_id`).
   - Approved and implemented via migration `008_add_payment_gateway_fields.sql`.
   - Added `currency VARCHAR(3) NOT NULL DEFAULT 'EGP'` and `provider VARCHAR(50) NOT NULL DEFAULT 'paymob'`.
   - Added `provider_order_id NVARCHAR(100) NULL` with filtered index `ix_payments_provider_order_id` for Webhook correlation.
