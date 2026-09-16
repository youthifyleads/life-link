/*
    Life Link - Migration 009
    Add flexible unit pricing to blood_requests table:
    - unit_price: Price per blood unit/bag set dynamically by the blood bank operator

    Target: Microsoft SQL Server 2016+ / Azure SQL Database
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Add unit_price column to dbo.blood_requests if not present
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.blood_requests') 
      AND name = 'unit_price'
)
BEGIN
    PRINT '>>> Adding unit_price column to dbo.blood_requests...';

    ALTER TABLE dbo.blood_requests 
    ADD unit_price NUMERIC(10, 2) NULL;

    PRINT '>>> Column unit_price added successfully.';
END
ELSE
BEGIN
    PRINT '>>> Column unit_price already exists in dbo.blood_requests.';
END
GO

-- 2. Record migration in schema_migrations if table exists
IF OBJECT_ID('dbo.schema_migrations') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.schema_migrations WHERE migration_id = '009_add_blood_request_unit_price')
    BEGIN
        INSERT INTO dbo.schema_migrations (migration_id, applied_at)
        VALUES ('009_add_blood_request_unit_price', SYSUTCDATETIME());
        PRINT '>>> Migration 009 recorded in dbo.schema_migrations.';
    END
END
GO
