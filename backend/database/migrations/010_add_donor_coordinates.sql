/*
    Life Link - Migration 010
    Add GPS Coordinates (latitude, longitude) to donors table for distance calculation & donor matching:
    - latitude: DECIMAL(9, 6) NULL (valid range: -90.000000 to +90.000000)
    - longitude: DECIMAL(9, 6) NULL (valid range: -180.000000 to +180.000000)

    Target: Microsoft SQL Server 2016+ / Azure SQL Database
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Add latitude column to dbo.donors if not present
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.donors') 
      AND name = 'latitude'
)
BEGIN
    PRINT '>>> Adding latitude column to dbo.donors...';

    ALTER TABLE dbo.donors 
    ADD latitude NUMERIC(9, 6) NULL;

    PRINT '>>> Column latitude added successfully.';
END
ELSE
BEGIN
    PRINT '>>> Column latitude already exists in dbo.donors.';
END
GO

-- 2. Add longitude column to dbo.donors if not present
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.donors') 
      AND name = 'longitude'
)
BEGIN
    PRINT '>>> Adding longitude column to dbo.donors...';

    ALTER TABLE dbo.donors 
    ADD longitude NUMERIC(9, 6) NULL;

    PRINT '>>> Column longitude added successfully.';
END
ELSE
BEGIN
    PRINT '>>> Column longitude already exists in dbo.donors.';
END
GO

-- 3. Record migration in schema_migrations if table exists
IF OBJECT_ID('dbo.schema_migrations') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.schema_migrations WHERE migration_id = '010_add_donor_coordinates')
    BEGIN
        INSERT INTO dbo.schema_migrations (migration_id, applied_at)
        VALUES ('010_add_donor_coordinates', SYSUTCDATETIME());
        PRINT '>>> Migration 010 recorded in dbo.schema_migrations.';
    END
END
GO
