/* ============================================================================
   LIFE LINK — 100% RE-RUNNABLE (IDEMPOTENT) SQL SERVER & AZURE SQL DATABASE SCRIPT
   
   Project: Life Link (Real-Time Blood Donation & Traceability Platform)
   Target: Microsoft SQL Server 2016+ / Azure SQL Database
   
   ✨ Fully Idempotent: You can run (Execute / F5) this script multiple times
      safely without getting "Already Exists" errors!
   ============================================================================ */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* ============================================================================
   SECTION 1: DATABASE CREATION & CONTEXT
   ============================================================================ */

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'LifeLinkDb')
BEGIN
    PRINT '>>> Creating database LifeLinkDb...';
    CREATE DATABASE LifeLinkDb;
END
GO

USE LifeLinkDb;
GO


/* ============================================================================
   SECTION 2: IDENTITY, ORGANISATIONS & AUTHORIZATION
   ============================================================================ */

-- 1. Roles
IF OBJECT_ID('dbo.roles', 'U') IS NULL
BEGIN
    CREATE TABLE roles (
        role_id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        name            NVARCHAR(100)    NOT NULL,
        description     NVARCHAR(255)    NULL,

        CONSTRAINT pk_roles PRIMARY KEY (role_id),
        CONSTRAINT uq_roles_name UNIQUE (name)
    );
END
GO

-- 2. Permissions
IF OBJECT_ID('dbo.permissions', 'U') IS NULL
BEGIN
    CREATE TABLE permissions (
        permission_id   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        name            NVARCHAR(100)    NOT NULL,
        description     NVARCHAR(255)    NULL,

        CONSTRAINT pk_permissions PRIMARY KEY (permission_id),
        CONSTRAINT uq_permissions_name UNIQUE (name)
    );
END
GO

-- 3. Hospitals
IF OBJECT_ID('dbo.hospitals', 'U') IS NULL
BEGIN
    CREATE TABLE hospitals (
        hospital_id     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        name            NVARCHAR(200)    NOT NULL,
        governorate     NVARCHAR(100)    NULL,
        address         NVARCHAR(255)    NULL,
        status          VARCHAR(30)      NOT NULL DEFAULT 'active',

        CONSTRAINT pk_hospitals PRIMARY KEY (hospital_id),
        CONSTRAINT ck_hospitals_status
            CHECK (status IN ('active', 'inactive', 'pending'))
    );
END
GO

-- 4. Blood Banks
IF OBJECT_ID('dbo.blood_banks', 'U') IS NULL
BEGIN
    CREATE TABLE blood_banks (
        blood_bank_id   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        name            NVARCHAR(200)    NOT NULL,
        governorate     NVARCHAR(100)    NULL,
        address         NVARCHAR(255)    NULL,
        status          VARCHAR(30)      NOT NULL DEFAULT 'active',

        CONSTRAINT pk_blood_banks PRIMARY KEY (blood_bank_id),
        CONSTRAINT ck_blood_banks_status
            CHECK (status IN ('active', 'inactive', 'pending'))
    );
END
GO

-- 5. Users
IF OBJECT_ID('dbo.users', 'U') IS NULL
BEGIN
    CREATE TABLE users (
        user_id         UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        name            NVARCHAR(150)    NOT NULL,
        email           NVARCHAR(255)    NOT NULL,
        password_hash   NVARCHAR(255)    NOT NULL,
        status          VARCHAR(30)      NOT NULL DEFAULT 'active',
        created_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        role_id         UNIQUEIDENTIFIER NOT NULL,
        hospital_id     UNIQUEIDENTIFIER NULL,
        blood_bank_id   UNIQUEIDENTIFIER NULL,

        CONSTRAINT pk_users PRIMARY KEY (user_id),
        CONSTRAINT uq_users_email UNIQUE (email),

        CONSTRAINT fk_users_role
            FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE NO ACTION,

        CONSTRAINT fk_users_hospital
            FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE NO ACTION,

        CONSTRAINT fk_users_blood_bank
            FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(blood_bank_id) ON DELETE NO ACTION,

        CONSTRAINT ck_users_status
            CHECK (status IN ('active', 'inactive', 'suspended')),

        CONSTRAINT ck_users_single_institution
            CHECK (NOT (hospital_id IS NOT NULL AND blood_bank_id IS NOT NULL))
    );
END
GO

-- 6. Role Permissions Junction (M:N)
IF OBJECT_ID('dbo.role_permissions', 'U') IS NULL
BEGIN
    CREATE TABLE role_permissions (
        role_id         UNIQUEIDENTIFIER NOT NULL,
        permission_id   UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_role_permissions
            PRIMARY KEY (role_id, permission_id),

        CONSTRAINT fk_role_permissions_role
            FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,

        CONSTRAINT fk_role_permissions_permission
            FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
    );
END
GO

-- 7. User Phones
IF OBJECT_ID('dbo.user_phones', 'U') IS NULL
BEGIN
    CREATE TABLE user_phones (
        user_id         UNIQUEIDENTIFIER NOT NULL,
        phone           VARCHAR(30)      NOT NULL,

        CONSTRAINT pk_user_phones PRIMARY KEY (user_id, phone),
        CONSTRAINT fk_user_phones_user
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
END
GO

-- 8. Hospital Phones
IF OBJECT_ID('dbo.hospital_phones', 'U') IS NULL
BEGIN
    CREATE TABLE hospital_phones (
        hospital_id     UNIQUEIDENTIFIER NOT NULL,
        phone           VARCHAR(30)      NOT NULL,

        CONSTRAINT pk_hospital_phones PRIMARY KEY (hospital_id, phone),
        CONSTRAINT fk_hospital_phones_hospital
            FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE
    );
END
GO

-- 9. Blood Bank Phones
IF OBJECT_ID('dbo.blood_bank_phones', 'U') IS NULL
BEGIN
    CREATE TABLE blood_bank_phones (
        blood_bank_id   UNIQUEIDENTIFIER NOT NULL,
        phone           VARCHAR(30)      NOT NULL,

        CONSTRAINT pk_blood_bank_phones PRIMARY KEY (blood_bank_id, phone),
        CONSTRAINT fk_blood_bank_phones_blood_bank
            FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(blood_bank_id) ON DELETE CASCADE
    );
END
GO

-- Section 2 Indexes
DROP INDEX IF EXISTS ix_role_permissions_permission_id ON dbo.role_permissions;
CREATE NONCLUSTERED INDEX ix_role_permissions_permission_id ON dbo.role_permissions(permission_id);

DROP INDEX IF EXISTS ix_users_role_id ON dbo.users;
CREATE NONCLUSTERED INDEX ix_users_role_id ON dbo.users(role_id);

DROP INDEX IF EXISTS ix_users_hospital_id ON dbo.users;
CREATE NONCLUSTERED INDEX ix_users_hospital_id ON dbo.users(hospital_id);

DROP INDEX IF EXISTS ix_users_blood_bank_id ON dbo.users;
CREATE NONCLUSTERED INDEX ix_users_blood_bank_id ON dbo.users(blood_bank_id);

DROP INDEX IF EXISTS ix_users_lookup ON dbo.users;
CREATE NONCLUSTERED INDEX ix_users_lookup 
ON dbo.users(role_id, status) 
INCLUDE (name, email, hospital_id, blood_bank_id);
GO


/* ============================================================================
   SECTION 3: DONOR & CONSENT RELATIONSHIPS
   ============================================================================ */

-- 10. Donors
IF OBJECT_ID('dbo.donors', 'U') IS NULL
BEGIN
    CREATE TABLE donors (
        donor_id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        user_id             UNIQUEIDENTIFIER NOT NULL,
        blood_type          VARCHAR(5)       NULL,
        date_of_birth       DATE             NULL,
        governorate         NVARCHAR(100)    NULL,
        eligibility_status  VARCHAR(30)      NOT NULL DEFAULT 'unknown',
        last_donation_date  DATE             NULL,

        CONSTRAINT pk_donors PRIMARY KEY (donor_id),
        CONSTRAINT uq_donors_user_id UNIQUE (user_id),

        CONSTRAINT fk_donors_user
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE NO ACTION,

        CONSTRAINT ck_donors_blood_type
            CHECK (blood_type IS NULL OR blood_type IN
                   ('A+','A-','B+','B-','AB+','AB-','O+','O-')),

        CONSTRAINT ck_donors_eligibility
            CHECK (eligibility_status IN ('eligible','ineligible','unknown'))
    );
END
GO

-- 11. Consents
IF OBJECT_ID('dbo.consents', 'U') IS NULL
BEGIN
    CREATE TABLE consents (
        consent_id      UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        donor_id        UNIQUEIDENTIFIER NOT NULL,
        consent_type    VARCHAR(50)      NOT NULL,
        granted         BIT              NOT NULL DEFAULT 0,
        granted_at      DATETIME2        NULL,
        revoked_at      DATETIME2        NULL,

        CONSTRAINT pk_consents PRIMARY KEY (consent_id),

        CONSTRAINT fk_consents_donor
            FOREIGN KEY (donor_id) REFERENCES donors(donor_id) ON DELETE NO ACTION,

        CONSTRAINT ck_consents_dates
            CHECK (
                (granted = 0 AND granted_at IS NULL)
                OR
                (granted = 1 AND granted_at IS NOT NULL)
            ),

        CONSTRAINT ck_consents_revocation
            CHECK (revoked_at IS NULL OR granted_at IS NOT NULL)
    );
END
GO

-- Section 3 Indexes
DROP INDEX IF EXISTS ix_consents_donor_id ON dbo.consents;
CREATE NONCLUSTERED INDEX ix_consents_donor_id ON dbo.consents(donor_id);

DROP INDEX IF EXISTS ix_donors_matching_fast ON dbo.donors;
CREATE NONCLUSTERED INDEX ix_donors_matching_fast 
ON dbo.donors(blood_type, eligibility_status, governorate) 
INCLUDE (user_id, last_donation_date);
GO


/* ============================================================================
   SECTION 4: DONATION, BLOOD BAG & TRACEABILITY CHAIN
   ============================================================================ */

-- 12. Donations
IF OBJECT_ID('dbo.donations', 'U') IS NULL
BEGIN
    CREATE TABLE donations (
        donation_id     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        blood_type      VARCHAR(5)       NOT NULL,
        quantity        NUMERIC(8,2)     NOT NULL,
        donation_date   DATETIME2        NOT NULL,
        status          VARCHAR(30)      NOT NULL DEFAULT 'collected',
        created_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        donor_id        UNIQUEIDENTIFIER NOT NULL,
        blood_bank_id   UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_donations PRIMARY KEY (donation_id),

        CONSTRAINT fk_donations_donor
            FOREIGN KEY (donor_id) REFERENCES donors(donor_id) ON DELETE NO ACTION,

        CONSTRAINT fk_donations_blood_bank
            FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(blood_bank_id) ON DELETE NO ACTION,

        CONSTRAINT ck_donations_blood_type
            CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),

        CONSTRAINT ck_donations_quantity
            CHECK (quantity > 0),

        CONSTRAINT ck_donations_status
            CHECK (status IN ('collected','processing','processed','discarded'))
    );
END
GO

-- 13. Blood Bags
IF OBJECT_ID('dbo.blood_bags', 'U') IS NULL
BEGIN
    CREATE TABLE blood_bags (
        blood_bag_id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        blood_type              VARCHAR(5)       NOT NULL,
        quantity                NUMERIC(8,2)     NOT NULL,
        collection_date         DATETIME2        NOT NULL,
        expiry_date             DATETIME2        NOT NULL,
        qr_code                 NVARCHAR(100)    NOT NULL,
        status                  VARCHAR(30)      NOT NULL DEFAULT 'available',
        current_location        NVARCHAR(255)    NULL,
        created_at              DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        donation_id             UNIQUEIDENTIFIER NOT NULL,
        current_blood_bank_id   UNIQUEIDENTIFIER NULL,

        CONSTRAINT pk_blood_bags PRIMARY KEY (blood_bag_id),
        CONSTRAINT uq_blood_bags_qr_code UNIQUE (qr_code),

        CONSTRAINT fk_blood_bags_donation
            FOREIGN KEY (donation_id) REFERENCES donations(donation_id) ON DELETE NO ACTION,

        CONSTRAINT fk_blood_bags_current_blood_bank
            FOREIGN KEY (current_blood_bank_id) REFERENCES blood_banks(blood_bank_id) ON DELETE NO ACTION,

        CONSTRAINT ck_blood_bags_blood_type
            CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),

        CONSTRAINT ck_blood_bags_quantity
            CHECK (quantity > 0),

        CONSTRAINT ck_blood_bags_dates
            CHECK (expiry_date > collection_date),

        CONSTRAINT ck_blood_bags_status
            CHECK (status IN
                   ('available','reserved','allocated','expired','discarded','in_transit'))
    );
END
GO

-- 14. Scan Events
IF OBJECT_ID('dbo.scan_events', 'U') IS NULL
BEGIN
    CREATE TABLE scan_events (
        scan_id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        blood_bag_id        UNIQUEIDENTIFIER NOT NULL,
        scanned_by_user_id  UNIQUEIDENTIFIER NOT NULL,
        scan_type           VARCHAR(40)      NOT NULL,
        scanned_at          DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        location            NVARCHAR(255)    NOT NULL,
        notes               NVARCHAR(500)    NULL,

        CONSTRAINT pk_scan_events PRIMARY KEY (scan_id),

        CONSTRAINT fk_scan_events_blood_bag
            FOREIGN KEY (blood_bag_id) REFERENCES blood_bags(blood_bag_id) ON DELETE NO ACTION,

        CONSTRAINT fk_scan_events_user
            FOREIGN KEY (scanned_by_user_id) REFERENCES users(user_id) ON DELETE NO ACTION
    );
END
GO

-- 15. Caregiver Assignments
IF OBJECT_ID('dbo.caregiver_assignments', 'U') IS NULL
BEGIN
    CREATE TABLE caregiver_assignments (
        assignment_id       UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        assignment_date     DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        status              VARCHAR(30)      NOT NULL DEFAULT 'active',
        notes               NVARCHAR(500)    NULL,
        blood_bag_id        UNIQUEIDENTIFIER NOT NULL,
        caregiver_user_id   UNIQUEIDENTIFIER NOT NULL,
        hospital_id         UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_caregiver_assignments PRIMARY KEY (assignment_id),

        CONSTRAINT fk_caregiver_assignments_blood_bag
            FOREIGN KEY (blood_bag_id) REFERENCES blood_bags(blood_bag_id) ON DELETE NO ACTION,

        CONSTRAINT fk_caregiver_assignments_user
            FOREIGN KEY (caregiver_user_id) REFERENCES users(user_id) ON DELETE NO ACTION,

        CONSTRAINT fk_caregiver_assignments_hospital
            FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE NO ACTION,

        CONSTRAINT ck_caregiver_assignments_status
            CHECK (status IN ('active','completed','cancelled'))
    );
END
GO

-- 16. Donation Vouchers
IF OBJECT_ID('dbo.donation_vouchers', 'U') IS NULL
BEGIN
    CREATE TABLE donation_vouchers (
        voucher_id       UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        voucher_number   NVARCHAR(50)     NOT NULL,
        issued_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        status           VARCHAR(30)      NOT NULL DEFAULT 'issued',
        donation_id      UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_donation_vouchers PRIMARY KEY (voucher_id),
        CONSTRAINT uq_donation_vouchers_number UNIQUE (voucher_number),
        CONSTRAINT uq_donation_vouchers_donation_id UNIQUE (donation_id),

        CONSTRAINT fk_donation_vouchers_donation
            FOREIGN KEY (donation_id) REFERENCES donations(donation_id) ON DELETE NO ACTION,

        CONSTRAINT ck_donation_vouchers_status
            CHECK (status IN ('issued','redeemed','void'))
    );
END
GO

-- Section 4 Indexes
DROP INDEX IF EXISTS ix_donations_donor_id ON dbo.donations;
CREATE NONCLUSTERED INDEX ix_donations_donor_id ON dbo.donations(donor_id);

DROP INDEX IF EXISTS ix_donations_blood_bank_id ON dbo.donations;
CREATE NONCLUSTERED INDEX ix_donations_blood_bank_id ON dbo.donations(blood_bank_id);

DROP INDEX IF EXISTS ix_blood_bags_donation_id ON dbo.blood_bags;
CREATE NONCLUSTERED INDEX ix_blood_bags_donation_id ON dbo.blood_bags(donation_id);

DROP INDEX IF EXISTS ix_blood_bags_current_blood_bank_id ON dbo.blood_bags;
CREATE NONCLUSTERED INDEX ix_blood_bags_current_blood_bank_id ON dbo.blood_bags(current_blood_bank_id);

DROP INDEX IF EXISTS ix_blood_bags_available_fast ON dbo.blood_bags;
CREATE NONCLUSTERED INDEX ix_blood_bags_available_fast 
ON dbo.blood_bags(blood_type, status, current_blood_bank_id) 
INCLUDE (quantity, expiry_date, qr_code, current_location);

DROP INDEX IF EXISTS ix_scan_events_bag_time ON dbo.scan_events;
CREATE NONCLUSTERED INDEX ix_scan_events_bag_time ON dbo.scan_events(blood_bag_id, scanned_at DESC);

DROP INDEX IF EXISTS ix_scan_events_scanned_by_user_id ON dbo.scan_events;
CREATE NONCLUSTERED INDEX ix_scan_events_scanned_by_user_id ON dbo.scan_events(scanned_by_user_id);

DROP INDEX IF EXISTS ix_scan_events_trace_timeline ON dbo.scan_events;
CREATE NONCLUSTERED INDEX ix_scan_events_trace_timeline 
ON dbo.scan_events(blood_bag_id, scanned_at DESC) 
INCLUDE (scan_type, scanned_by_user_id, location, notes);

DROP INDEX IF EXISTS ix_caregiver_assignments_blood_bag_id ON dbo.caregiver_assignments;
CREATE NONCLUSTERED INDEX ix_caregiver_assignments_blood_bag_id ON dbo.caregiver_assignments(blood_bag_id);

DROP INDEX IF EXISTS ix_caregiver_assignments_caregiver_user_id ON dbo.caregiver_assignments;
CREATE NONCLUSTERED INDEX ix_caregiver_assignments_caregiver_user_id ON dbo.caregiver_assignments(caregiver_user_id);

DROP INDEX IF EXISTS ix_caregiver_assignments_hospital_id ON dbo.caregiver_assignments;
CREATE NONCLUSTERED INDEX ix_caregiver_assignments_hospital_id ON dbo.caregiver_assignments(hospital_id);
GO


/* ============================================================================
   SECTION 5: BLOOD REQUESTS, ALLOCATIONS & FULFILMENT
   ============================================================================ */

-- 17. Blood Requests
IF OBJECT_ID('dbo.blood_requests', 'U') IS NULL
BEGIN
    CREATE TABLE blood_requests (
        blood_request_id     UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        blood_type           VARCHAR(5)       NOT NULL,
        requested_quantity   NUMERIC(8,2)     NOT NULL,
        urgency              VARCHAR(20)      NOT NULL DEFAULT 'normal',
        reason               NVARCHAR(500)    NULL,
        status               VARCHAR(30)      NOT NULL DEFAULT 'requested',
        required_by          DATETIME2        NULL,
        created_at           DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        hospital_id          UNIQUEIDENTIFIER NOT NULL,
        created_by_user_id   UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_blood_requests PRIMARY KEY (blood_request_id),

        CONSTRAINT fk_blood_requests_hospital
            FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id) ON DELETE NO ACTION,

        CONSTRAINT fk_blood_requests_created_by_user
            FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE NO ACTION,

        CONSTRAINT ck_blood_requests_blood_type
            CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),

        CONSTRAINT ck_blood_requests_quantity
            CHECK (requested_quantity > 0),

        CONSTRAINT ck_blood_requests_urgency
            CHECK (urgency IN ('normal','urgent','critical')),

        CONSTRAINT ck_blood_requests_status
            CHECK (status IN
                   ('requested','acknowledged','confirmed','prepared',
                    'completed','cancelled','expired')),

        CONSTRAINT ck_blood_requests_required_by
            CHECK (required_by IS NULL OR required_by >= created_at)
    );
END
GO

-- 18. Donation Responses
IF OBJECT_ID('dbo.donation_responses', 'U') IS NULL
BEGIN
    CREATE TABLE donation_responses (
        response_id        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        response_date      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        status             VARCHAR(30)      NOT NULL DEFAULT 'pending',
        notes              NVARCHAR(500)    NULL,
        blood_request_id   UNIQUEIDENTIFIER NOT NULL,
        donor_id           UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_donation_responses PRIMARY KEY (response_id),

        CONSTRAINT fk_donation_responses_blood_request
            FOREIGN KEY (blood_request_id) REFERENCES blood_requests(blood_request_id) ON DELETE NO ACTION,

        CONSTRAINT fk_donation_responses_donor
            FOREIGN KEY (donor_id) REFERENCES donors(donor_id) ON DELETE NO ACTION,

        CONSTRAINT ck_donation_responses_status
            CHECK (status IN ('pending','accepted','declined','cancelled'))
    );
END
GO

-- 19. Request Allocations
IF OBJECT_ID('dbo.request_allocations', 'U') IS NULL
BEGIN
    CREATE TABLE request_allocations (
        allocation_id       UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        quantity            NUMERIC(8,2)     NOT NULL,
        status              VARCHAR(30)      NOT NULL DEFAULT 'allocated',
        allocated_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        blood_request_id    UNIQUEIDENTIFIER NOT NULL,
        blood_bank_id       UNIQUEIDENTIFIER NOT NULL,
        blood_bag_id        UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_request_allocations PRIMARY KEY (allocation_id),
        CONSTRAINT uq_request_allocations_blood_bag UNIQUE (blood_bag_id),

        CONSTRAINT fk_request_allocations_blood_request
            FOREIGN KEY (blood_request_id) REFERENCES blood_requests(blood_request_id) ON DELETE NO ACTION,

        CONSTRAINT fk_request_allocations_blood_bank
            FOREIGN KEY (blood_bank_id) REFERENCES blood_banks(blood_bank_id) ON DELETE NO ACTION,

        CONSTRAINT fk_request_allocations_blood_bag
            FOREIGN KEY (blood_bag_id) REFERENCES blood_bags(blood_bag_id) ON DELETE NO ACTION,

        CONSTRAINT ck_request_allocations_quantity
            CHECK (quantity > 0),

        CONSTRAINT ck_request_allocations_status
            CHECK (status IN ('allocated','released','fulfilled','cancelled'))
    );
END
GO

-- 20. Payments
IF OBJECT_ID('dbo.payments', 'U') IS NULL
BEGIN
    CREATE TABLE payments (
        payment_id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        amount                   NUMERIC(10,2)    NOT NULL,
        payment_status           VARCHAR(30)      NOT NULL DEFAULT 'pending',
        payment_method           VARCHAR(40)      NULL,
        paid_at                  DATETIME2        NULL,
        transaction_reference    NVARCHAR(100)    NULL,
        created_at               DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        blood_request_id         UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_payments PRIMARY KEY (payment_id),
        CONSTRAINT uq_payments_blood_request_id UNIQUE (blood_request_id),

        CONSTRAINT fk_payments_blood_request
            FOREIGN KEY (blood_request_id) REFERENCES blood_requests(blood_request_id) ON DELETE NO ACTION,

        CONSTRAINT ck_payments_amount
            CHECK (amount >= 0),

        CONSTRAINT ck_payments_status
            CHECK (payment_status IN ('pending','paid','failed','refunded'))
    );
END
GO

-- Section 5 Indexes
DROP INDEX IF EXISTS ux_payments_transaction_reference ON dbo.payments;
CREATE UNIQUE INDEX ux_payments_transaction_reference
    ON dbo.payments(transaction_reference)
    WHERE transaction_reference IS NOT NULL;

