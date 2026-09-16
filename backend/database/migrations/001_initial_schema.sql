-- database/migrations/001_initial_schema.sql
--
-- STATUS: PROPOSAL for the Database Developer's review, not an already-agreed
-- migration. This file did not exist in the delivered backend (only a
-- placeholder README was here), even though docs/MIGRATION_STRATEGY.md names
-- this directory as the schema source of truth. Without a baseline file the
-- "source of truth" had nothing in it to diff future changes against.
--
-- Generated from the reviewed/corrected SQLAlchemy metadata in
-- app/db/models.py (`alembic upgrade head --sql`), which mirrors the 24
-- tables in the supplied schema.pdf, PLUS one flagged additive column not
-- in the original schema.pdf - search for "FLAGGED" below. Please review,
-- adjust naming/types/indexes as needed, and only then treat this as
-- authoritative. Index/view/trigger/seed-data files (002-005, mentioned in
-- the team chat) are separate and are not part of this file.
--
-- Dialect: Microsoft SQL Server / Azure SQL.

CREATE TABLE blood_banks (
    blood_bank_id VARCHAR(50) NOT NULL, 
    name VARCHAR(200) NOT NULL, 
    governorate VARCHAR(100) NULL, 
    address VARCHAR(500) NULL, 
    status VARCHAR(40) NULL, 
    PRIMARY KEY (blood_bank_id)
);

GO

CREATE TABLE hospitals (
    hospital_id VARCHAR(50) NOT NULL, 
    name VARCHAR(200) NOT NULL, 
    governorate VARCHAR(100) NULL, 
    address VARCHAR(500) NULL, 
    status VARCHAR(40) NULL, 
    PRIMARY KEY (hospital_id)
);

GO

CREATE TABLE permissions (
    permission_id VARCHAR(50) NOT NULL, 
    name VARCHAR(100) NOT NULL, 
    description TEXT NULL, 
    PRIMARY KEY (permission_id), 
    UNIQUE (name)
);

GO

CREATE TABLE roles (
    role_id VARCHAR(50) NOT NULL, 
    name VARCHAR(80) NOT NULL, 
    description TEXT NULL, 
    PRIMARY KEY (role_id), 
    UNIQUE (name)
);

GO

CREATE TABLE blood_bank_phones (
    blood_bank_id VARCHAR(50) NOT NULL, 
    phone VARCHAR(40) NOT NULL, 
    PRIMARY KEY (blood_bank_id, phone), 
    FOREIGN KEY(blood_bank_id) REFERENCES blood_banks (blood_bank_id) ON DELETE CASCADE
);

GO

CREATE TABLE hospital_phones (
    hospital_id VARCHAR(50) NOT NULL, 
    phone VARCHAR(40) NOT NULL, 
    PRIMARY KEY (hospital_id, phone), 
    FOREIGN KEY(hospital_id) REFERENCES hospitals (hospital_id) ON DELETE CASCADE
);

GO

CREATE TABLE role_permissions (
    role_id VARCHAR(50) NOT NULL, 
    permission_id VARCHAR(50) NOT NULL, 
    PRIMARY KEY (role_id, permission_id), 
    FOREIGN KEY(role_id) REFERENCES roles (role_id) ON DELETE CASCADE, 
    FOREIGN KEY(permission_id) REFERENCES permissions (permission_id) ON DELETE CASCADE
);

GO

CREATE TABLE users (
    user_id VARCHAR(50) NOT NULL, 
    name VARCHAR(200) NOT NULL, 
    email VARCHAR(320) NOT NULL, 
    password_hash VARCHAR(255) NOT NULL, 
    status VARCHAR(40) NULL, 
    created_at DATETIMEOFFSET NOT NULL, 
    role_id VARCHAR(50) NOT NULL, 
    hospital_id VARCHAR(50) NULL, 
    blood_bank_id VARCHAR(50) NULL, 
    PRIMARY KEY (user_id), 
    FOREIGN KEY(role_id) REFERENCES roles (role_id), 
    FOREIGN KEY(hospital_id) REFERENCES hospitals (hospital_id), 
    FOREIGN KEY(blood_bank_id) REFERENCES blood_banks (blood_bank_id)
);

GO

CREATE TABLE audit_logs (
    audit_id VARCHAR(50) NOT NULL, 
    entity_type VARCHAR(100) NOT NULL, 
    entity_id VARCHAR(100) NULL, 
    action VARCHAR(100) NOT NULL, 
    logged_at DATETIMEOFFSET NOT NULL, 
    user_id VARCHAR(50) NULL, 
    PRIMARY KEY (audit_id), 
    FOREIGN KEY(user_id) REFERENCES users (user_id)
);

GO

