/*
    Life Link - Migration 001
    Initial SQL Server schema

    Target: Microsoft SQL Server 2016+ / Azure SQL Database

    Contains:
      - Tables
      - Primary keys
      - Foreign keys
      - Unique constraints
      - Check constraints

    Excluded from this migration:
      - CREATE DATABASE / USE
      - Indexes
      - Views
      - Stored procedures
      - Triggers
      - Seed/test data
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;
GO

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

COMMIT TRANSACTION;
GO
