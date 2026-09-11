/*
    Life Link - Migration 000
    Migration tracking table
*/

IF OBJECT_ID('dbo.__SchemaMigrations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.__SchemaMigrations
    (
        migration_id NVARCHAR(100) NOT NULL,
        applied_at   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

        CONSTRAINT pk___SchemaMigrations PRIMARY KEY (migration_id)
    );
END
GO
