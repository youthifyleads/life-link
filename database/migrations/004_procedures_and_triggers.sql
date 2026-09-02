/*
    Life Link - Migration 004
    Stored procedures and integrity trigger
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.usp_record_blood_bag_scan', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_record_blood_bag_scan;
GO

CREATE PROCEDURE dbo.usp_record_blood_bag_scan
    @blood_bag_id           UNIQUEIDENTIFIER,
    @scanned_by_user_id     UNIQUEIDENTIFIER,
    @scan_type              VARCHAR(40),
    @location               NVARCHAR(255),
    @new_status             VARCHAR(30) = NULL,
    @new_location           NVARCHAR(255) = NULL,
    @new_blood_bank_id      UNIQUEIDENTIFIER = NULL,
    @notes                  NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1
            FROM blood_bags WITH (UPDLOCK, HOLDLOCK)
            WHERE blood_bag_id = @blood_bag_id
        )
        BEGIN
            RAISERROR('Blood bag does not exist.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM users
            WHERE user_id = @scanned_by_user_id
        )
        BEGIN
            RAISERROR('Scanning user does not exist.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @new_status IS NOT NULL
           AND @new_status NOT IN
               ('available','reserved','allocated','expired','discarded','in_transit')
        BEGIN
            RAISERROR('Invalid blood bag status.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @new_blood_bank_id IS NOT NULL
           AND NOT EXISTS (
               SELECT 1 FROM blood_banks
               WHERE blood_bank_id = @new_blood_bank_id
           )
        BEGIN
            RAISERROR('Target blood bank does not exist.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        INSERT INTO scan_events (
            blood_bag_id,
            scanned_by_user_id,
            scan_type,
            scanned_at,
            location,
            notes
        )
        VALUES (
            @blood_bag_id,
            @scanned_by_user_id,
            @scan_type,
            SYSUTCDATETIME(),
            @location,
            @notes
        );

        UPDATE blood_bags
        SET
            status = COALESCE(@new_status, status),
            current_location = COALESCE(@new_location, current_location),
            current_blood_bank_id =
                CASE
                    WHEN @new_blood_bank_id IS NOT NULL
                        THEN @new_blood_bank_id
                    WHEN @new_status = 'in_transit'
                        THEN NULL
                    ELSE current_blood_bank_id
                END
        WHERE blood_bag_id = @blood_bag_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ScanErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ScanErrSev INT = ERROR_SEVERITY();
        DECLARE @ScanErrState INT = ERROR_STATE();
        RAISERROR(@ScanErrMsg, @ScanErrSev, @ScanErrState);
    END CATCH
END
GO

IF OBJECT_ID('dbo.usp_allocate_blood_bag', 'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_allocate_blood_bag;
GO

CREATE PROCEDURE dbo.usp_allocate_blood_bag
    @blood_request_id    UNIQUEIDENTIFIER,
    @blood_bank_id       UNIQUEIDENTIFIER,
    @blood_bag_id        UNIQUEIDENTIFIER,
    @quantity             NUMERIC(8,2)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @quantity <= 0
        BEGIN
            RAISERROR('Allocation quantity must be greater than zero.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM blood_requests
            WHERE blood_request_id = @blood_request_id
        )
        BEGIN
            RAISERROR('Blood request does not exist.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        DECLARE
            @bag_status VARCHAR(30),
            @bag_expiry DATETIME2,
            @bag_bank UNIQUEIDENTIFIER,
            @bag_quantity NUMERIC(8,2),
            @bag_blood_type VARCHAR(5),
            @request_blood_type VARCHAR(5);

        SELECT
            @bag_status = status,
            @bag_expiry = expiry_date,
            @bag_bank = current_blood_bank_id,
            @bag_quantity = quantity,
            @bag_blood_type = blood_type
        FROM blood_bags WITH (UPDLOCK, HOLDLOCK)
        WHERE blood_bag_id = @blood_bag_id;

        IF @bag_status IS NULL
        BEGIN
            RAISERROR('Blood bag does not exist.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @bag_status NOT IN ('available','reserved')
        BEGIN
            RAISERROR('Blood bag is not available for allocation.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @bag_expiry <= SYSUTCDATETIME()
        BEGIN
            RAISERROR('Blood bag is expired.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @bag_bank IS NULL OR @bag_bank <> @blood_bank_id
        BEGIN
            RAISERROR('Blood bag is not currently stored at the specified blood bank.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF @quantity > @bag_quantity
        BEGIN
            RAISERROR('Allocation quantity exceeds the blood bag quantity.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        SELECT @request_blood_type = blood_type
        FROM blood_requests
        WHERE blood_request_id = @blood_request_id;

        IF @request_blood_type <> @bag_blood_type
        BEGIN
            RAISERROR('Blood type does not match the request.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        IF EXISTS (
            SELECT 1
            FROM request_allocations WITH (UPDLOCK, HOLDLOCK)
            WHERE blood_bag_id = @blood_bag_id
        )
        BEGIN
            RAISERROR('Blood bag is already allocated.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        INSERT INTO request_allocations (
            quantity,
            status,
            allocated_at,
            blood_request_id,
            blood_bank_id,
            blood_bag_id
        )
        VALUES (
            @quantity,
            'allocated',
            SYSUTCDATETIME(),
            @blood_request_id,
            @blood_bank_id,
            @blood_bag_id
        );

        UPDATE blood_bags
        SET status = 'allocated'
        WHERE blood_bag_id = @blood_bag_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @AllocErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @AllocErrSev INT = ERROR_SEVERITY();
        DECLARE @AllocErrState INT = ERROR_STATE();
        RAISERROR(@AllocErrMsg, @AllocErrSev, @AllocErrState);
    END CATCH
END
GO

IF OBJECT_ID('dbo.trg_blood_bags_validate_blood_type', 'TR') IS NOT NULL
    DROP TRIGGER dbo.trg_blood_bags_validate_blood_type;
GO

CREATE TRIGGER dbo.trg_blood_bags_validate_blood_type
ON dbo.blood_bags
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN dbo.donations d ON i.donation_id = d.donation_id
        WHERE i.blood_type <> d.blood_type
    )
    BEGIN
        RAISERROR('Integrity Violation: Blood bag blood type must strictly match the parent donation blood type.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO
