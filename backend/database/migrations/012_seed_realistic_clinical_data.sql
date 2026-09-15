/*
    Life Link - Migration 012
    Add missing columns and seed realistic clinical data:
    - Hospitals (Al-Qasr Al-Aini, Ain Shams)
    - Blood Banks (National Blood Transfusion Center, Abbasiya)
    - User institution linkages
    - Realistic blood bags (25+ units covering all blood groups & components)
    - Realistic clinical blood requests (urgent ER, surgery, ICU requisitions)

    Target: Microsoft SQL Server 2016+ / Azure SQL Database
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Ensure columns exist on blood_bags table
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

-- 2. Ensure columns exist on blood_requests table
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.blood_requests') AND name = 'component')
BEGIN
    ALTER TABLE dbo.blood_requests ADD component VARCHAR(50) NULL CONSTRAINT DF_blood_requests_component DEFAULT 'red_cells';
    PRINT 'Added blood_requests.component';
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

IF NOT EXISTS (SELECT 1 FROM dbo.hospital_phones WHERE hospital_id = '8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9')
BEGIN
    INSERT INTO dbo.hospital_phones (hospital_id, phone)
    VALUES ('8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9', '+20 2 2365 4000');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.hospitals WHERE hospital_id = 'E1B4C932-842B-4BC2-9B7C-D3F28591A001')
BEGIN
    INSERT INTO dbo.hospitals (hospital_id, name, governorate, address, status, latitude, longitude)
    VALUES ('E1B4C932-842B-4BC2-9B7C-D3F28591A001', N'Ain Shams University Specialized Hospital', N'Cairo', N'Abbassiya, Cairo Governorate', 'active', 30.0768, 31.2854);
    PRINT 'Inserted Ain Shams University Specialized Hospital';
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.hospital_phones WHERE hospital_id = 'E1B4C932-842B-4BC2-9B7C-D3F28591A001')
BEGIN
    INSERT INTO dbo.hospital_phones (hospital_id, phone)
    VALUES ('E1B4C932-842B-4BC2-9B7C-D3F28591A001', '+20 2 2482 1000');
END;
GO

-- 4. Seed Blood Banks
IF NOT EXISTS (SELECT 1 FROM dbo.blood_banks WHERE blood_bank_id = '07397940-37A5-49A2-992D-3F2992660C9C')
BEGIN
    INSERT INTO dbo.blood_banks (blood_bank_id, name, governorate, address, status)
    VALUES ('07397940-37A5-49A2-992D-3F2992660C9C', N'National Blood Transfusion Center', N'Giza', N'51 Wezaret El-Zeraa St, Agouza, Giza', 'active');
    PRINT 'Inserted National Blood Transfusion Center';
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blood_bank_phones WHERE blood_bank_id = '07397940-37A5-49A2-992D-3F2992660C9C')
BEGIN
    INSERT INTO dbo.blood_bank_phones (blood_bank_id, phone)
    VALUES ('07397940-37A5-49A2-992D-3F2992660C9C', '+20 2 3761 1111');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blood_banks WHERE blood_bank_id = 'B2A5C911-381A-421F-811A-B1479831B002')
BEGIN
    INSERT INTO dbo.blood_banks (blood_bank_id, name, governorate, address, status)
    VALUES ('B2A5C911-381A-421F-811A-B1479831B002', N'Abbasiya Regional Blood Center', N'Cairo', N'Sekket El-Wayly, Abbasiya, Cairo', 'active');
    PRINT 'Inserted Abbasiya Regional Blood Center';
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blood_bank_phones WHERE blood_bank_id = 'B2A5C911-381A-421F-811A-B1479831B002')
BEGIN
    INSERT INTO dbo.blood_bank_phones (blood_bank_id, phone)
    VALUES ('B2A5C911-381A-421F-811A-B1479831B002', '+20 2 2684 2222');
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

-- 6. Seed Realistic Blood Bags into National Blood Transfusion Center
DECLARE @bbId VARCHAR(50) = '07397940-37A5-49A2-992D-3F2992660C9C';

MERGE INTO dbo.blood_bags AS target
USING (VALUES
    -- O- (Universal Donor - Red Cells, Platelets, Whole Blood)
    ('UNT-O-NEG-0142', 'O-', 1, '2026-08-28T10:15:00+03:00', '2026-10-09T10:15:00+03:00', 'LL-BAG-O-NEG-0142', 'available', 'Fridge A — Shelf 2', 'red_cells', @bbId),
    ('UNT-O-NEG-0143', 'O-', 1, '2026-08-29T11:00:00+03:00', '2026-10-10T11:00:00+03:00', 'LL-BAG-O-NEG-0143', 'available', 'Fridge A — Shelf 2', 'red_cells', @bbId),
    ('UNT-O-NEG-0144', 'O-', 1, '2026-09-12T08:30:00+03:00', '2026-09-17T08:30:00+03:00', 'LL-BAG-O-NEG-0144', 'available', 'Agitator 1 — Shelf 1', 'platelets', @bbId),
    ('UNT-O-NEG-0145', 'O-', 1, '2026-09-01T14:00:00+03:00', '2026-10-06T14:00:00+03:00', 'LL-BAG-O-NEG-0145', 'available', 'Fridge A — Shelf 3', 'whole_blood', @bbId),
    ('UNT-O-NEG-0146', 'O-', 1, '2026-08-15T09:00:00+03:00', '2027-08-15T09:00:00+03:00', 'LL-BAG-O-NEG-0146', 'available', 'Deep Freezer B (-30C)', 'fresh_frozen_plasma', @bbId),

    -- O+ (High Demand)
    ('UNT-O-POS-0210', 'O+', 1, '2026-08-30T10:00:00+03:00', '2026-10-11T10:00:00+03:00', 'LL-BAG-O-POS-0210', 'available', 'Fridge B — Shelf 1', 'red_cells', @bbId),
    ('UNT-O-POS-0211', 'O+', 1, '2026-08-30T10:30:00+03:00', '2026-10-11T10:30:00+03:00', 'LL-BAG-O-POS-0211', 'available', 'Fridge B — Shelf 1', 'red_cells', @bbId),
    ('UNT-O-POS-0212', 'O+', 1, '2026-09-13T09:15:00+03:00', '2026-09-18T09:15:00+03:00', 'LL-BAG-O-POS-0212', 'available', 'Agitator 1 — Shelf 2', 'platelets', @bbId),
    ('UNT-O-POS-0213', 'O+', 1, '2026-08-20T12:00:00+03:00', '2027-08-20T12:00:00+03:00', 'LL-BAG-O-POS-0213', 'available', 'Deep Freezer B (-30C)', 'fresh_frozen_plasma', @bbId),

    -- A+
    ('UNT-A-POS-0301', 'A+', 1, '2026-09-02T08:45:00+03:00', '2026-10-14T08:45:00+03:00', 'LL-BAG-A-POS-0301', 'available', 'Fridge C — Shelf 1', 'red_cells', @bbId),
    ('UNT-A-POS-0302', 'A+', 1, '2026-09-02T09:15:00+03:00', '2026-10-14T09:15:00+03:00', 'LL-BAG-A-POS-0302', 'available', 'Fridge C — Shelf 1', 'red_cells', @bbId),
    ('UNT-A-POS-0303', 'A+', 1, '2026-09-14T11:00:00+03:00', '2026-09-19T11:00:00+03:00', 'LL-BAG-A-POS-0303', 'available', 'Agitator 2 — Shelf 1', 'platelets', @bbId),
    ('UNT-A-POS-0304', 'A+', 1, '2026-08-25T15:00:00+03:00', '2027-08-25T15:00:00+03:00', 'LL-BAG-A-POS-0304', 'available', 'Deep Freezer A (-30C)', 'fresh_frozen_plasma', @bbId),

    -- A-
    ('UNT-A-NEG-0401', 'A-', 1, '2026-08-27T10:00:00+03:00', '2026-10-08T10:00:00+03:00', 'LL-BAG-A-NEG-0401', 'available', 'Fridge C — Shelf 3', 'red_cells', @bbId),
    ('UNT-A-NEG-0402', 'A-', 1, '2026-08-20T16:00:00+03:00', '2027-08-20T16:00:00+03:00', 'LL-BAG-A-NEG-0402', 'available', 'Deep Freezer A (-30C)', 'fresh_frozen_plasma', @bbId),

    -- B+
    ('UNT-B-POS-0501', 'B+', 1, '2026-09-05T10:20:00+03:00', '2026-10-17T10:20:00+03:00', 'LL-BAG-B-POS-0501', 'available', 'Fridge D — Shelf 1', 'red_cells', @bbId),
    ('UNT-B-POS-0502', 'B+', 1, '2026-09-13T12:30:00+03:00', '2026-09-18T12:30:00+03:00', 'LL-BAG-B-POS-0502', 'available', 'Agitator 2 — Shelf 2', 'platelets', @bbId),
    ('UNT-B-POS-0503', 'B+', 1, '2026-08-10T14:00:00+03:00', '2027-08-10T14:00:00+03:00', 'LL-BAG-B-POS-0503', 'available', 'Deep Freezer C (-30C)', 'cryoprecipitate', @bbId),

    -- B-
    ('UNT-B-NEG-0601', 'B-', 1, '2026-08-26T09:30:00+03:00', '2026-10-07T09:30:00+03:00', 'LL-BAG-B-NEG-0601', 'available', 'Fridge D — Shelf 2', 'red_cells', @bbId),
    ('UNT-B-NEG-0602', 'B-', 1, '2026-08-18T11:00:00+03:00', '2027-08-18T11:00:00+03:00', 'LL-BAG-B-NEG-0602', 'available', 'Deep Freezer C (-30C)', 'fresh_frozen_plasma', @bbId),

    -- AB+ (Universal Plasma Donor)
    ('UNT-AB-POS-0701', 'AB+', 1, '2026-09-04T13:00:00+03:00', '2026-10-16T13:00:00+03:00', 'LL-BAG-AB-POS-0701', 'available', 'Fridge E — Shelf 1', 'red_cells', @bbId),
    ('UNT-AB-POS-0702', 'AB+', 1, '2026-08-22T10:00:00+03:00', '2027-08-22T10:00:00+03:00', 'LL-BAG-AB-POS-0702', 'available', 'Deep Freezer B (-30C)', 'fresh_frozen_plasma', @bbId),
    ('UNT-AB-POS-0703', 'AB+', 1, '2026-09-14T09:00:00+03:00', '2026-09-19T09:00:00+03:00', 'LL-BAG-AB-POS-0703', 'available', 'Agitator 1 — Shelf 3', 'platelets', @bbId),

    -- AB-
    ('UNT-AB-NEG-0801', 'AB-', 1, '2026-08-24T11:45:00+03:00', '2026-10-05T11:45:00+03:00', 'LL-BAG-AB-NEG-0801', 'available', 'Fridge E — Shelf 2', 'red_cells', @bbId),
    ('UNT-AB-NEG-0802', 'AB-', 1, '2026-08-15T15:30:00+03:00', '2027-08-15T15:30:00+03:00', 'LL-BAG-AB-NEG-0802', 'available', 'Deep Freezer B (-30C)', 'fresh_frozen_plasma', @bbId)
) AS source (blood_bag_id, blood_type, quantity, collection_date, expiry_date, qr_code, status, current_location, component, current_blood_bank_id)
ON target.blood_bag_id = source.blood_bag_id
WHEN NOT MATCHED THEN
    INSERT (blood_bag_id, blood_type, quantity, collection_date, expiry_date, qr_code, status, current_location, component, current_blood_bank_id, created_at)
    VALUES (source.blood_bag_id, source.blood_type, source.quantity, source.collection_date, source.expiry_date, source.qr_code, source.status, source.current_location, source.component, source.current_blood_bank_id, SYSUTCDATETIME());
PRINT 'Seeded realistic blood bags';
GO

-- 7. Seed Realistic Blood Requests
DECLARE @hospId VARCHAR(50) = '8F7601FE-35C2-426F-AB9D-E36D3DAA1CB9';
DECLARE @userId VARCHAR(50);
SELECT TOP 1 @userId = user_id FROM dbo.users WHERE email = 'hospital@lifelink.dev';
IF @userId IS NULL SELECT TOP 1 @userId = user_id FROM dbo.users;

MERGE INTO dbo.blood_requests AS target
USING (VALUES
    ('REQ-2026-0801', 'O-', 3, 'urgent', N'Emergency: Massive GI hemorrhage in Trauma Resuscitation Bay 2', 'requested', 'red_cells', 650.00, @hospId, @userId, DATEADD(hour, 4, SYSUTCDATETIME()), DATEADD(minute, -45, SYSUTCDATETIME())),
    ('REQ-2026-0802', 'A+', 2, 'normal', N'Scheduled CABG open-heart surgery for cardiac operating room 3', 'acknowledged', 'red_cells', 550.00, @hospId, @userId, DATEADD(day, 1, SYSUTCDATETIME()), DATEADD(hour, -3, SYSUTCDATETIME())),
    ('REQ-2026-0803', 'B+', 4, 'urgent', N'Hematology ICU: Acute leukemia patient with severe thrombocytopenia (platelet count < 10k)', 'prepared', 'platelets', 850.00, @hospId, @userId, DATEADD(hour, 8, SYSUTCDATETIME()), DATEADD(hour, -6, SYSUTCDATETIME())),
    ('REQ-2026-0804', 'AB-', 2, 'normal', N'Surgical ICU: Complex orthopedic pelvic reconstruction', 'completed', 'fresh_frozen_plasma', 500.00, @hospId, @userId, DATEADD(day, -1, SYSUTCDATETIME()), DATEADD(day, -2, SYSUTCDATETIME()))
) AS source (blood_request_id, blood_type, requested_quantity, urgency, reason, status, component, unit_price, hospital_id, created_by_user_id, required_by, created_at)
ON target.blood_request_id = source.blood_request_id
WHEN NOT MATCHED THEN
    INSERT (blood_request_id, blood_type, requested_quantity, urgency, reason, status, component, unit_price, hospital_id, created_by_user_id, required_by, created_at)
    VALUES (source.blood_request_id, source.blood_type, source.requested_quantity, source.urgency, source.reason, source.status, source.component, source.unit_price, source.hospital_id, source.created_by_user_id, source.required_by, source.created_at);
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
