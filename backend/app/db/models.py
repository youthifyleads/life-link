"""SQLAlchemy persistence models matching the supplied Life Link schema.pdf.

Table/column names intentionally follow the schema document (plural table names
and separate *_phones tables). Business rules remain in the service layer.
"""
from __future__ import annotations
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


def id_col(length: int = 50) -> Mapped[str]:
    return mapped_column(String(length), primary_key=True)

role_permissions = Table(
    "role_permissions", Base.metadata,
    Column("role_id", String(50), ForeignKey("roles.role_id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", String(50), ForeignKey("permissions.permission_id", ondelete="CASCADE"), primary_key=True),
)

class RoleModel(Base):
    __tablename__ = "roles"
    role_id: Mapped[str] = id_col(); name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False); description: Mapped[Optional[str]] = mapped_column(Text)
    permissions: Mapped[list[PermissionModel]] = relationship(secondary=role_permissions, back_populates="roles")
    users: Mapped[list[UserModel]] = relationship(back_populates="role")

class PermissionModel(Base):
    __tablename__ = "permissions"
    permission_id: Mapped[str] = id_col(); name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False); description: Mapped[Optional[str]] = mapped_column(Text)
    roles: Mapped[list[RoleModel]] = relationship(secondary=role_permissions, back_populates="permissions")

class UserModel(Base):
    __tablename__ = "users"
    user_id: Mapped[str] = id_col(); name: Mapped[str] = mapped_column(String(200), nullable=False); email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False); status: Mapped[Optional[str]] = mapped_column(String(40), default="active"); created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.role_id"), nullable=False, index=True); hospital_id: Mapped[Optional[str]] = mapped_column(ForeignKey("hospitals.hospital_id"), index=True); blood_bank_id: Mapped[Optional[str]] = mapped_column(ForeignKey("blood_banks.blood_bank_id"), index=True)
    role: Mapped[RoleModel] = relationship(back_populates="users"); hospital: Mapped[Optional[HospitalModel]] = relationship(back_populates="users"); blood_bank: Mapped[Optional[BloodBankModel]] = relationship(back_populates="users")
    phones: Mapped[list[UserPhoneModel]] = relationship(back_populates="user", cascade="all, delete-orphan"); donor: Mapped[Optional[DonorModel]] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications: Mapped[list[NotificationModel]] = relationship(back_populates="user"); audit_logs: Mapped[list[AuditLogModel]] = relationship(back_populates="user")

class UserPhoneModel(Base):
    __tablename__ = "user_phones"
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True); phone: Mapped[str] = mapped_column(String(40), primary_key=True)
    user: Mapped[UserModel] = relationship(back_populates="phones")

class HospitalModel(Base):
    __tablename__ = "hospitals"
    hospital_id: Mapped[str] = id_col(); name: Mapped[str] = mapped_column(String(200), nullable=False); governorate: Mapped[Optional[str]] = mapped_column(String(100)); address: Mapped[Optional[str]] = mapped_column(String(500)); status: Mapped[Optional[str]] = mapped_column(String(40), default="active")
    phones: Mapped[list[HospitalPhoneModel]] = relationship(back_populates="hospital", cascade="all, delete-orphan"); users: Mapped[list[UserModel]] = relationship(back_populates="hospital"); requests: Mapped[list[BloodRequestModel]] = relationship(back_populates="hospital")

class HospitalPhoneModel(Base):
    __tablename__ = "hospital_phones"
    hospital_id: Mapped[str] = mapped_column(ForeignKey("hospitals.hospital_id", ondelete="CASCADE"), primary_key=True); phone: Mapped[str] = mapped_column(String(40), primary_key=True)
    hospital: Mapped[HospitalModel] = relationship(back_populates="phones")