-- 21. Supporting Documents
IF OBJECT_ID('dbo.supporting_documents', 'U') IS NULL
BEGIN
    CREATE TABLE supporting_documents (
        document_id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        file_name               NVARCHAR(255)    NOT NULL,
        file_path               NVARCHAR(500)    NOT NULL,
        file_type               VARCHAR(50)      NULL,
        uploaded_at             DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        status                  VARCHAR(30)      NOT NULL DEFAULT 'pending',
        reviewed_at             DATETIME2        NULL,
        rejection_reason        NVARCHAR(500)    NULL,
        blood_request_id        UNIQUEIDENTIFIER NOT NULL,
        uploaded_by_user_id     UNIQUEIDENTIFIER NOT NULL,
        reviewed_by_user_id     UNIQUEIDENTIFIER NULL,

        CONSTRAINT pk_supporting_documents PRIMARY KEY (document_id),

        CONSTRAINT fk_supporting_documents_blood_request
            FOREIGN KEY (blood_request_id) REFERENCES blood_requests(blood_request_id) ON DELETE NO ACTION,

        CONSTRAINT fk_supporting_documents_uploaded_by_user
            FOREIGN KEY (uploaded_by_user_id) REFERENCES users(user_id) ON DELETE NO ACTION,

        CONSTRAINT fk_supporting_documents_reviewed_by_user
            FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id) ON DELETE NO ACTION,

        CONSTRAINT ck_supporting_documents_status
            CHECK (status IN ('pending','approved','rejected')),

        CONSTRAINT ck_supporting_documents_review
            CHECK (
                (reviewed_by_user_id IS NULL AND reviewed_at IS NULL)
                OR
                (reviewed_by_user_id IS NOT NULL AND reviewed_at IS NOT NULL)
            )
    );
END
GO

-- 22. Request Status History
IF OBJECT_ID('dbo.request_status_history', 'U') IS NULL
BEGIN
    CREATE TABLE request_status_history (
        history_id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        status                VARCHAR(30)      NOT NULL,
        changed_at            DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        notes                 NVARCHAR(500)    NULL,
        blood_request_id      UNIQUEIDENTIFIER NOT NULL,
        changed_by_user_id    UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_request_status_history PRIMARY KEY (history_id),

        CONSTRAINT fk_request_status_history_blood_request
            FOREIGN KEY (blood_request_id) REFERENCES blood_requests(blood_request_id) ON DELETE NO ACTION,

        CONSTRAINT fk_request_status_history_user
            FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id) ON DELETE NO ACTION,

        CONSTRAINT ck_request_status_history_status
            CHECK (status IN
                   ('requested','acknowledged','confirmed','prepared',
                    'completed','cancelled','expired'))
    );
END
GO

DROP INDEX IF EXISTS ix_blood_requests_hospital_id ON dbo.blood_requests;
CREATE NONCLUSTERED INDEX ix_blood_requests_hospital_id ON dbo.blood_requests(hospital_id);

DROP INDEX IF EXISTS ix_blood_requests_created_by_user_id ON dbo.blood_requests;
CREATE NONCLUSTERED INDEX ix_blood_requests_created_by_user_id ON dbo.blood_requests(created_by_user_id);

DROP INDEX IF EXISTS ix_blood_requests_active_fast ON dbo.blood_requests;
CREATE NONCLUSTERED INDEX ix_blood_requests_active_fast 
ON dbo.blood_requests(status, urgency, blood_type, required_by) 
INCLUDE (hospital_id, requested_quantity, created_at, created_by_user_id);

DROP INDEX IF EXISTS ix_donation_responses_blood_request_id ON dbo.donation_responses;
CREATE NONCLUSTERED INDEX ix_donation_responses_blood_request_id ON dbo.donation_responses(blood_request_id);

DROP INDEX IF EXISTS ix_donation_responses_donor_id ON dbo.donation_responses;
CREATE NONCLUSTERED INDEX ix_donation_responses_donor_id ON dbo.donation_responses(donor_id);

DROP INDEX IF EXISTS ix_request_allocations_blood_request_id ON dbo.request_allocations;
CREATE NONCLUSTERED INDEX ix_request_allocations_blood_request_id ON dbo.request_allocations(blood_request_id);

DROP INDEX IF EXISTS ix_request_allocations_blood_bank_id ON dbo.request_allocations;
CREATE NONCLUSTERED INDEX ix_request_allocations_blood_bank_id ON dbo.request_allocations(blood_bank_id);

DROP INDEX IF EXISTS ix_supporting_documents_blood_request_id ON dbo.supporting_documents;
CREATE NONCLUSTERED INDEX ix_supporting_documents_blood_request_id ON dbo.supporting_documents(blood_request_id);

DROP INDEX IF EXISTS ix_supporting_documents_uploaded_by_user_id ON dbo.supporting_documents;
CREATE NONCLUSTERED INDEX ix_supporting_documents_uploaded_by_user_id ON dbo.supporting_documents(uploaded_by_user_id);

DROP INDEX IF EXISTS ix_supporting_documents_reviewed_by_user_id ON dbo.supporting_documents;
CREATE NONCLUSTERED INDEX ix_supporting_documents_reviewed_by_user_id ON dbo.supporting_documents(reviewed_by_user_id);

DROP INDEX IF EXISTS ix_request_status_history_request_time ON dbo.request_status_history;
CREATE NONCLUSTERED INDEX ix_request_status_history_request_time ON dbo.request_status_history(blood_request_id, changed_at DESC);

DROP INDEX IF EXISTS ix_request_status_history_changed_by_user_id ON dbo.request_status_history;
CREATE NONCLUSTERED INDEX ix_request_status_history_changed_by_user_id ON dbo.request_status_history(changed_by_user_id);
GO


/* ============================================================================
   SECTION 6: NOTIFICATIONS & AUDIT LOGS
   ============================================================================ */

-- 23. Notifications
IF OBJECT_ID('dbo.notifications', 'U') IS NULL
BEGIN
    CREATE TABLE notifications (
        notification_id   UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        title             NVARCHAR(200)    NOT NULL,
        message           NVARCHAR(1000)   NOT NULL,
        type              VARCHAR(50)      NOT NULL,
        status            VARCHAR(30)      NOT NULL DEFAULT 'unread',
        created_at        DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        read_at           DATETIME2        NULL,
        user_id           UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_notifications PRIMARY KEY (notification_id),

        CONSTRAINT fk_notifications_user
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE NO ACTION,

        CONSTRAINT ck_notifications_status
            CHECK (status IN ('unread','read','dismissed')),

        CONSTRAINT ck_notifications_read_state
            CHECK (
                (status = 'unread' AND read_at IS NULL)
                OR
                (status IN ('read','dismissed') AND read_at IS NOT NULL)
            )
    );
END
GO

