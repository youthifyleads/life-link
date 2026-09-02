/*
    Life Link - Migration 005
    Initial seed / development data

    Review this migration before applying it to production.
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
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
