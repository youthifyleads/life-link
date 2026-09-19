/*
    Life Link - Migration 007
    1. Add unit_price to request_allocations (discrete bag pricing)
    2. Drop 1:1 UNIQUE constraint on payments.blood_request_id to allow payment retries
    3. Add ix_payments_blood_request_id for query performance
    4. Add ux_payments_single_paid_per_request to ensure at most one successful (paid) payment per request

    Target: Microsoft SQL Server 2016+ / Azure SQL Database
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Add unit_price column to dbo.request_allocations
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.request_allocations') 
      AND name = 'unit_price'
)
BEGIN
    PRINT '>>> Adding unit_price column to dbo.request_allocations...';

    ALTER TABLE dbo.request_allocations 
    ADD unit_price NUMERIC(10, 2) NOT NULL 
    CONSTRAINT df_request_allocations_unit_price DEFAULT 0.00;

    PRINT '>>> Column unit_price created successfully.';
END
ELSE
BEGIN
    PRINT '>>> Column unit_price already exists in dbo.request_allocations.';
END
GO

-- 2. Drop 1:1 UNIQUE constraint on payments.blood_request_id if present
DECLARE @ConstraintName NVARCHAR(200);
SELECT @ConstraintName = name 
FROM sys.key_constraints 
WHERE parent_object_id = OBJECT_ID('dbo.payments') 
  AND [type] = 'UQ' 
  AND name LIKE '%blood_request%';

IF @ConstraintName IS NOT NULL
BEGIN
    PRINT '>>> Dropping unique constraint ' + @ConstraintName + ' on dbo.payments...';
    EXEC('ALTER TABLE dbo.payments DROP CONSTRAINT ' + @ConstraintName);
    PRINT '>>> Unique constraint dropped successfully.';
END
ELSE
BEGIN
    PRINT '>>> No unique constraint on blood_request_id found on dbo.payments.';
END
GO

-- 3. Create non-clustered index on payments.blood_request_id
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE object_id = OBJECT_ID('dbo.payments') 
      AND name = 'ix_payments_blood_request_id'
)
BEGIN
    PRINT '>>> Creating index ix_payments_blood_request_id...';

    CREATE NONCLUSTERED INDEX ix_payments_blood_request_id
    ON dbo.payments(blood_request_id);

    PRINT '>>> Index ix_payments_blood_request_id created successfully.';
END
ELSE
BEGIN
    PRINT '>>> Index ix_payments_blood_request_id already exists.';
END
GO

-- 4. Create filtered unique index to enforce at most one successful payment per request
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE object_id = OBJECT_ID('dbo.payments') 
      AND name = 'ux_payments_single_paid_per_request'
)
BEGIN
    PRINT '>>> Creating filtered unique index ux_payments_single_paid_per_request...';

    CREATE UNIQUE NONCLUSTERED INDEX ux_payments_single_paid_per_request
    ON dbo.payments(blood_request_id)
    WHERE payment_status = 'paid';

    PRINT '>>> Filtered index ux_payments_single_paid_per_request created successfully.';
END
ELSE
BEGIN
    PRINT '>>> Filtered unique index ux_payments_single_paid_per_request already exists.';
END
GO

-- 5. Record migration in __SchemaMigrations if table exists
IF OBJECT_ID('dbo.__SchemaMigrations', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM dbo.__SchemaMigrations 
        WHERE migration_id = '007_update_payments_and_allocations_pricing'
    )
    BEGIN
        INSERT INTO dbo.__SchemaMigrations (migration_id, applied_at)
        VALUES ('007_update_payments_and_allocations_pricing', SYSUTCDATETIME());
        PRINT '>>> Migration 007 recorded in __SchemaMigrations.';
    END
END
GO
