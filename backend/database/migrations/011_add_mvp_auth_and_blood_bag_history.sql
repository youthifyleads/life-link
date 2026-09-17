/*
    Life Link - Migration 011
    MVP Authentication Tokens, Push Notification Device Tokens, and Blood Bag Status History.

    Target: Microsoft SQL Server 2016+ / Azure SQL Database
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Add columns to users table
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'date_of_birth')
BEGIN
    ALTER TABLE dbo.users ADD date_of_birth DATE NULL;
    PRINT 'Added users.date_of_birth';
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.users') AND name = 'email_verified')
BEGIN
    ALTER TABLE dbo.users ADD email_verified BIT NOT NULL CONSTRAINT DF_users_email_verified DEFAULT 0;
    PRINT 'Added users.email_verified';
END;
GO

-- 2. Add GPS coordinates to hospitals table
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

-- 3. Add availability status to donors table
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.donors') AND name = 'is_available')
BEGIN
    ALTER TABLE dbo.donors ADD is_available BIT NOT NULL CONSTRAINT DF_donors_is_available DEFAULT 1;
    PRINT 'Added donors.is_available';
END;
GO

-- 4. Create refresh_tokens table (user_id matches UNIQUEIDENTIFIER of users table)
IF OBJECT_ID('dbo.refresh_tokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.refresh_tokens (
        token_id             UNIQUEIDENTIFIER     NOT NULL DEFAULT NEWID(),
        user_id              UNIQUEIDENTIFIER     NOT NULL,
        token_hash           VARCHAR(128)         NOT NULL,
        expires_at           DATETIMEOFFSET       NOT NULL,
        created_at           DATETIMEOFFSET       NOT NULL DEFAULT SYSUTCDATETIME(),
        revoked_at           DATETIMEOFFSET       NULL,
        replaced_by_token_id UNIQUEIDENTIFIER     NULL,
        CONSTRAINT PK_refresh_tokens PRIMARY KEY (token_id),
        CONSTRAINT FK_refresh_tokens_users FOREIGN KEY (user_id) REFERENCES dbo.users (user_id) ON DELETE CASCADE,
        CONSTRAINT UQ_refresh_tokens_hash UNIQUE (token_hash)
    );
    CREATE NONCLUSTERED INDEX IX_refresh_tokens_user_id ON dbo.refresh_tokens(user_id);
    PRINT 'Created table refresh_tokens';
END;
GO

-- 5. Create password_reset_tokens table (user_id matches UNIQUEIDENTIFIER of users table)
IF OBJECT_ID('dbo.password_reset_tokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.password_reset_tokens (
        token_id             UNIQUEIDENTIFIER     NOT NULL DEFAULT NEWID(),
        user_id              UNIQUEIDENTIFIER     NOT NULL,
        token_hash           VARCHAR(128)         NOT NULL,
        expires_at           DATETIMEOFFSET       NOT NULL,
        created_at           DATETIMEOFFSET       NOT NULL DEFAULT SYSUTCDATETIME(),
        used_at              DATETIMEOFFSET       NULL,
        attempts             INT                  NOT NULL CONSTRAINT DF_prt_attempts DEFAULT 0,
        CONSTRAINT PK_password_reset_tokens PRIMARY KEY (token_id),
        CONSTRAINT FK_password_reset_tokens_users FOREIGN KEY (user_id) REFERENCES dbo.users (user_id) ON DELETE CASCADE,
        CONSTRAINT UQ_password_reset_tokens_hash UNIQUE (token_hash)
    );
    CREATE NONCLUSTERED INDEX IX_password_reset_tokens_user_id ON dbo.password_reset_tokens(user_id);
    PRINT 'Created table password_reset_tokens';
END;
GO

-- 6. Create device_tokens table (user_id matches UNIQUEIDENTIFIER of users table)
IF OBJECT_ID('dbo.device_tokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.device_tokens (
        device_token_id      UNIQUEIDENTIFIER     NOT NULL DEFAULT NEWID(),
        user_id              UNIQUEIDENTIFIER     NOT NULL,
        token                VARCHAR(500)         NOT NULL,
        provider             VARCHAR(40)          NOT NULL,
        active               BIT                  NOT NULL CONSTRAINT DF_dt_active DEFAULT 1,
        created_at           DATETIMEOFFSET       NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at           DATETIMEOFFSET       NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_device_tokens PRIMARY KEY (device_token_id),
        CONSTRAINT FK_device_tokens_users FOREIGN KEY (user_id) REFERENCES dbo.users (user_id) ON DELETE CASCADE,
        CONSTRAINT UQ_device_tokens_token UNIQUE (token)
    );
    CREATE NONCLUSTERED INDEX IX_device_tokens_user_id ON dbo.device_tokens(user_id);
    PRINT 'Created table device_tokens';
END;
GO

-- 7. Create blood_bag_status_history table (blood_bag_id and changed_by_user_id match UNIQUEIDENTIFIER)
IF OBJECT_ID('dbo.blood_bag_status_history', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.blood_bag_status_history (
        history_id           UNIQUEIDENTIFIER     NOT NULL DEFAULT NEWID(),
        blood_bag_id         UNIQUEIDENTIFIER     NOT NULL,
        status               VARCHAR(40)          NOT NULL,
        changed_at           DATETIMEOFFSET       NOT NULL DEFAULT SYSUTCDATETIME(),
        changed_by_user_id   UNIQUEIDENTIFIER     NOT NULL,
        location             NVARCHAR(255)        NULL,
        notes                NVARCHAR(MAX)        NULL,
        CONSTRAINT PK_blood_bag_status_history PRIMARY KEY (history_id),
        CONSTRAINT FK_bbsh_blood_bag FOREIGN KEY (blood_bag_id) REFERENCES dbo.blood_bags (blood_bag_id) ON DELETE CASCADE,
        CONSTRAINT FK_bbsh_users FOREIGN KEY (changed_by_user_id) REFERENCES dbo.users (user_id)
    );
    CREATE NONCLUSTERED INDEX IX_blood_bag_status_history_bag_id ON dbo.blood_bag_status_history(blood_bag_id);
    PRINT 'Created table blood_bag_status_history';
END;
GO

-- 8. Record migration in schema_migrations
IF OBJECT_ID('dbo.schema_migrations') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.schema_migrations WHERE migration_id = '011_add_mvp_auth_and_blood_bag_history')
    BEGIN
        INSERT INTO dbo.schema_migrations (migration_id, applied_at)
        VALUES ('011_add_mvp_auth_and_blood_bag_history', SYSUTCDATETIME());
        PRINT 'Recorded migration 011 in schema_migrations';
    END;
END;
GO
