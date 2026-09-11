/*
    Life Link - Migration 003
    Views
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.vw_current_blood_inventory', 'V') IS NOT NULL
    DROP VIEW dbo.vw_current_blood_inventory;
GO

CREATE VIEW dbo.vw_current_blood_inventory
AS
SELECT
    bb.current_blood_bank_id,
    bank.name AS blood_bank_name,
    bank.governorate,
    bb.blood_type,
    COUNT(*) AS total_available_bags,
    SUM(bb.quantity) AS total_available_ml,
    MIN(bb.expiry_date) AS earliest_expiry_date
FROM blood_bags bb
JOIN blood_banks bank ON bb.current_blood_bank_id = bank.blood_bank_id
WHERE bb.status = 'available' AND bb.expiry_date > SYSUTCDATETIME()
GROUP BY bb.current_blood_bank_id, bank.name, bank.governorate, bb.blood_type;
GO

IF OBJECT_ID('dbo.vw_active_blood_requests', 'V') IS NOT NULL
    DROP VIEW dbo.vw_active_blood_requests;
GO

CREATE VIEW dbo.vw_active_blood_requests
AS
SELECT
    br.blood_request_id,
    br.blood_type,
    br.requested_quantity,
    br.urgency,
    br.reason,
    br.status AS request_status,
    br.required_by,
    br.created_at,
    h.hospital_id,
    h.name AS hospital_name,
    h.governorate AS hospital_governorate,
    u.name AS requested_by_user_name,
    ISNULL(SUM(ra.quantity), 0) AS allocated_quantity,
    (br.requested_quantity - ISNULL(SUM(ra.quantity), 0)) AS remaining_quantity
FROM blood_requests br
JOIN hospitals h ON br.hospital_id = h.hospital_id
JOIN users u ON br.created_by_user_id = u.user_id
LEFT JOIN request_allocations ra ON br.blood_request_id = ra.blood_request_id AND ra.status = 'allocated'
WHERE br.status IN ('requested', 'acknowledged', 'confirmed', 'prepared')
GROUP BY 
    br.blood_request_id, br.blood_type, br.requested_quantity, br.urgency,
    br.reason, br.status, br.required_by, br.created_at, h.hospital_id,
    h.name, h.governorate, u.name;
GO

IF OBJECT_ID('dbo.vw_blood_bag_traceability', 'V') IS NOT NULL
    DROP VIEW dbo.vw_blood_bag_traceability;
GO

CREATE VIEW dbo.vw_blood_bag_traceability
AS
SELECT
    bb.blood_bag_id,
    bb.qr_code,
    bb.blood_type,
    bb.quantity AS bag_quantity_ml,
    bb.status AS current_status,
    bb.current_location,
    bb.collection_date,
    bb.expiry_date,
    d.donation_id,
    d.donation_date,
    donor_u.name AS donor_name,
    donor.governorate AS donor_governorate,
    bank.name AS blood_bank_name,
    ra.blood_request_id,
    h.name AS allocated_to_hospital
FROM blood_bags bb
JOIN donations d ON bb.donation_id = d.donation_id
JOIN donors donor ON d.donor_id = donor.donor_id
JOIN users donor_u ON donor.user_id = donor_u.user_id
LEFT JOIN blood_banks bank ON bb.current_blood_bank_id = bank.blood_bank_id
LEFT JOIN request_allocations ra ON bb.blood_bag_id = ra.blood_bag_id
LEFT JOIN blood_requests br ON ra.blood_request_id = br.blood_request_id
LEFT JOIN hospitals h ON br.hospital_id = h.hospital_id;
GO

IF OBJECT_ID('dbo.vw_eligible_matching_donors', 'V') IS NOT NULL
    DROP VIEW dbo.vw_eligible_matching_donors;
GO

CREATE VIEW dbo.vw_eligible_matching_donors
AS
SELECT
    d.donor_id,
    d.user_id,
    u.name AS donor_name,
    u.email,
    d.blood_type,
    d.governorate,
    d.last_donation_date,
    DATEDIFF(DAY, d.last_donation_date, GETDATE()) AS days_since_last_donation
FROM donors d
JOIN users u ON d.user_id = u.user_id
WHERE d.eligibility_status = 'eligible'
  AND u.status = 'active'
  AND (d.last_donation_date IS NULL OR DATEDIFF(DAY, d.last_donation_date, GETDATE()) >= 56);
GO