class BloodBankModel(Base):
    __tablename__ = "blood_banks"
    blood_bank_id: Mapped[str] = id_col(); name: Mapped[str] = mapped_column(String(200), nullable=False); governorate: Mapped[Optional[str]] = mapped_column(String(100)); address: Mapped[Optional[str]] = mapped_column(String(500)); status: Mapped[Optional[str]] = mapped_column(String(40), default="active")
    phones: Mapped[list[BloodBankPhoneModel]] = relationship(back_populates="blood_bank", cascade="all, delete-orphan"); users: Mapped[list[UserModel]] = relationship(back_populates="blood_bank"); donations: Mapped[list[DonationModel]] = relationship(back_populates="blood_bank"); blood_bags: Mapped[list[BloodBagModel]] = relationship(back_populates="current_blood_bank")

class BloodBankPhoneModel(Base):
    __tablename__ = "blood_bank_phones"
    blood_bank_id: Mapped[str] = mapped_column(ForeignKey("blood_banks.blood_bank_id", ondelete="CASCADE"), primary_key=True); phone: Mapped[str] = mapped_column(String(40), primary_key=True)
    blood_bank: Mapped[BloodBankModel] = relationship(back_populates="phones")

class DonorModel(Base):
    __tablename__ = "donors"
    donor_id: Mapped[str] = id_col(); user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False, index=True); blood_type: Mapped[Optional[str]] = mapped_column(String(3)); date_of_birth: Mapped[Optional[date]] = mapped_column(Date); governorate: Mapped[Optional[str]] = mapped_column(String(100)); eligibility_status: Mapped[Optional[str]] = mapped_column(String(60)); last_donation_date: Mapped[Optional[date]] = mapped_column(Date)
    user: Mapped[UserModel] = relationship(back_populates="donor"); consents: Mapped[list[ConsentModel]] = relationship(back_populates="donor", cascade="all, delete-orphan"); donations: Mapped[list[DonationModel]] = relationship(back_populates="donor"); responses: Mapped[list[DonationResponseModel]] = relationship(back_populates="donor")

class ConsentModel(Base):
    __tablename__ = "consents"
    consent_id: Mapped[str] = id_col(); donor_id: Mapped[str] = mapped_column(ForeignKey("donors.donor_id", ondelete="CASCADE"), index=True); consent_type: Mapped[str] = mapped_column(String(100), nullable=False); granted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False); granted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True)); revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    donor: Mapped[DonorModel] = relationship(back_populates="consents")

class DonationModel(Base):
    __tablename__ = "donations"
    donation_id: Mapped[str] = id_col(); blood_type: Mapped[str] = mapped_column(String(3), nullable=False); quantity: Mapped[int] = mapped_column(Integer, nullable=False); donation_date: Mapped[date] = mapped_column(Date, nullable=False); status: Mapped[Optional[str]] = mapped_column(String(40)); created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); donor_id: Mapped[str] = mapped_column(ForeignKey("donors.donor_id"), index=True); blood_bank_id: Mapped[str] = mapped_column(ForeignKey("blood_banks.blood_bank_id"), index=True)
    donor: Mapped[DonorModel] = relationship(back_populates="donations"); blood_bank: Mapped[BloodBankModel] = relationship(back_populates="donations"); blood_bags: Mapped[list[BloodBagModel]] = relationship(back_populates="donation"); voucher: Mapped[Optional[DonationVoucherModel]] = relationship(back_populates="donation", uselist=False)

class DonationResponseModel(Base):
    __tablename__ = "donation_responses"
    response_id: Mapped[str] = id_col(); response_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); status: Mapped[str] = mapped_column(String(40), nullable=False); notes: Mapped[Optional[str]] = mapped_column(Text); blood_request_id: Mapped[str] = mapped_column(ForeignKey("blood_requests.blood_request_id"), index=True); donor_id: Mapped[str] = mapped_column(ForeignKey("donors.donor_id"), index=True)
    blood_request: Mapped[BloodRequestModel] = relationship(back_populates="donation_responses"); donor: Mapped[DonorModel] = relationship(back_populates="responses")

