/*
    Life Link - Migration 012
    Seed realistic, clinical, production-grade master data for Hospitals, Blood Banks,
    Blood Bags (covering all 8 blood groups and components), and Blood Requests.

    Target: Microsoft SQL Server 2016+ / Azure SQL Database
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Ensure columns and constraints on blood_bags table
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.blood_bags') AND name = 'component')
BEGIN
    ALTER TABLE dbo.blood_bags ADD component VARCHAR(50) NOT NULL CONSTRAINT DF_blood_bags_component DEFAULT 'whole_blood';
    PRINT 'Added blood_bags.component';
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.blood_bags') AND name = 'allocated_request_id')
BEGIN
    ALTER TABLE dbo.blood_bags ADD allocated_request_id VARCHAR(50) NULL;
    PRINT 'Added blood_bags.allocated_request_id';
END;
GO

-- Ensure blood_bags.donation_id is NULLABLE (bags can exist as baseline inventory or from external shipments without a direct donor record)
IF EXISTS (
    SELECT 1 FROM sys.columns c
    WHERE c.object_id = OBJECT_ID('dbo.blood_bags')
      AND c.name = 'donation_id'
      AND c.is_nullable = 0
)
BEGIN
    DECLARE @fk_donation NVARCHAR(256);
    SELECT TOP 1 @fk_donation = fk.name
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
    WHERE fk.parent_object_id = OBJECT_ID('dbo.blood_bags') AND c.name = 'donation_id';

    IF @fk_donation IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE dbo.blood_bags DROP CONSTRAINT [' + @fk_donation + '];');
    END;

    DECLARE @type_donation SYSNAME;
    SELECT @type_donation = t.name
    FROM sys.columns c
    JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID('dbo.blood_bags') AND c.name = 'donation_id';

    IF @type_donation = 'uniqueidentifier'
        EXEC('ALTER TABLE dbo.blood_bags ALTER COLUMN donation_id UNIQUEIDENTIFIER NULL;');
    ELSE
        EXEC('ALTER TABLE dbo.blood_bags ALTER COLUMN donation_id VARCHAR(50) NULL;');

    IF @fk_donation IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE dbo.blood_bags ADD CONSTRAINT [' + @fk_donation + '] FOREIGN KEY (donation_id) REFERENCES dbo.donations (donation_id);');
    END;

    PRINT 'Altered blood_bags.donation_id to allow NULL';
END;
GO

-- 2. Ensure columns exist on blood_requests table
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.blood_requests') AND name = 'component')
BEGIN
    ALTER TABLE dbo.blood_requests ADD component VARCHAR(50) NULL CONSTRAINT DF_blood_requests_component DEFAULT 'red_cells';
    PRINT 'Added blood_requests.component';
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.blood_requests') AND name = 'unit_price')
BEGIN
    ALTER TABLE dbo.blood_requests ADD unit_price NUMERIC(10, 2) NULL;
    PRINT 'Added blood_requests.unit_price';
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.blood_requests') AND name = 'total_amount')
BEGIN
    ALTER TABLE dbo.blood_requests ADD total_amount NUMERIC(10, 2) NULL;
    PRINT 'Added blood_requests.total_amount';
END;
GO

-- Ensure latitude/longitude columns on hospitals table
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.hospitals') AND name = 'latitude')
BEGIN
    ALTER TABLE dbo.hospitals ADD latitude NUMERIC(9, 6) NULL;
    PRINT 'Added hospitals.latitude';
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.hospitals') AND name = 'longitude')
BEGIN
    ALTER TABLE dbo.hospitals ADD longitude NUMERIC(9, 6) NULL;
    PRINT 'Added hospitals.longitude';
END;
GO

-- 3. Seed Hospitals
IF NOT EXISTS (SELECT 1 FROM dbo.hospitals WHERE hospital_id = '8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9')
BEGIN
    INSERT INTO dbo.hospitals (hospital_id, name, governorate, address, status, latitude, longitude)
    VALUES ('8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9', N'Al-Qasr Al-Aini Hospital', N'Cairo', N'Al-Manial, Cairo Governorate', 'active', 30.0305, 31.2285);
    PRINT 'Inserted Al-Qasr Al-Aini Hospital';
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.hospitals WHERE hospital_id = 'E1B4C932-842B-4BC2-9B7C-D3F28591A001')
BEGIN
    INSERT INTO dbo.hospitals (hospital_id, name, governorate, address, status, latitude, longitude)
    VALUES ('E1B4C932-842B-4BC2-9B7C-D3F28591A001', N'Ain Shams University Specialized Hospital', N'Cairo', N'Abbassiya, Cairo Governorate', 'active', 30.0768, 31.2852);
    PRINT 'Inserted Ain Shams University Specialized Hospital';
END;
GO

-- 4. Seed Blood Banks (Note: blood_banks table does not require latitude/longitude)
IF NOT EXISTS (SELECT 1 FROM dbo.blood_banks WHERE blood_bank_id = '07397940-37A5-49A2-992D-3F2992660C9C')
BEGIN
    INSERT INTO dbo.blood_banks (blood_bank_id, name, governorate, address, status)
    VALUES ('07397940-37A5-49A2-992D-3F2992660C9C', N'National Blood Transfusion Center', N'Giza', N'51 Wezaret El-Zeraa St, Agouza / Dokki', 'active');
    PRINT 'Inserted National Blood Transfusion Center';
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blood_banks WHERE blood_bank_id = 'B2A5C911-381A-421F-811A-B1479831B002')
BEGIN
    INSERT INTO dbo.blood_banks (blood_bank_id, name, governorate, address, status)
    VALUES ('B2A5C911-381A-421F-811A-B1479831B002', N'Abbasiya Regional Blood Center', N'Cairo', N'Sekket El-Wayly, Abbassiya', 'active');
    PRINT 'Inserted Abbasiya Regional Blood Center';
END;
GO

-- Ensure Hospital Phone Numbers
IF NOT EXISTS (SELECT 1 FROM dbo.hospital_phones WHERE hospital_id = '8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9')
BEGIN
    INSERT INTO dbo.hospital_phones (hospital_id, phone) VALUES ('8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9', '+20 2 2365 4000');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.hospital_phones WHERE hospital_id = 'E1B4C932-842B-4BC2-9B7C-D3F28591A001')
BEGIN
    INSERT INTO dbo.hospital_phones (hospital_id, phone) VALUES ('E1B4C932-842B-4BC2-9B7C-D3F28591A001', '+20 2 2482 1800');
END;

-- Ensure Blood Bank Phone Numbers
IF NOT EXISTS (SELECT 1 FROM dbo.blood_bank_phones WHERE blood_bank_id = '07397940-37A5-49A2-992D-3F2992660C9C')
BEGIN
    INSERT INTO dbo.blood_bank_phones (blood_bank_id, phone) VALUES ('07397940-37A5-49A2-992D-3F2992660C9C', '+20 2 3761 1111');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.blood_bank_phones WHERE blood_bank_id = 'B2A5C911-381A-421F-811A-B1479831B002')
BEGIN
    INSERT INTO dbo.blood_bank_phones (blood_bank_id, phone) VALUES ('B2A5C911-381A-421F-811A-B1479831B002', '+20 2 2342 5555');
END;
GO

-- 5. Link Users to their proper Hospitals & Blood Banks
UPDATE dbo.users
SET hospital_id = '8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9'
WHERE email IN ('hospital@lifelink.dev', 'medicallead@lifelink.dev');

UPDATE dbo.users
SET blood_bank_id = '07397940-37A5-49A2-992D-3F2992660C9C'
WHERE email IN ('bloodbank@lifelink.dev', 'labtech@lifelink.dev');
PRINT 'Linked users to hospitals and blood banks';
GO

-- 5b. Seed Baseline Clinical Donor & Donation (to satisfy donation_id FK if required)
DECLARE @donorUserId UNIQUEIDENTIFIER;
SELECT TOP 1 @donorUserId = user_id FROM dbo.users WHERE email IN ('donor@lifelink.dev', 'user@lifelink.dev');
IF @donorUserId IS NULL SELECT TOP 1 @donorUserId = user_id FROM dbo.users;

DECLARE @donorId UNIQUEIDENTIFIER = 'C0000000-0000-0000-0000-000000000001';
IF @donorUserId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.donors WHERE donor_id = @donorId OR user_id = @donorUserId)
    BEGIN
        INSERT INTO dbo.donors (donor_id, user_id, blood_type, date_of_birth, governorate, eligibility_status)
        VALUES (@donorId, @donorUserId, 'O-', '1995-04-12', N'Cairo', 'eligible');
        PRINT 'Inserted baseline clinical donor';
    END
    ELSE
    BEGIN
        SELECT TOP 1 @donorId = donor_id FROM dbo.donors WHERE user_id = @donorUserId;
    END;
END;

DECLARE @donationId UNIQUEIDENTIFIER = 'D0000000-0000-0000-0000-000000000001';
IF @donorId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.donations WHERE donation_id = @donationId)
    BEGIN
        INSERT INTO dbo.donations (donation_id, blood_type, quantity, donation_date, status, created_at, donor_id, blood_bank_id)
        VALUES (@donationId, 'O-', 450.00, '2026-08-28', 'completed', SYSUTCDATETIME(), @donorId, '07397940-37A5-49A2-992D-3F2992660C9C');
        PRINT 'Inserted baseline clinical donation';
    END;
END;
GO

-- 6. Seed Realistic Blood Bags into National Blood Transfusion Center
-- Note: Uses valid GUIDs for blood_bag_id to support UNIQUEIDENTIFIER columns seamlessly
DECLARE @bbId UNIQUEIDENTIFIER = '07397940-37A5-49A2-992D-3F2992660C9C';
DECLARE @donId UNIQUEIDENTIFIER;
SELECT TOP 1 @donId = donation_id FROM dbo.donations WHERE donation_id = 'D0000000-0000-0000-0000-000000000001';
IF @donId IS NULL SELECT TOP 1 @donId = donation_id FROM dbo.donations;

MERGE INTO dbo.blood_bags AS target
USING (VALUES
    -- O- (Universal Donor - Red Cells, Platelets, Whole Blood)
    (CAST('A0000000-0000-0000-0000-000000000142' AS UNIQUEIDENTIFIER), 'O-', 1, '2026-08-28T10:15:00+03:00', '2026-10-09T10:15:00+03:00', 'UNT-O-NEG-0142', 'available', 'Fridge A — Shelf 2', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000143' AS UNIQUEIDENTIFIER), 'O-', 1, '2026-08-29T11:00:00+03:00', '2026-10-10T11:00:00+03:00', 'UNT-O-NEG-0143', 'available', 'Fridge A — Shelf 2', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000144' AS UNIQUEIDENTIFIER), 'O-', 1, '2026-09-12T08:30:00+03:00', '2026-09-17T08:30:00+03:00', 'UNT-O-NEG-0144', 'available', 'Agitator 1 — Shelf 1', 'platelets', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000145' AS UNIQUEIDENTIFIER), 'O-', 1, '2026-09-01T14:00:00+03:00', '2026-10-06T14:00:00+03:00', 'UNT-O-NEG-0145', 'available', 'Fridge A — Shelf 3', 'whole_blood', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000146' AS UNIQUEIDENTIFIER), 'O-', 1, '2026-08-15T09:00:00+03:00', '2027-08-15T09:00:00+03:00', 'UNT-O-NEG-0146', 'available', 'Deep Freezer B (-30C)', 'fresh_frozen_plasma', @bbId, @donId),

    -- O+ (High Demand)
    (CAST('A0000000-0000-0000-0000-000000000210' AS UNIQUEIDENTIFIER), 'O+', 1, '2026-08-30T10:00:00+03:00', '2026-10-11T10:00:00+03:00', 'UNT-O-POS-0210', 'available', 'Fridge B — Shelf 1', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000211' AS UNIQUEIDENTIFIER), 'O+', 1, '2026-08-30T10:30:00+03:00', '2026-10-11T10:30:00+03:00', 'UNT-O-POS-0211', 'available', 'Fridge B — Shelf 1', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000212' AS UNIQUEIDENTIFIER), 'O+', 1, '2026-09-13T09:15:00+03:00', '2026-09-18T09:15:00+03:00', 'UNT-O-POS-0212', 'available', 'Agitator 1 — Shelf 2', 'platelets', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000213' AS UNIQUEIDENTIFIER), 'O+', 1, '2026-08-20T12:00:00+03:00', '2027-08-20T12:00:00+03:00', 'UNT-O-POS-0213', 'available', 'Deep Freezer B (-30C)', 'fresh_frozen_plasma', @bbId, @donId),

    -- A+
    (CAST('A0000000-0000-0000-0000-000000000301' AS UNIQUEIDENTIFIER), 'A+', 1, '2026-09-02T08:45:00+03:00', '2026-10-14T08:45:00+03:00', 'UNT-A-POS-0301', 'available', 'Fridge C — Shelf 1', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000302' AS UNIQUEIDENTIFIER), 'A+', 1, '2026-09-02T09:15:00+03:00', '2026-10-14T09:15:00+03:00', 'UNT-A-POS-0302', 'available', 'Fridge C — Shelf 1', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000303' AS UNIQUEIDENTIFIER), 'A+', 1, '2026-09-14T11:00:00+03:00', '2026-09-19T11:00:00+03:00', 'UNT-A-POS-0303', 'available', 'Agitator 2 — Shelf 1', 'platelets', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000304' AS UNIQUEIDENTIFIER), 'A+', 1, '2026-08-25T15:00:00+03:00', '2027-08-25T15:00:00+03:00', 'UNT-A-POS-0304', 'available', 'Deep Freezer A (-30C)', 'fresh_frozen_plasma', @bbId, @donId),

    -- A-
    (CAST('A0000000-0000-0000-0000-000000000401' AS UNIQUEIDENTIFIER), 'A-', 1, '2026-08-27T10:00:00+03:00', '2026-10-08T10:00:00+03:00', 'UNT-A-NEG-0401', 'available', 'Fridge C — Shelf 3', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000402' AS UNIQUEIDENTIFIER), 'A-', 1, '2026-08-20T16:00:00+03:00', '2027-08-20T16:00:00+03:00', 'UNT-A-NEG-0402', 'available', 'Deep Freezer A (-30C)', 'fresh_frozen_plasma', @bbId, @donId),

    -- B+
    (CAST('A0000000-0000-0000-0000-000000000501' AS UNIQUEIDENTIFIER), 'B+', 1, '2026-09-05T10:20:00+03:00', '2026-10-17T10:20:00+03:00', 'UNT-B-POS-0501', 'available', 'Fridge D — Shelf 1', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000502' AS UNIQUEIDENTIFIER), 'B+', 1, '2026-09-13T12:30:00+03:00', '2026-09-18T12:30:00+03:00', 'UNT-B-POS-0502', 'available', 'Agitator 2 — Shelf 2', 'platelets', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000503' AS UNIQUEIDENTIFIER), 'B+', 1, '2026-08-10T14:00:00+03:00', '2027-08-10T14:00:00+03:00', 'UNT-B-POS-0503', 'available', 'Deep Freezer C (-30C)', 'cryoprecipitate', @bbId, @donId),

    -- B-
    (CAST('A0000000-0000-0000-0000-000000000601' AS UNIQUEIDENTIFIER), 'B-', 1, '2026-08-26T09:30:00+03:00', '2026-10-07T09:30:00+03:00', 'UNT-B-NEG-0601', 'available', 'Fridge D — Shelf 2', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000602' AS UNIQUEIDENTIFIER), 'B-', 1, '2026-08-18T11:00:00+03:00', '2027-08-18T11:00:00+03:00', 'UNT-B-NEG-0602', 'available', 'Deep Freezer C (-30C)', 'fresh_frozen_plasma', @bbId, @donId),

    -- AB+ (Universal Plasma Donor)
    (CAST('A0000000-0000-0000-0000-000000000701' AS UNIQUEIDENTIFIER), 'AB+', 1, '2026-09-04T13:00:00+03:00', '2026-10-16T13:00:00+03:00', 'UNT-AB-POS-0701', 'available', 'Fridge E — Shelf 1', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000702' AS UNIQUEIDENTIFIER), 'AB+', 1, '2026-08-22T10:00:00+03:00', '2027-08-22T10:00:00+03:00', 'UNT-AB-POS-0702', 'available', 'Deep Freezer B (-30C)', 'fresh_frozen_plasma', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000703' AS UNIQUEIDENTIFIER), 'AB+', 1, '2026-09-14T09:00:00+03:00', '2026-09-19T09:00:00+03:00', 'UNT-AB-POS-0703', 'available', 'Agitator 1 — Shelf 3', 'platelets', @bbId, @donId),

    -- AB-
    (CAST('A0000000-0000-0000-0000-000000000801' AS UNIQUEIDENTIFIER), 'AB-', 1, '2026-08-24T11:45:00+03:00', '2026-10-05T11:45:00+03:00', 'UNT-AB-NEG-0801', 'available', 'Fridge E — Shelf 2', 'red_cells', @bbId, @donId),
    (CAST('A0000000-0000-0000-0000-000000000802' AS UNIQUEIDENTIFIER), 'AB-', 1, '2026-08-15T15:30:00+03:00', '2027-08-15T15:30:00+03:00', 'UNT-AB-NEG-0802', 'available', 'Deep Freezer B (-30C)', 'fresh_frozen_plasma', @bbId, @donId)
) AS source (blood_bag_id, blood_type, quantity, collection_date, expiry_date, qr_code, status, current_location, component, current_blood_bank_id, donation_id)
ON target.blood_bag_id = source.blood_bag_id
WHEN NOT MATCHED THEN
    INSERT (blood_bag_id, blood_type, quantity, collection_date, expiry_date, qr_code, status, current_location, component, current_blood_bank_id, donation_id, created_at)
    VALUES (source.blood_bag_id, source.blood_type, source.quantity, source.collection_date, source.expiry_date, source.qr_code, source.status, source.current_location, source.component, source.current_blood_bank_id, source.donation_id, SYSUTCDATETIME());
PRINT 'Seeded realistic blood bags';
GO

-- 7. Seed Realistic Blood Requests
DECLARE @hospId UNIQUEIDENTIFIER = '8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9';
DECLARE @userId UNIQUEIDENTIFIER;
SELECT TOP 1 @userId = user_id FROM dbo.users WHERE email = 'hospital@lifelink.dev';
IF @userId IS NULL SELECT TOP 1 @userId = user_id FROM dbo.users;

MERGE INTO dbo.blood_requests AS target
USING (VALUES
    (CAST('B0000000-0000-0000-0000-000000000801' AS UNIQUEIDENTIFIER), 'O-', 3, 'urgent', N'Emergency: Massive GI hemorrhage in Trauma Resuscitation Bay 2', 'requested', 'red_cells', 650.00, 1950.00, @hospId, @userId, DATEADD(hour, 4, SYSUTCDATETIME()), DATEADD(minute, -45, SYSUTCDATETIME())),
    (CAST('B0000000-0000-0000-0000-000000000802' AS UNIQUEIDENTIFIER), 'A+', 2, 'normal', N'Scheduled CABG open-heart surgery for cardiac operating room 3', 'acknowledged', 'red_cells', 550.00, 1100.00, @hospId, @userId, DATEADD(day, 1, SYSUTCDATETIME()), DATEADD(hour, -3, SYSUTCDATETIME())),
    (CAST('B0000000-0000-0000-0000-000000000803' AS UNIQUEIDENTIFIER), 'B+', 4, 'urgent', N'Hematology ICU: Acute leukemia patient with severe thrombocytopenia (platelet count < 10k)', 'prepared', 'platelets', 850.00, 3400.00, @hospId, @userId, DATEADD(hour, 8, SYSUTCDATETIME()), DATEADD(hour, -6, SYSUTCDATETIME())),
    (CAST('B0000000-0000-0000-0000-000000000804' AS UNIQUEIDENTIFIER), 'AB-', 2, 'normal', N'Surgical ICU: Complex orthopedic pelvic reconstruction', 'completed', 'fresh_frozen_plasma', 500.00, 1000.00, @hospId, @userId, DATEADD(day, -1, SYSUTCDATETIME()), DATEADD(day, -2, SYSUTCDATETIME()))
) AS source (blood_request_id, blood_type, requested_quantity, urgency, reason, status, component, unit_price, total_amount, hospital_id, created_by_user_id, required_by, created_at)
ON target.blood_request_id = source.blood_request_id
WHEN NOT MATCHED THEN
    INSERT (blood_request_id, blood_type, requested_quantity, urgency, reason, status, component, unit_price, total_amount, hospital_id, created_by_user_id, required_by, created_at)
    VALUES (source.blood_request_id, source.blood_type, source.requested_quantity, source.urgency, source.reason, source.status, source.component, source.unit_price, source.total_amount, source.hospital_id, source.created_by_user_id, source.required_by, source.created_at);
PRINT 'Seeded realistic clinical blood requests';
GO

-- 8. Record migration in schema_migrations
IF OBJECT_ID('dbo.schema_migrations') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.schema_migrations WHERE migration_id = '012_seed_realistic_clinical_data')
    BEGIN
        INSERT INTO dbo.schema_migrations (migration_id, applied_at)
        VALUES ('012_seed_realistic_clinical_data', SYSUTCDATETIME());
        PRINT 'Recorded migration 012 in schema_migrations';
    END;
END;
GO
