from functools import lru_cache
from collections.abc import AsyncIterator
from fastapi import Depends
from app.core.config import get_settings
from app.db.session import get_session_factory
from app.repositories.interfaces.audit_repository import AuditRepository
from app.repositories.interfaces.inventory_repository import InventoryRepository
from app.repositories.interfaces.notification_repository import NotificationRepository
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.interfaces.document_repository import DocumentRepository
from app.repositories.interfaces.status_history_repository import StatusHistoryRepository
from app.repositories.interfaces.institution_repository import InstitutionRepository
from app.repositories.interfaces.donor_repository import DonorRepository
from app.repositories.interfaces.caregiver_repository import CaregiverRepository
from app.repositories.interfaces.payment_repository import PaymentRepository
from app.repositories.interfaces.blood_bag_repository import BloodBagRepository
from app.repositories.memory.audit_repository import InMemoryAuditRepository
from app.repositories.memory.inventory_repository import InMemoryInventoryRepository
from app.repositories.memory.notification_repository import InMemoryNotificationRepository
from app.repositories.memory.request_repository import InMemoryRequestRepository
from app.repositories.memory.user_repository import InMemoryUserRepository
from app.repositories.memory.document_repository import InMemoryDocumentRepository
from app.repositories.memory.status_history_repository import InMemoryStatusHistoryRepository
from app.repositories.memory.institution_repository import InMemoryInstitutionRepository
from app.repositories.memory.donor_repository import InMemoryDonorRepository
from app.repositories.memory.caregiver_repository import InMemoryCaregiverRepository
from app.repositories.memory.payment_repository import InMemoryPaymentRepository
from app.repositories.memory.blood_bag_repository import InMemoryBloodBagRepository
from app.repositories.sqlalchemy.audit_repository import SQLAlchemyAuditRepository
from app.repositories.sqlalchemy.inventory_repository import SQLAlchemyInventoryRepository
from app.repositories.sqlalchemy.notification_repository import SQLAlchemyNotificationRepository
from app.repositories.sqlalchemy.request_repository import SQLAlchemyRequestRepository
from app.repositories.sqlalchemy.user_repository import SQLAlchemyUserRepository
from app.repositories.sqlalchemy.document_repository import SQLAlchemyDocumentRepository
from app.repositories.sqlalchemy.status_history_repository import SQLAlchemyStatusHistoryRepository
from app.repositories.sqlalchemy.institution_repository import SQLAlchemyInstitutionRepository
from app.repositories.sqlalchemy.donor_repository import SQLAlchemyDonorRepository
from app.repositories.sqlalchemy.caregiver_repository import SQLAlchemyCaregiverRepository
from app.repositories.sqlalchemy.payment_repository import SQLAlchemyPaymentRepository
from app.repositories.sqlalchemy.blood_bag_repository import SQLAlchemyBloodBagRepository
from app.repositories.sqlalchemy.auth_tokens import SQLRefreshTokenStore,SQLPasswordResetStore
from app.services.password_reset_service import MemoryPasswordResetStore
from app.services.audit_service import AuditService
from app.services.auth_service import AuthService
from app.services.document_service import DocumentService
from app.services.inventory_service import InventoryService
from app.services.notification_service import NotificationService
from app.services.qr_service import QRService
from app.services.request_service import RequestService
from app.services.donor_service import DonorService
from app.services.caregiver_service import CaregiverService
from app.services.payment_service import PaymentService
from app.services.otp_service import OTPService
from app.services.email_service import AzureCommunicationEmailProvider
from app.services.token_service import RefreshTokenService,RefreshTokenStore
from app.services.password_reset_service import PasswordResetService
from app.services.blood_bag_service import BloodBagService
from app.repositories.interfaces.device_token_repository import DeviceTokenRepository
from app.repositories.memory.device_token_repository import InMemoryDeviceTokenRepository
from app.services.push_service import DeviceTokenService
from app.repositories.sqlalchemy.device_token_repository import SQLAlchemyDeviceTokenRepository

def use_sql(): return get_settings().REPOSITORY_BACKEND.lower() in {'sql','sqlserver','database'}
async def _repo_or_memory(sql_factory,memory_factory):
 if not use_sql(): yield memory_factory(); return
 async with get_session_factory()() as session: yield sql_factory(session)
@lru_cache
def _memory_user_repository():return InMemoryUserRepository()
@lru_cache
def _memory_request_repository():return InMemoryRequestRepository()
@lru_cache
def _memory_inventory_repository():return InMemoryInventoryRepository()
@lru_cache
def _memory_notification_repository():return InMemoryNotificationRepository()
@lru_cache
def _memory_audit_repository():return InMemoryAuditRepository()
@lru_cache
def _memory_document_repository():return InMemoryDocumentRepository()
@lru_cache
def _memory_status_history_repository():return InMemoryStatusHistoryRepository()
@lru_cache
def _memory_institution_repository():return InMemoryInstitutionRepository()
@lru_cache
def _memory_donor_repository():return InMemoryDonorRepository()
@lru_cache
def _memory_caregiver_repository():return InMemoryCaregiverRepository()
@lru_cache
def _memory_payment_repository():return InMemoryPaymentRepository()
@lru_cache
def _memory_blood_bag_repository():return InMemoryBloodBagRepository()
@lru_cache
def _memory_device_token_repository():return InMemoryDeviceTokenRepository()
async def get_user_repository():
 async for r in _repo_or_memory(SQLAlchemyUserRepository,_memory_user_repository):yield r
