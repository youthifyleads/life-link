/*
    Life Link - Migration 006
    Add nullable related_request_id foreign key and index to notifications table

    Target: Microsoft SQL Server 2016+ / Azure SQL Database
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Add column and foreign key if not already present
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.notifications') 
      AND name = 'related_request_id'
)
BEGIN
    PRINT '>>> Adding related_request_id column to dbo.notifications...';

    ALTER TABLE dbo.notifications 
    ADD related_request_id UNIQUEIDENTIFIER NULL;

    ALTER TABLE dbo.notifications
    ADD CONSTRAINT fk_notifications_blood_request
        FOREIGN KEY (related_request_id) REFERENCES dbo.blood_requests(blood_request_id)
        ON DELETE SET NULL;

    PRINT '>>> Column and foreign key constraint created successfully.';
END
ELSE
BEGIN
    PRINT '>>> Column related_request_id already exists in dbo.notifications.';
END
GO

-- 2. Create filtered nonclustered index on related_request_id
IF NOT EXISTS (
    SELECT 1 
    FROM sys.indexes 
    WHERE object_id = OBJECT_ID('dbo.notifications') 
      AND name = 'ix_notifications_related_request_id'
)
BEGIN
    PRINT '>>> Creating index ix_notifications_related_request_id...';

    CREATE NONCLUSTERED INDEX ix_notifications_related_request_id
    ON dbo.notifications(related_request_id)
    WHERE related_request_id IS NOT NULL;

    PRINT '>>> Index ix_notifications_related_request_id created successfully.';
END
ELSE
BEGIN
    PRINT '>>> Index ix_notifications_related_request_id already exists.';
END
GO
