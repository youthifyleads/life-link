/*
    Life Link - Migration 002
    Indexes
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;
GO

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

DROP INDEX IF EXISTS ix_consents_donor_id ON dbo.consents;
CREATE NONCLUSTERED INDEX ix_consents_donor_id ON dbo.consents(donor_id);

DROP INDEX IF EXISTS ix_donors_matching_fast ON dbo.donors;
CREATE NONCLUSTERED INDEX ix_donors_matching_fast 
ON dbo.donors(blood_type, eligibility_status, governorate) 
INCLUDE (user_id, last_donation_date);

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

DROP INDEX IF EXISTS ix_notifications_user_status_time ON dbo.notifications;
CREATE NONCLUSTERED INDEX ix_notifications_user_status_time ON dbo.notifications(user_id, status, created_at DESC);

DROP INDEX IF EXISTS ix_notifications_unread_fast ON dbo.notifications;
CREATE NONCLUSTERED INDEX ix_notifications_unread_fast 
ON dbo.notifications(user_id, created_at DESC) 
INCLUDE (title, message, type)
WHERE status = 'unread';

DROP INDEX IF EXISTS ix_audit_logs_user_time ON dbo.audit_logs;
CREATE NONCLUSTERED INDEX ix_audit_logs_user_time ON dbo.audit_logs(user_id, logged_at DESC);

COMMIT TRANSACTION;
GO