-- 24. Audit Logs
IF OBJECT_ID('dbo.audit_logs', 'U') IS NULL
BEGIN
    CREATE TABLE audit_logs (
        audit_id       UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        entity_type    VARCHAR(80)      NOT NULL,
        entity_id      UNIQUEIDENTIFIER NOT NULL,
        action         VARCHAR(50)      NOT NULL,
        logged_at      DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
        user_id        UNIQUEIDENTIFIER NOT NULL,

        CONSTRAINT pk_audit_logs PRIMARY KEY (audit_id),

        CONSTRAINT fk_audit_logs_user
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE NO ACTION
    );
END
GO

-- Section 6 Indexes
DROP INDEX IF EXISTS ix_notifications_user_status_time ON dbo.notifications;
CREATE NONCLUSTERED INDEX ix_notifications_user_status_time ON dbo.notifications(user_id, status, created_at DESC);

DROP INDEX IF EXISTS ix_notifications_unread_fast ON dbo.notifications;
CREATE NONCLUSTERED INDEX ix_notifications_unread_fast 
ON dbo.notifications(user_id, created_at DESC) 
INCLUDE (title, message, type)
WHERE status = 'unread';

DROP INDEX IF EXISTS ix_audit_logs_user_time ON dbo.audit_logs;
CREATE NONCLUSTERED INDEX ix_audit_logs_user_time ON dbo.audit_logs(user_id, logged_at DESC);
GO


/* ============================================================================
   SECTION 7: READY-MADE VIEWS (PRE-JOINED FOR FAST API / DASHBOARD DEVELOPMENT)
   ============================================================================ */

IF OBJECT_ID('dbo.vw_current_blood_inventory', 'V') IS NOT NULL
    DROP VIEW dbo.vw_current_blood_inventory;
GO

CREATE VIEW dbo.vw_current_blood_inventory
AS
SELECT
    bb.current_blood_bank_id,
    bank.name AS blood_bank_name,
    bank.governorate,
    bb.blood_type,
    COUNT(*) AS total_available_bags,
    SUM(bb.quantity) AS total_available_ml,
    MIN(bb.expiry_date) AS earliest_expiry_date
FROM blood_bags bb
JOIN blood_banks bank ON bb.current_blood_bank_id = bank.blood_bank_id
WHERE bb.status = 'available' AND bb.expiry_date > SYSUTCDATETIME()
GROUP BY bb.current_blood_bank_id, bank.name, bank.governorate, bb.blood_type;
GO

IF OBJECT_ID('dbo.vw_active_blood_requests', 'V') IS NOT NULL
    DROP VIEW dbo.vw_active_blood_requests;
GO

CREATE VIEW dbo.vw_active_blood_requests
AS
SELECT
    br.blood_request_id,
    br.blood_type,
    br.requested_quantity,
    br.urgency,
    br.reason,
    br.status AS request_status,
    br.required_by,
    br.created_at,
    h.hospital_id,
    h.name AS hospital_name,
    h.governorate AS hospital_governorate,
    u.name AS requested_by_user_name,
    ISNULL(SUM(ra.quantity), 0) AS allocated_quantity,
    (br.requested_quantity - ISNULL(SUM(ra.quantity), 0)) AS remaining_quantity
FROM blood_requests br
JOIN hospitals h ON br.hospital_id = h.hospital_id
JOIN users u ON br.created_by_user_id = u.user_id
LEFT JOIN request_allocations ra ON br.blood_request_id = ra.blood_request_id AND ra.status = 'allocated'
WHERE br.status IN ('requested', 'acknowledged', 'confirmed', 'prepared')
GROUP BY 
    br.blood_request_id, br.blood_type, br.requested_quantity, br.urgency,
    br.reason, br.status, br.required_by, br.created_at, h.hospital_id,
    h.name, h.governorate, u.name;
GO

IF OBJECT_ID('dbo.vw_blood_bag_traceability', 'V') IS NOT NULL
    DROP VIEW dbo.vw_blood_bag_traceability;
GO

CREATE VIEW dbo.vw_blood_bag_traceability
AS
SELECT
    bb.blood_bag_id,
    bb.qr_code,
    bb.blood_type,
    bb.quantity AS bag_quantity_ml,
    bb.status AS current_status,
    bb.current_location,
    bb.collection_date,
    bb.expiry_date,
    d.donation_id,
    d.donation_date,
    donor_u.name AS donor_name,
    donor.governorate AS donor_governorate,
    bank.name AS blood_bank_name,
    ra.blood_request_id,
    h.name AS allocated_to_hospital
FROM blood_bags bb
JOIN donations d ON bb.donation_id = d.donation_id
JOIN donors donor ON d.donor_id = donor.donor_id
JOIN users donor_u ON donor.user_id = donor_u.user_id
LEFT JOIN blood_banks bank ON bb.current_blood_bank_id = bank.blood_bank_id
LEFT JOIN request_allocations ra ON bb.blood_bag_id = ra.blood_bag_id
LEFT JOIN blood_requests br ON ra.blood_request_id = br.blood_request_id
LEFT JOIN hospitals h ON br.hospital_id = h.hospital_id;
GO

IF OBJECT_ID('dbo.vw_eligible_matching_donors', 'V') IS NOT NULL
    DROP VIEW dbo.vw_eligible_matching_donors;
GO

CREATE VIEW dbo.vw_eligible_matching_donors
AS
SELECT
    d.donor_id,
    d.user_id,
    u.name AS donor_name,
    u.email,
    d.blood_type,
    d.governorate,
    d.last_donation_date,
    DATEDIFF(DAY, d.last_donation_date, GETDATE()) AS days_since_last_donation
FROM donors d
JOIN users u ON d.user_id = u.user_id
WHERE d.eligibility_status = 'eligible'
  AND u.status = 'active'
  AND (d.last_donation_date IS NULL OR DATEDIFF(DAY, d.last_donation_date, GETDATE()) >= 56);
GO


/* ============================================================================
   SECTION 8: ATOMIC STORED PROCEDURES (RACE-CONDITION FREE)
   ============================================================================ */