class DonationVoucherModel(Base):
    __tablename__ = "donation_vouchers"
    voucher_id: Mapped[str] = id_col(); voucher_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False); issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); status: Mapped[str] = mapped_column(String(40), nullable=False); donation_id: Mapped[str] = mapped_column(ForeignKey("donations.donation_id"), unique=True, index=True)
    donation: Mapped[DonationModel] = relationship(back_populates="voucher")

class BloodRequestModel(Base):
    __tablename__ = "blood_requests"
    blood_request_id: Mapped[str] = id_col(); blood_type: Mapped[str] = mapped_column(String(3), nullable=False); requested_quantity: Mapped[int] = mapped_column(Integer, nullable=False); urgency: Mapped[str] = mapped_column(String(40), nullable=False); reason: Mapped[Optional[str]] = mapped_column(Text); status: Mapped[str] = mapped_column(String(50), nullable=False); required_by: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True)); created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); hospital_id: Mapped[str] = mapped_column(ForeignKey("hospitals.hospital_id"), index=True); created_by_user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), index=True)
    hospital: Mapped[HospitalModel] = relationship(back_populates="requests"); allocations: Mapped[list[RequestAllocationModel]] = relationship(back_populates="blood_request", cascade="all, delete-orphan"); documents: Mapped[list[SupportingDocumentModel]] = relationship(back_populates="blood_request", cascade="all, delete-orphan"); status_history: Mapped[list[RequestStatusHistoryModel]] = relationship(back_populates="blood_request", cascade="all, delete-orphan"); donation_responses: Mapped[list[DonationResponseModel]] = relationship(back_populates="blood_request"); payments: Mapped[list[PaymentModel]] = relationship(back_populates="blood_request")

class BloodBagModel(Base):
    __tablename__ = "blood_bags"
    blood_bag_id: Mapped[str] = id_col(); blood_type: Mapped[str] = mapped_column(String(3), nullable=False); quantity: Mapped[int] = mapped_column(Integer, nullable=False); collection_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); expiry_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True)); qr_code: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True); status: Mapped[str] = mapped_column(String(50), nullable=False); current_location: Mapped[Optional[str]] = mapped_column(String(255)); created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); donation_id: Mapped[Optional[str]] = mapped_column(ForeignKey("donations.donation_id"), index=True); current_blood_bank_id: Mapped[str] = mapped_column(ForeignKey("blood_banks.blood_bank_id"), index=True)
    donation: Mapped[Optional[DonationModel]] = relationship(back_populates="blood_bags"); current_blood_bank: Mapped[BloodBankModel] = relationship(back_populates="blood_bags"); allocations: Mapped[list[RequestAllocationModel]] = relationship(back_populates="blood_bag"); scan_events: Mapped[list[ScanEventModel]] = relationship(back_populates="blood_bag", cascade="all, delete-orphan"); caregiver_assignments: Mapped[list[CaregiverAssignmentModel]] = relationship(back_populates="blood_bag")

class RequestAllocationModel(Base):
    __tablename__ = "request_allocations"
    allocation_id: Mapped[str] = id_col(); quantity: Mapped[int] = mapped_column(Integer, nullable=False); status: Mapped[str] = mapped_column(String(40), nullable=False); allocated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); blood_request_id: Mapped[str] = mapped_column(ForeignKey("blood_requests.blood_request_id", ondelete="CASCADE"), index=True); blood_bank_id: Mapped[str] = mapped_column(ForeignKey("blood_banks.blood_bank_id"), index=True); blood_bag_id: Mapped[str] = mapped_column(ForeignKey("blood_bags.blood_bag_id"), index=True)
    blood_request: Mapped[BloodRequestModel] = relationship(back_populates="allocations"); blood_bag: Mapped[BloodBagModel] = relationship(back_populates="allocations")

