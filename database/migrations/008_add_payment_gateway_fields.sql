/*
    Life Link - Migration 008
    Add gateway fields to payments table:
    - currency: standard ISO currency code (defaults to 'EGP')
    - provider: payment gateway identifier (defaults to 'paymob')
    - provider_order_id: upstream gateway order identifier with filtered index

    Target: Microsoft SQL Server 2016+ / Azure SQL Database
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Add currency column if not present
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.payments') 
      AND name = 'currency'
)
BEGIN
    PRINT '>>> Adding currency column to dbo.payments...';

    ALTER TABLE dbo.payments 
    ADD currency VARCHAR(3) NOT NULL 
    CONSTRAINT df_payments_currency DEFAULT 'EGP';

    PRINT '>>> Column currency added successfully.';
END
ELSE
BEGIN
    PRINT '>>> Column currency already exists in dbo.payments.';
END
GO

-- 2. Add provider column if not present
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.payments') 
      AND name = 'provider'
)
BEGIN
    PRINT '>>> Adding provider column to dbo.payments...';

    ALTER TABLE dbo.payments 
    ADD provider VARCHAR(50) NOT NULL 
    CONSTRAINT df_payments_provider DEFAULT 'paymob';

    PRINT '>>> Column provider added successfully.';
END
ELSE
BEGIN
    PRINT '>>> Column provider already exists in dbo.payments.';
END
GO

-- 3. Add provider_order_id column if not present
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.payments') 
      AND name = 'provider_order_id'
)
BEGIN
    PRINT '>>> Adding provider_order_id column to dbo.payments...';

    ALTER TABLE dbo.payments 
    ADD provider_order_id NVARCHAR(100) NULL;

    PRINT '>>> Column provider_order_id added successfully.';
END
ELSE
BEGIN
    PRINT '>>> Column provider_order_id already exists in dbo.payments.';
END
GO

-- 4. Create filtered index on provider_order_id for Webhook lookup performance
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE object_id = OBJECT_ID('dbo.payments') 
      AND name = 'ix_payments_provider_order_id'
)
BEGIN
    PRINT '>>> Creating filtered index ix_payments_provider_order_id...';

    CREATE NONCLUSTERED INDEX ix_payments_provider_order_id
    ON dbo.payments(provider_order_id)
    WHERE provider_order_id IS NOT NULL;

    PRINT '>>> Filtered index ix_payments_provider_order_id created successfully.';
END
ELSE
BEGIN
    PRINT '>>> Index ix_payments_provider_order_id already exists.';
END
GO

-- 5. Record migration in __SchemaMigrations if table exists
IF OBJECT_ID('dbo.__SchemaMigrations', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM dbo.__SchemaMigrations 
        WHERE migration_id = '008_add_payment_gateway_fields'
    )
    BEGIN
        INSERT INTO dbo.__SchemaMigrations (migration_id, applied_at)
        VALUES ('008_add_payment_gateway_fields', SYSUTCDATETIME());
        PRINT '>>> Migration 008 recorded in __SchemaMigrations.';
    END
END
GO