IF OBJECT_ID('dbo.usp_record_blood_bag_scan', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_record_blood_bag_scan;
GO

CREATE PROCEDURE dbo.usp_record_blood_bag_scan
    @blood_bag_id           UNIQUEIDENTIFIER,
    @scanned_by_user_id     UNIQUEIDENTIFIER,
    @scan_type              VARCHAR(40),
    @location               NVARCHAR(255),
    @new_status             VARCHAR(30) = NULL,
    @new_location           NVARCHAR(255) = NULL,
    @new_blood_bank_id      UNIQUEIDENTIFIER = NULL,
    @notes                  NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1
            FROM blood_bags WITH (UPDLOCK, HOLDLOCK)
            WHERE blood_bag_id = @blood_bag_id
        )
        BEGIN
            RAISERROR('Blood bag does not exist.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM users
            WHERE user_id = @scanned_by_user_id
        )
        BEGIN
            RAISERROR('Scanning user does not exist.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @new_status IS NOT NULL
           AND @new_status NOT IN
               ('available','reserved','allocated','expired','discarded','in_transit')
        BEGIN
            RAISERROR('Invalid blood bag status.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @new_blood_bank_id IS NOT NULL
           AND NOT EXISTS (
               SELECT 1 FROM blood_banks
               WHERE blood_bank_id = @new_blood_bank_id
           )
        BEGIN
            RAISERROR('Target blood bank does not exist.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        INSERT INTO scan_events (
            blood_bag_id,
            scanned_by_user_id,
            scan_type,
            scanned_at,
            location,
            notes
        )
        VALUES (
            @blood_bag_id,
            @scanned_by_user_id,
            @scan_type,
            SYSUTCDATETIME(),
            @location,
            @notes
        );

        UPDATE blood_bags
        SET
            status = COALESCE(@new_status, status),
            current_location = COALESCE(@new_location, current_location),
            current_blood_bank_id =
                CASE
                    WHEN @new_blood_bank_id IS NOT NULL
                        THEN @new_blood_bank_id
                    WHEN @new_status = 'in_transit'
                        THEN NULL
                    ELSE current_blood_bank_id
                END
        WHERE blood_bag_id = @blood_bag_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ScanErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ScanErrSev INT = ERROR_SEVERITY();
        DECLARE @ScanErrState INT = ERROR_STATE();
        RAISERROR(@ScanErrMsg, @ScanErrSev, @ScanErrState);
    END CATCH
END
GO

IF OBJECT_ID('dbo.usp_allocate_blood_bag', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_allocate_blood_bag;
GO

CREATE PROCEDURE dbo.usp_allocate_blood_bag
    @blood_request_id    UNIQUEIDENTIFIER,
    @blood_bank_id       UNIQUEIDENTIFIER,
    @blood_bag_id        UNIQUEIDENTIFIER,
    @quantity             NUMERIC(8,2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @quantity <= 0
        BEGIN
            RAISERROR('Allocation quantity must be greater than zero.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM blood_requests
            WHERE blood_request_id = @blood_request_id
        )
        BEGIN
            RAISERROR('Blood request does not exist.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        DECLARE
            @bag_status VARCHAR(30),
            @bag_expiry DATETIME2,
            @bag_bank UNIQUEIDENTIFIER,
            @bag_quantity NUMERIC(8,2),
            @bag_blood_type VARCHAR(5),
            @request_blood_type VARCHAR(5);

        SELECT
            @bag_status = status,
            @bag_expiry = expiry_date,
            @bag_bank = current_blood_bank_id,
            @bag_quantity = quantity,
            @bag_blood_type = blood_type
        FROM blood_bags WITH (UPDLOCK, HOLDLOCK)
        WHERE blood_bag_id = @blood_bag_id;

        IF @bag_status IS NULL
        BEGIN
            RAISERROR('Blood bag does not exist.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @bag_status NOT IN ('available','reserved')
        BEGIN
            RAISERROR('Blood bag is not available for allocation.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @bag_expiry <= SYSUTCDATETIME()
        BEGIN
            RAISERROR('Blood bag is expired.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @bag_bank IS NULL OR @bag_bank <> @blood_bank_id
        BEGIN
            RAISERROR('Blood bag is not currently stored at the specified blood bank.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @quantity > @bag_quantity
        BEGIN
            RAISERROR('Allocation quantity exceeds the blood bag quantity.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        SELECT @request_blood_type = blood_type
        FROM blood_requests
        WHERE blood_request_id = @blood_request_id;

        IF @request_blood_type <> @bag_blood_type
        BEGIN
            RAISERROR('Blood type does not match the request.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF EXISTS (
            SELECT 1
            FROM request_allocations WITH (UPDLOCK, HOLDLOCK)
            WHERE blood_bag_id = @blood_bag_id
        )
        BEGIN
            RAISERROR('Blood bag is already allocated.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        INSERT INTO request_allocations (
            quantity,
            status,
            allocated_at,
            blood_request_id,
            blood_bank_id,
            blood_bag_id
        )
        VALUES (
            @quantity,
            'allocated',
            SYSUTCDATETIME(),
            @blood_request_id,
            @blood_bank_id,
            @blood_bag_id
        );

        UPDATE blood_bags
        SET status = 'allocated'
        WHERE blood_bag_id = @blood_bag_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @AllocErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @AllocErrSev INT = ERROR_SEVERITY();
        DECLARE @AllocErrState INT = ERROR_STATE();
        RAISERROR(@AllocErrMsg, @AllocErrSev, @AllocErrState);
    END CATCH
END
GO


/* ============================================================================
   SECTION 8.5: INTEGRITY TRIGGERS
   ============================================================================ */

-- Trigger: Ensure Blood Bag blood_type strictly matches its Donation blood_type
IF OBJECT_ID('dbo.trg_blood_bags_validate_blood_type', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_blood_bags_validate_blood_type;
GO

CREATE TRIGGER dbo.trg_blood_bags_validate_blood_type
ON dbo.blood_bags
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN dbo.donations d ON i.donation_id = d.donation_id
        WHERE i.blood_type <> d.blood_type
    )
    BEGIN
        RAISERROR('Integrity Violation: Blood bag blood type must strictly match the parent donation blood type.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO


/* ============================================================================
   SECTION 9: SEED DATA (INITIAL ROLES, PERMISSIONS & TEST DATA)
   ============================================================================ */

IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'SystemAdmin')
BEGIN
    PRINT '>>> Inserting Initial Seed Data...';

    -- 1. Base Roles
    DECLARE @role_admin_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @role_hospital_staff_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @role_bank_staff_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @role_donor_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @role_caregiver_id UNIQUEIDENTIFIER = NEWID();

    INSERT INTO roles (role_id, name, description)
    VALUES
        (@role_admin_id, 'SystemAdmin', 'Full administrative system access'),
        (@role_hospital_staff_id, 'HospitalStaff', 'Hospital staff responsible for blood requests'),
        (@role_bank_staff_id, 'BloodBankStaff', 'Blood bank personnel managing inventory and allocations'),
        (@role_donor_id, 'Donor', 'Registered blood donor'),
        (@role_caregiver_id, 'Caregiver', 'Caregiver / Nurse administering blood units');

    -- 2. Permissions
    DECLARE @p1 UNIQUEIDENTIFIER = NEWID();
    DECLARE @p2 UNIQUEIDENTIFIER = NEWID();
    DECLARE @p3 UNIQUEIDENTIFIER = NEWID();
    DECLARE @p4 UNIQUEIDENTIFIER = NEWID();
    DECLARE @p5 UNIQUEIDENTIFIER = NEWID();

    INSERT INTO permissions (permission_id, name, description)
    VALUES
        (@p1, 'CREATE_REQUEST', 'Ability to create urgent or normal blood requests'),
        (@p2, 'ALLOCATE_BAG', 'Ability to allocate blood bags to hospital requests'),
        (@p3, 'SCAN_BAG', 'Ability to perform QR barcode scan and log events'),
        (@p4, 'VIEW_INVENTORY', 'Ability to view blood bag stocks and availability'),
        (@p5, 'MANAGE_USERS', 'Ability to manage platform user accounts');

    -- 3. Link Role Permissions
    INSERT INTO role_permissions (role_id, permission_id)
    VALUES
        (@role_admin_id, @p1),
        (@role_admin_id, @p2),
        (@role_admin_id, @p3),
        (@role_admin_id, @p4),
        (@role_admin_id, @p5),
        (@role_hospital_staff_id, @p1),
        (@role_bank_staff_id, @p2),
        (@role_bank_staff_id, @p3),
        (@role_bank_staff_id, @p4),
        (@role_caregiver_id, @p3);

    -- 4. Sample Hospital & Blood Bank
    DECLARE @hospital_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @blood_bank_id UNIQUEIDENTIFIER = NEWID();

    INSERT INTO hospitals (hospital_id, name, governorate, address, status)
    VALUES (@hospital_id, N'Al-Qasr Al-Aini Hospital', N'Cairo', N'Kasr Al Ainy St, Old Cairo', 'active');

    INSERT INTO hospital_phones (hospital_id, phone)
    VALUES (@hospital_id, '+20223654000'), (@hospital_id, '+20223654001');

    INSERT INTO blood_banks (blood_bank_id, name, governorate, address, status)
    VALUES (@blood_bank_id, N'National Blood Transfusion Center', N'Giza', N'51 Wezaret El-Zeraa St, Agouza', 'active');

    INSERT INTO blood_bank_phones (blood_bank_id, phone)
    VALUES (@blood_bank_id, '+20237618991');

    -- 5. Sample Users
    DECLARE @admin_user_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @bank_user_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @hospital_user_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @donor_user_id UNIQUEIDENTIFIER = NEWID();

    INSERT INTO users (user_id, name, email, password_hash, status, role_id, hospital_id, blood_bank_id)
    VALUES
        (@admin_user_id, N'System Admin', 'admin@lifelink.org', '$2a$12$e8Y6l9cT2r4qW...', 'active', @role_admin_id, NULL, NULL),
        (@bank_user_id, N'Dr. Ahmed Ali (Bank Lab)', 'bank.lab@lifelink.org', '$2a$12$e8Y6l9cT2r4qW...', 'active', @role_bank_staff_id, NULL, @blood_bank_id),
        (@hospital_user_id, N'Dr. Sarah Mahmoud (ER)', 'sarah.er@hospital.org', '$2a$12$e8Y6l9cT2r4qW...', 'active', @role_hospital_staff_id, @hospital_id, NULL),
        (@donor_user_id, N'Mohamed Youssef', 'donor.mohamed@gmail.com', '$2a$12$e8Y6l9cT2r4qW...', 'active', @role_donor_id, NULL, NULL);

    INSERT INTO user_phones (user_id, phone)
    VALUES
        (@donor_user_id, '+201012345678'),
        (@hospital_user_id, '+201198765432');

    -- 6. Sample Donor Record & Consent
    DECLARE @donor_id UNIQUEIDENTIFIER = NEWID();

    INSERT INTO donors (donor_id, user_id, blood_type, date_of_birth, governorate, eligibility_status, last_donation_date)
    VALUES (@donor_id, @donor_user_id, 'O+', '1995-05-15', N'Cairo', 'eligible', '2026-06-01');

    INSERT INTO consents (donor_id, consent_type, granted, granted_at)
    VALUES (@donor_id, 'GENERAL_DONATION_TERMS', 1, SYSUTCDATETIME());

    -- 7. Sample Donation & Blood Bag
    DECLARE @donation_id UNIQUEIDENTIFIER = NEWID();
    DECLARE @blood_bag_id UNIQUEIDENTIFIER = NEWID();

    INSERT INTO donations (donation_id, blood_type, quantity, donation_date, status, donor_id, blood_bank_id)
    VALUES (@donation_id, 'O+', 450.00, SYSUTCDATETIME(), 'processed', @donor_id, @blood_bank_id);

    INSERT INTO donation_vouchers (voucher_number, donation_id, status)
    VALUES ('VCH-2026-0001', @donation_id, 'issued');

    INSERT INTO blood_bags (blood_bag_id, blood_type, quantity, collection_date, expiry_date, qr_code, status, current_location, donation_id, current_blood_bank_id)
    VALUES (
        @blood_bag_id,
        'O+',
        450.00,
        SYSUTCDATETIME(),
        DATEADD(DAY, 35, SYSUTCDATETIME()),
        'QR-LL-BAG-2026-00981',
        'available',
        N'Main Storage Fridge A-12',
        @donation_id,
        @blood_bank_id
    );

    PRINT '>>> Life Link Database initialization, Views & Seed Data completed successfully! <<<';
END
ELSE
BEGIN
    PRINT '>>> Seed data already exists. Skipping insertion.';
END
GO