class ScanEventModel(Base):
    __tablename__ = "scan_events"
    scan_id: Mapped[str] = id_col(); blood_bag_id: Mapped[str] = mapped_column(ForeignKey("blood_bags.blood_bag_id", ondelete="CASCADE"), index=True); scanned_by_user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), index=True); scan_type: Mapped[str] = mapped_column(String(50), nullable=False); scanned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); location: Mapped[Optional[str]] = mapped_column(String(255)); notes: Mapped[Optional[str]] = mapped_column(Text)
    blood_bag: Mapped[BloodBagModel] = relationship(back_populates="scan_events")

class SupportingDocumentModel(Base):
    __tablename__ = "supporting_documents"
    document_id: Mapped[str] = id_col(); file_name: Mapped[str] = mapped_column(String(255), nullable=False); file_path: Mapped[str] = mapped_column(String(1000), nullable=False); file_type: Mapped[Optional[str]] = mapped_column(String(120)); uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); status: Mapped[str] = mapped_column(String(40), nullable=False); reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True)); rejection_reason: Mapped[Optional[str]] = mapped_column(Text); blood_request_id: Mapped[str] = mapped_column(ForeignKey("blood_requests.blood_request_id", ondelete="CASCADE"), index=True); uploaded_by_user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), index=True); reviewed_by_user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.user_id"), index=True)
    blood_request: Mapped[BloodRequestModel] = relationship(back_populates="documents")

class RequestStatusHistoryModel(Base):
    __tablename__ = "request_status_history"
    history_id: Mapped[str] = id_col(); status: Mapped[str] = mapped_column(String(50), nullable=False); changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); notes: Mapped[Optional[str]] = mapped_column(Text); blood_request_id: Mapped[str] = mapped_column(ForeignKey("blood_requests.blood_request_id", ondelete="CASCADE"), index=True); changed_by_user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), index=True)
    blood_request: Mapped[BloodRequestModel] = relationship(back_populates="status_history")

class NotificationModel(Base):
    __tablename__ = "notifications"
    notification_id: Mapped[str] = id_col(); title: Mapped[Optional[str]] = mapped_column(String(200)); message: Mapped[str] = mapped_column(Text, nullable=False); type: Mapped[str] = mapped_column(String(80), nullable=False); status: Mapped[str] = mapped_column(String(40), nullable=False); created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True)); user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), index=True)
    user: Mapped[UserModel] = relationship(back_populates="notifications")

class AuditLogModel(Base):
    __tablename__ = "audit_logs"
    audit_id: Mapped[str] = id_col(); entity_type: Mapped[str] = mapped_column(String(100), nullable=False); entity_id: Mapped[Optional[str]] = mapped_column(String(100), index=True); action: Mapped[str] = mapped_column(String(100), nullable=False); logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.user_id"), index=True)
    user: Mapped[Optional[UserModel]] = relationship(back_populates="audit_logs")

class PaymentModel(Base):
    __tablename__ = "payments"
    payment_id: Mapped[str] = id_col(); amount: Mapped[Decimal] = mapped_column(Numeric(12,2), nullable=False); payment_status: Mapped[str] = mapped_column(String(40), nullable=False); payment_method: Mapped[Optional[str]] = mapped_column(String(100)); paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True)); transaction_reference: Mapped[Optional[str]] = mapped_column(String(255), unique=True); created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False); blood_request_id: Mapped[str] = mapped_column(ForeignKey("blood_requests.blood_request_id"), index=True)
    blood_request: Mapped[BloodRequestModel] = relationship(back_populates="payments")

class CaregiverAssignmentModel(Base):
    __tablename__ = "caregiver_assignments"
    assignment_id: Mapped[str] = id_col(); assignment_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True)); status: Mapped[str] = mapped_column(String(40), nullable=False); notes: Mapped[Optional[str]] = mapped_column(Text); blood_bag_id: Mapped[str] = mapped_column(ForeignKey("blood_bags.blood_bag_id"), index=True); caregiver_user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"), index=True); hospital_id: Mapped[str] = mapped_column(ForeignKey("hospitals.hospital_id"), index=True)
    blood_bag: Mapped[BloodBagModel] = relationship(back_populates="caregiver_assignments")
