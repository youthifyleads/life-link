/*
    Life Link - Migration: 013_donation_voucher_lifecycle
    Converted from Alembic: backend/alembic/versions/0003_donation_voucher_lifecycle.py
    
    Target: Microsoft SQL Server 2016+ / Azure SQL Database
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

BEGIN TRANSACTION;
BEGIN TRY

    -- =========================================================================
    -- 1. Rename legacy columns (voucher_id -> id) and (voucher_number -> code)
    -- =========================================================================
    IF EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.donation_vouchers') AND name = 'voucher_id'
    )
    BEGIN
        EXEC sp_rename 'dbo.donation_vouchers.voucher_id', 'id', 'COLUMN';
        PRINT '>>> Renamed voucher_id to id';
    END;

    IF EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.donation_vouchers') AND name = 'voucher_number'
    )
    BEGIN
        EXEC sp_rename 'dbo.donation_vouchers.voucher_number', 'code', 'COLUMN';
        PRINT '>>> Renamed voucher_number to code';
    END;

    -- =========================================================================
    -- 2. Drop legacy constraints if present
    -- =========================================================================
    IF EXISTS (
        SELECT 1 FROM sys.check_constraints 
        WHERE name = 'ck_donation_vouchers_status' 
          AND parent_object_id = OBJECT_ID('dbo.donation_vouchers')
    )
    BEGIN
        ALTER TABLE dbo.donation_vouchers DROP CONSTRAINT ck_donation_vouchers_status;
        PRINT '>>> Dropped legacy ck_donation_vouchers_status constraint';
    END;

    IF EXISTS (
        SELECT 1 FROM sys.key_constraints 
        WHERE name = 'uq_donation_vouchers_number' 
          AND parent_object_id = OBJECT_ID('dbo.donation_vouchers')
    )
    BEGIN
        ALTER TABLE dbo.donation_vouchers DROP CONSTRAINT uq_donation_vouchers_number;
        PRINT '>>> Dropped legacy uq_donation_vouchers_number constraint';
    END;

    -- =========================================================================
    -- 3. Add donor_id as UNIQUEIDENTIFIER (matching dbo.donors.donor_id)
    -- =========================================================================
    IF EXISTS (
        SELECT 1 FROM sys.columns c
        JOIN sys.types t ON c.user_type_id = t.user_type_id
        WHERE c.object_id = OBJECT_ID('dbo.donation_vouchers') 
          AND c.name = 'donor_id' 
          AND t.name <> 'uniqueidentifier'
    )
    BEGIN
        ALTER TABLE dbo.donation_vouchers DROP COLUMN donor_id;
        PRINT '>>> Dropped old invalid donor_id column';
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.donation_vouchers') AND name = 'donor_id'
    )
    BEGIN
        ALTER TABLE dbo.donation_vouchers ADD donor_id UNIQUEIDENTIFIER NULL;
        PRINT '>>> Added column donor_id as UNIQUEIDENTIFIER';

        -- Populate donor_id from donations table
        EXEC sys.sp_executesql N'UPDATE dv 
              SET dv.donor_id = d.donor_id 
              FROM dbo.donation_vouchers dv 
              INNER JOIN dbo.donations d ON d.donation_id = dv.donation_id';
        PRINT '>>> Populated donor_id from donations table';

        -- Set to NOT NULL
        ALTER TABLE dbo.donation_vouchers ALTER COLUMN donor_id UNIQUEIDENTIFIER NOT NULL;
        PRINT '>>> Altered donor_id to NOT NULL';

        -- Create foreign key to dbo.donors
        ALTER TABLE dbo.donation_vouchers 
        ADD CONSTRAINT fk_donation_vouchers_donor_id 
        FOREIGN KEY (donor_id) REFERENCES dbo.donors(donor_id);
        PRINT '>>> Created foreign key fk_donation_vouchers_donor_id';
    END;

    -- =========================================================================
    -- 4. Add partner_id as UNIQUEIDENTIFIER (matching dbo.users.user_id)
    -- =========================================================================
    IF EXISTS (
        SELECT 1 FROM sys.columns c
        JOIN sys.types t ON c.user_type_id = t.user_type_id
        WHERE c.object_id = OBJECT_ID('dbo.donation_vouchers') 
          AND c.name = 'partner_id' 
          AND t.name <> 'uniqueidentifier'
    )
    BEGIN
        ALTER TABLE dbo.donation_vouchers DROP COLUMN partner_id;
        PRINT '>>> Dropped old invalid partner_id column';
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.donation_vouchers') AND name = 'partner_id'
    )
    BEGIN
        ALTER TABLE dbo.donation_vouchers ADD partner_id UNIQUEIDENTIFIER NULL;
        
        ALTER TABLE dbo.donation_vouchers 
        ADD CONSTRAINT fk_donation_vouchers_partner_id 
        FOREIGN KEY (partner_id) REFERENCES dbo.users(user_id);
        PRINT '>>> Added column partner_id and fk_donation_vouchers_partner_id';
    END;

    -- =========================================================================
    -- 5. Add value column (numeric monetary amount)
    -- =========================================================================
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.donation_vouchers') AND name = 'value'
    )
    BEGIN
        ALTER TABLE dbo.donation_vouchers 
        ADD value NUMERIC(12, 2) NOT NULL CONSTRAINT DF_donation_vouchers_value DEFAULT 0;
        PRINT '>>> Added column value';
    END;

    -- =========================================================================
    -- 6. Add expires_at and default to 90 days from issued_at
    -- =========================================================================
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.donation_vouchers') AND name = 'expires_at'
    )
    BEGIN
        ALTER TABLE dbo.donation_vouchers ADD expires_at DATETIMEOFFSET NULL;

        EXEC sys.sp_executesql N'UPDATE dbo.donation_vouchers SET expires_at = DATEADD(day, 90, issued_at)';
        
        ALTER TABLE dbo.donation_vouchers ALTER COLUMN expires_at DATETIMEOFFSET NOT NULL;
        PRINT '>>> Added expires_at and populated with 90-day expiry';
    END;

    -- =========================================================================
    -- 7. Normalize legacy status values to ACTIVE
    -- =========================================================================
    UPDATE dbo.donation_vouchers 
    SET status = CASE 
        WHEN UPPER(status) IN ('ISSUED', 'ACTIVE') THEN 'ACTIVE' 
        ELSE UPPER(status) 
    END;
    PRINT '>>> Normalized status to ACTIVE';

    -- =========================================================================
    -- 8. Add redeemed_at and transaction_reference
    -- =========================================================================
    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.donation_vouchers') AND name = 'redeemed_at'
    )
    BEGIN
        ALTER TABLE dbo.donation_vouchers ADD redeemed_at DATETIMEOFFSET NULL;
        PRINT '>>> Added column redeemed_at';
    END;

    IF NOT EXISTS (
        SELECT 1 FROM sys.columns 
        WHERE object_id = OBJECT_ID('dbo.donation_vouchers') AND name = 'transaction_reference'
    )
    BEGIN
        ALTER TABLE dbo.donation_vouchers ADD transaction_reference VARCHAR(100) NULL;

        ALTER TABLE dbo.donation_vouchers 
        ADD CONSTRAINT uq_donation_vouchers_transaction_reference 
        UNIQUE (transaction_reference);
        PRINT '>>> Added column transaction_reference with UNIQUE constraint';
    END;

    -- =========================================================================
    -- 9. Create indexes
    -- =========================================================================
    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_donation_vouchers_code' AND object_id = OBJECT_ID('dbo.donation_vouchers'))
    BEGIN
        CREATE UNIQUE INDEX ix_donation_vouchers_code ON dbo.donation_vouchers(code);
        PRINT '>>> Created index ix_donation_vouchers_code';
    END;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_donation_vouchers_donor_id' AND object_id = OBJECT_ID('dbo.donation_vouchers'))
    BEGIN
        CREATE INDEX ix_donation_vouchers_donor_id ON dbo.donation_vouchers(donor_id);
        PRINT '>>> Created index ix_donation_vouchers_donor_id';
    END;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_donation_vouchers_status' AND object_id = OBJECT_ID('dbo.donation_vouchers'))
    BEGIN
        CREATE INDEX ix_donation_vouchers_status ON dbo.donation_vouchers(status);
        PRINT '>>> Created index ix_donation_vouchers_status';
    END;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_donation_vouchers_expires_at' AND object_id = OBJECT_ID('dbo.donation_vouchers'))
    BEGIN
        CREATE INDEX ix_donation_vouchers_expires_at ON dbo.donation_vouchers(expires_at);
        PRINT '>>> Created index ix_donation_vouchers_expires_at';
    END;

    -- =========================================================================
    -- 10. Record migration in schema_migrations if available
    -- =========================================================================
    IF OBJECT_ID('dbo.schema_migrations') IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM dbo.schema_migrations WHERE migration_id = '0003_donation_voucher_lifecycle')
        BEGIN
            INSERT INTO dbo.schema_migrations (migration_id, applied_at)
            VALUES ('0003_donation_voucher_lifecycle', SYSUTCDATETIME());
            PRINT '>>> Recorded in schema_migrations';
        END;
    END;

    COMMIT TRANSACTION;
    PRINT '>>> Migration 013_donation_voucher_lifecycle completed successfully!';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    PRINT '!!! Error occurred during migration: ' + ERROR_MESSAGE();
    THROW;
END CATCH;
GO