async def get_request_repository():
 async for r in _repo_or_memory(SQLAlchemyRequestRepository,_memory_request_repository):yield r
async def get_inventory_repository():
 async for r in _repo_or_memory(SQLAlchemyInventoryRepository,_memory_inventory_repository):yield r
async def get_notification_repository():
 async for r in _repo_or_memory(SQLAlchemyNotificationRepository,_memory_notification_repository):yield r
async def get_audit_repository():
 async for r in _repo_or_memory(SQLAlchemyAuditRepository,_memory_audit_repository):yield r
async def get_document_repository():
 async for r in _repo_or_memory(SQLAlchemyDocumentRepository,_memory_document_repository):yield r
async def get_status_history_repository():
 async for r in _repo_or_memory(SQLAlchemyStatusHistoryRepository,_memory_status_history_repository):yield r
async def get_institution_repository():
 async for r in _repo_or_memory(SQLAlchemyInstitutionRepository,_memory_institution_repository):yield r
async def get_donor_repository():
 async for r in _repo_or_memory(SQLAlchemyDonorRepository,_memory_donor_repository):yield r
async def get_caregiver_repository():
 async for r in _repo_or_memory(SQLAlchemyCaregiverRepository,_memory_caregiver_repository):yield r
async def get_payment_repository():
 async for r in _repo_or_memory(SQLAlchemyPaymentRepository,_memory_payment_repository):yield r
async def get_blood_bag_repository():
 async for r in _repo_or_memory(SQLAlchemyBloodBagRepository,_memory_blood_bag_repository):yield r
def get_audit_service(repo=Depends(get_audit_repository)):return AuditService(repo)
def get_notification_service(repo=Depends(get_notification_repository)):return NotificationService(repo)
def get_email_provider():return AzureCommunicationEmailProvider()
def get_otp_service(user_repo=Depends(get_user_repository),email_provider=Depends(get_email_provider)):return OTPService(user_repo,email_provider)
_refresh_store=RefreshTokenStore()
_password_reset_store=MemoryPasswordResetStore()
async def get_refresh_service(user_repo=Depends(get_user_repository)):
 if use_sql():
  async with get_session_factory()() as session: yield RefreshTokenService(user_repo,SQLRefreshTokenStore(session))
 else: yield RefreshTokenService(user_repo,_refresh_store)
async def get_password_reset_service(user_repo=Depends(get_user_repository),refresh_service=Depends(get_refresh_service),email_provider=Depends(get_email_provider)):
 if use_sql():
  async with get_session_factory()() as session: yield PasswordResetService(user_repo,email_provider,refresh_service,SQLPasswordResetStore(session))
 else: yield PasswordResetService(user_repo,email_provider,refresh_service,_password_reset_store)
def get_auth_service(user_repo=Depends(get_user_repository),audit_service=Depends(get_audit_service),donor_repo=Depends(get_donor_repository),otp_service=Depends(get_otp_service),refresh_service=Depends(get_refresh_service)):return AuthService(user_repo,audit_service,donor_repo,otp_service,refresh_service)
def get_qr_service(request_repo=Depends(get_request_repository),audit_service=Depends(get_audit_service)):return QRService(request_repo,audit_service)
def get_request_service(request_repo=Depends(get_request_repository),qr_service=Depends(get_qr_service),notification_service=Depends(get_notification_service),audit_service=Depends(get_audit_service),status_history_repo=Depends(get_status_history_repository)):return RequestService(request_repo,qr_service,notification_service,audit_service,status_history_repo)
def get_inventory_service(repo=Depends(get_inventory_repository),audit_service=Depends(get_audit_service)):return InventoryService(repo,audit_service)
def get_document_service(document_repo=Depends(get_document_repository),request_repo=Depends(get_request_repository)):return DocumentService(document_repo,request_repo)
def get_donor_service(repo=Depends(get_donor_repository),user_repo=Depends(get_user_repository)):return DonorService(repo,user_repo)
def get_caregiver_service(repo=Depends(get_caregiver_repository),user_repo=Depends(get_user_repository)):return CaregiverService(repo,user_repo)
def get_payment_service(repo=Depends(get_payment_repository),request_repo=Depends(get_request_repository)):return PaymentService(repo,request_repo)
def get_blood_bag_service(repo=Depends(get_blood_bag_repository),audit_service=Depends(get_audit_service)):return BloodBagService(repo,audit_service)
async def get_device_token_repository():
 async for r in _repo_or_memory(SQLAlchemyDeviceTokenRepository,_memory_device_token_repository):yield r
def get_device_token_service(repo=Depends(get_device_token_repository)):return DeviceTokenService(repo)
def reset_all_repositories():
 for f in [_memory_user_repository,_memory_request_repository,_memory_inventory_repository,_memory_notification_repository,_memory_audit_repository,_memory_document_repository,_memory_status_history_repository,_memory_institution_repository,_memory_donor_repository,_memory_caregiver_repository,_memory_payment_repository,_memory_blood_bag_repository,_memory_device_token_repository]: f.cache_clear()