CREATE TABLE blood_requests (
    blood_request_id VARCHAR(50) NOT NULL, 
    blood_type VARCHAR(3) NOT NULL, 
    requested_quantity INTEGER NOT NULL, 
    urgency VARCHAR(40) NOT NULL, 
    reason TEXT NULL, 
    status VARCHAR(50) NOT NULL, 
    required_by DATETIMEOFFSET NULL, 
    created_at DATETIMEOFFSET NOT NULL, 
    hospital_id VARCHAR(50) NOT NULL, 
    created_by_user_id VARCHAR(50) NOT NULL, 
    PRIMARY KEY (blood_request_id), 
    FOREIGN KEY(hospital_id) REFERENCES hospitals (hospital_id), 
    FOREIGN KEY(created_by_user_id) REFERENCES users (user_id)
);

GO

CREATE TABLE donors (
    donor_id VARCHAR(50) NOT NULL, 
    user_id VARCHAR(50) NOT NULL, 
    blood_type VARCHAR(3) NULL, 
    date_of_birth DATETIME NULL, 
    governorate VARCHAR(100) NULL, 
    eligibility_status VARCHAR(60) NULL, 
    last_donation_date DATETIME NULL, 
    PRIMARY KEY (donor_id), 
    FOREIGN KEY(user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

GO

CREATE TABLE user_phones (
    user_id VARCHAR(50) NOT NULL, 
    phone VARCHAR(40) NOT NULL, 
    PRIMARY KEY (user_id, phone), 
    FOREIGN KEY(user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

GO

CREATE TABLE consents (
    consent_id VARCHAR(50) NOT NULL, 
    donor_id VARCHAR(50) NOT NULL, 
    consent_type VARCHAR(100) NOT NULL, 
    granted BIT NOT NULL, 
    granted_at DATETIMEOFFSET NULL, 
    revoked_at DATETIMEOFFSET NULL, 
    PRIMARY KEY (consent_id), 
    FOREIGN KEY(donor_id) REFERENCES donors (donor_id) ON DELETE CASCADE
);

GO

CREATE TABLE donation_responses (
    response_id VARCHAR(50) NOT NULL, 
    response_date DATETIMEOFFSET NOT NULL, 
    status VARCHAR(40) NOT NULL, 
    notes TEXT NULL, 
    blood_request_id VARCHAR(50) NOT NULL, 
    donor_id VARCHAR(50) NOT NULL, 
    PRIMARY KEY (response_id), 
    FOREIGN KEY(blood_request_id) REFERENCES blood_requests (blood_request_id), 
    FOREIGN KEY(donor_id) REFERENCES donors (donor_id)
);

GO

CREATE TABLE donations (
    donation_id VARCHAR(50) NOT NULL, 
    blood_type VARCHAR(3) NOT NULL, 
    quantity NUMERIC(8, 2) NOT NULL, 
    donation_date DATETIME NOT NULL, 
    status VARCHAR(40) NULL, 
    created_at DATETIMEOFFSET NOT NULL, 
    donor_id VARCHAR(50) NOT NULL, 
    blood_bank_id VARCHAR(50) NOT NULL, 
    PRIMARY KEY (donation_id), 
    FOREIGN KEY(donor_id) REFERENCES donors (donor_id), 
    FOREIGN KEY(blood_bank_id) REFERENCES blood_banks (blood_bank_id)
);

GO

CREATE TABLE notifications (
    notification_id VARCHAR(50) NOT NULL, 
    title VARCHAR(200) NULL, 
    message TEXT NOT NULL, 
    type VARCHAR(80) NOT NULL, 
    status VARCHAR(40) NOT NULL, 
    created_at DATETIMEOFFSET NOT NULL, 
    read_at DATETIMEOFFSET NULL, 
    user_id VARCHAR(50) NOT NULL, 
    related_request_id VARCHAR(50) NULL,  -- FLAGGED: not in original schema.pdf; see docs/ERD_MAPPING.md
    PRIMARY KEY (notification_id), 
    FOREIGN KEY(user_id) REFERENCES users (user_id) ON DELETE CASCADE, 
    FOREIGN KEY(related_request_id) REFERENCES blood_requests (blood_request_id)
);

GO

CREATE TABLE payments (
    payment_id VARCHAR(50) NOT NULL, 
    amount NUMERIC(12, 2) NOT NULL, 
    payment_status VARCHAR(40) NOT NULL, 
    payment_method VARCHAR(100) NULL, 
    paid_at DATETIMEOFFSET NULL, 
    transaction_reference VARCHAR(255) NULL, 
    created_at DATETIMEOFFSET NOT NULL, 
    blood_request_id VARCHAR(50) NOT NULL, 
    PRIMARY KEY (payment_id), 
    UNIQUE (transaction_reference), 
    FOREIGN KEY(blood_request_id) REFERENCES blood_requests (blood_request_id)
);

GO

CREATE TABLE request_status_history (
    history_id VARCHAR(50) NOT NULL, 
    status VARCHAR(50) NOT NULL, 
    changed_at DATETIMEOFFSET NOT NULL, 
    notes TEXT NULL, 
    blood_request_id VARCHAR(50) NOT NULL, 
    changed_by_user_id VARCHAR(50) NOT NULL, 
    PRIMARY KEY (history_id), 
    FOREIGN KEY(blood_request_id) REFERENCES blood_requests (blood_request_id) ON DELETE CASCADE, 
    FOREIGN KEY(changed_by_user_id) REFERENCES users (user_id)
);

GO

CREATE TABLE supporting_documents (
    document_id VARCHAR(50) NOT NULL, 
    file_name VARCHAR(255) NOT NULL, 
    file_path VARCHAR(1000) NOT NULL, 
    file_type VARCHAR(120) NULL, 
    uploaded_at DATETIMEOFFSET NOT NULL, 
    status VARCHAR(40) NOT NULL, 
    reviewed_at DATETIMEOFFSET NULL, 
    rejection_reason TEXT NULL, 
    blood_request_id VARCHAR(50) NOT NULL, 
    uploaded_by_user_id VARCHAR(50) NOT NULL, 
    reviewed_by_user_id VARCHAR(50) NULL, 
    PRIMARY KEY (document_id), 
    FOREIGN KEY(blood_request_id) REFERENCES blood_requests (blood_request_id) ON DELETE CASCADE, 
    FOREIGN KEY(uploaded_by_user_id) REFERENCES users (user_id), 
    FOREIGN KEY(reviewed_by_user_id) REFERENCES users (user_id)
);

GO

CREATE TABLE blood_bags (
    blood_bag_id VARCHAR(50) NOT NULL, 
    blood_type VARCHAR(3) NOT NULL, 
    quantity INTEGER NOT NULL, 
    collection_date DATETIMEOFFSET NOT NULL, 
    expiry_date DATETIMEOFFSET NOT NULL, 
    qr_code VARCHAR(255) NOT NULL, 
    status VARCHAR(50) NOT NULL, 
    current_location VARCHAR(255) NULL, 
    created_at DATETIMEOFFSET NOT NULL, 
    donation_id VARCHAR(50) NULL, 
    current_blood_bank_id VARCHAR(50) NULL, 
    PRIMARY KEY (blood_bag_id), 
    FOREIGN KEY(donation_id) REFERENCES donations (donation_id), 
    FOREIGN KEY(current_blood_bank_id) REFERENCES blood_banks (blood_bank_id)
);

GO

CREATE TABLE donation_vouchers (
    voucher_id VARCHAR(50) NOT NULL, 
    voucher_number VARCHAR(100) NOT NULL, 
    issued_at DATETIMEOFFSET NOT NULL, 
    status VARCHAR(40) NOT NULL, 
    donation_id VARCHAR(50) NOT NULL, 
    PRIMARY KEY (voucher_id), 
    UNIQUE (voucher_number), 
    FOREIGN KEY(donation_id) REFERENCES donations (donation_id)
);

GO

CREATE TABLE caregiver_assignments (
    assignment_id VARCHAR(50) NOT NULL, 
    assignment_date DATETIMEOFFSET NULL, 
    status VARCHAR(40) NOT NULL, 
    notes TEXT NULL, 
    blood_bag_id VARCHAR(50) NOT NULL, 
    caregiver_user_id VARCHAR(50) NOT NULL, 
    hospital_id VARCHAR(50) NOT NULL, 
    PRIMARY KEY (assignment_id), 
    FOREIGN KEY(blood_bag_id) REFERENCES blood_bags (blood_bag_id), 
    FOREIGN KEY(caregiver_user_id) REFERENCES users (user_id), 
    FOREIGN KEY(hospital_id) REFERENCES hospitals (hospital_id)
);

GO

CREATE TABLE request_allocations (
    allocation_id VARCHAR(50) NOT NULL, 
    quantity INTEGER NOT NULL, 
    status VARCHAR(40) NOT NULL, 
    allocated_at DATETIMEOFFSET NOT NULL, 
    blood_request_id VARCHAR(50) NOT NULL, 
    blood_bank_id VARCHAR(50) NOT NULL, 
    blood_bag_id VARCHAR(50) NOT NULL, 
    PRIMARY KEY (allocation_id), 
    FOREIGN KEY(blood_request_id) REFERENCES blood_requests (blood_request_id) ON DELETE CASCADE, 
    FOREIGN KEY(blood_bank_id) REFERENCES blood_banks (blood_bank_id), 
    FOREIGN KEY(blood_bag_id) REFERENCES blood_bags (blood_bag_id)
);

GO

CREATE TABLE scan_events (
    scan_id VARCHAR(50) NOT NULL, 
    blood_bag_id VARCHAR(50) NOT NULL, 
    scanned_by_user_id VARCHAR(50) NOT NULL, 
    scan_type VARCHAR(50) NOT NULL, 
    scanned_at DATETIMEOFFSET NOT NULL, 
    location VARCHAR(255) NULL, 
    notes TEXT NULL, 
    PRIMARY KEY (scan_id), 
    FOREIGN KEY(blood_bag_id) REFERENCES blood_bags (blood_bag_id) ON DELETE CASCADE, 
    FOREIGN KEY(scanned_by_user_id) REFERENCES users (user_id)
);

GO


GO
