"""FastAPI dependency-injection wiring for memory and SQL Server persistence."""
from functools import lru_cache
from collections.abc import AsyncIterator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

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
from app.repositories.interfaces.device_token_repository import DeviceTokenRepository

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
from app.repositories.memory.device_token_repository import InMemoryDeviceTokenRepository

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
from app.repositories.sqlalchemy.device_token_repository import SQLAlchemyDeviceTokenRepository
from app.repositories.sqlalchemy.auth_tokens import SQLRefreshTokenStore, SQLPasswordResetStore

from app.services.audit_service import AuditService
from app.services.document_service import DocumentService
from app.services.inventory_service import InventoryService
from app.services.notification_service import NotificationService
from app.services.qr_service import QRService
from app.services.request_service import RequestService
from app.services.donor_service import DonorService
from app.services.caregiver_service import CaregiverService
from app.services.payment_service import PaymentService
from app.services.otp_service import OTPService
from app.services.matching_service import MatchingService
from app.services.blood_bag_service import BloodBagService
from app.services.push_service import DeviceTokenService
from app.services.email_service import AzureCommunicationEmailProvider, EmailProvider
from app.services.token_service import RefreshTokenService, RefreshTokenStore
from app.services.password_reset_service import MemoryPasswordResetStore, PasswordResetService
from app.services.auth_service import AuthService


@lru_cache
def _memory_user_repository() -> UserRepository:
    return InMemoryUserRepository()


@lru_cache
def _memory_request_repository() -> RequestRepository:
    return InMemoryRequestRepository()


@lru_cache
def _memory_inventory_repository() -> InventoryRepository:
    return InMemoryInventoryRepository()


@lru_cache
def _memory_notification_repository() -> NotificationRepository:
    return InMemoryNotificationRepository()


@lru_cache
def _memory_audit_repository() -> AuditRepository:
    return InMemoryAuditRepository()


@lru_cache
def _memory_document_repository() -> DocumentRepository:
    return InMemoryDocumentRepository()


@lru_cache
def _memory_status_history_repository() -> StatusHistoryRepository:
    return InMemoryStatusHistoryRepository()


@lru_cache
def _memory_institution_repository() -> InstitutionRepository:
    return InMemoryInstitutionRepository()


@lru_cache
def _memory_donor_repository() -> DonorRepository:
    return InMemoryDonorRepository()


@lru_cache
def _memory_caregiver_repository() -> CaregiverRepository:
    return InMemoryCaregiverRepository()


@lru_cache
def _memory_payment_repository() -> PaymentRepository:
    return InMemoryPaymentRepository()


@lru_cache
def _memory_blood_bag_repository() -> BloodBagRepository:
    return InMemoryBloodBagRepository()


@lru_cache
def _memory_device_token_repository() -> DeviceTokenRepository:
    return InMemoryDeviceTokenRepository()


def use_sql() -> bool:
    settings = get_settings()
    return settings.REPOSITORY_BACKEND.lower() in ("sqlserver", "sql", "database")


async def _repo_or_memory(sql_cls, mem_factory):
    if use_sql():
        factory = get_session_factory()
        async with factory() as session:
            yield sql_cls(session)
    else:
        yield mem_factory()


async def get_user_repository() -> AsyncIterator[UserRepository]:
    async for repo in _repo_or_memory(SQLAlchemyUserRepository, _memory_user_repository):
        yield repo


async def get_request_repository() -> AsyncIterator[RequestRepository]:
    async for repo in _repo_or_memory(SQLAlchemyRequestRepository, _memory_request_repository):
        yield repo


async def get_inventory_repository() -> AsyncIterator[InventoryRepository]:
    async for repo in _repo_or_memory(SQLAlchemyInventoryRepository, _memory_inventory_repository):
        yield repo


async def get_notification_repository() -> AsyncIterator[NotificationRepository]:
    async for repo in _repo_or_memory(SQLAlchemyNotificationRepository, _memory_notification_repository):
        yield repo


async def get_audit_repository() -> AsyncIterator[AuditRepository]:
    async for repo in _repo_or_memory(SQLAlchemyAuditRepository, _memory_audit_repository):
        yield repo


async def get_document_repository() -> AsyncIterator[DocumentRepository]:
    async for repo in _repo_or_memory(SQLAlchemyDocumentRepository, _memory_document_repository):
        yield repo


async def get_status_history_repository() -> AsyncIterator[StatusHistoryRepository]:
    async for repo in _repo_or_memory(SQLAlchemyStatusHistoryRepository, _memory_status_history_repository):
        yield repo


async def get_institution_repository() -> AsyncIterator[InstitutionRepository]:
    async for repo in _repo_or_memory(SQLAlchemyInstitutionRepository, _memory_institution_repository):
        yield repo


async def get_donor_repository() -> AsyncIterator[DonorRepository]:
    async for repo in _repo_or_memory(SQLAlchemyDonorRepository, _memory_donor_repository):
        yield repo


async def get_caregiver_repository() -> AsyncIterator[CaregiverRepository]:
    async for repo in _repo_or_memory(SQLAlchemyCaregiverRepository, _memory_caregiver_repository):
        yield repo


async def get_payment_repository() -> AsyncIterator[PaymentRepository]:
    async for repo in _repo_or_memory(SQLAlchemyPaymentRepository, _memory_payment_repository):
        yield repo


async def get_blood_bag_repository() -> AsyncIterator[BloodBagRepository]:
    async for repo in _repo_or_memory(SQLAlchemyBloodBagRepository, _memory_blood_bag_repository):
        yield repo


async def get_device_token_repository() -> AsyncIterator[DeviceTokenRepository]:
    async for repo in _repo_or_memory(SQLAlchemyDeviceTokenRepository, _memory_device_token_repository):
        yield repo


def get_audit_service(audit_repo: AuditRepository = Depends(get_audit_repository)) -> AuditService:
    return AuditService(audit_repo)


def get_notification_service(notification_repo: NotificationRepository = Depends(get_notification_repository)) -> NotificationService:
    return NotificationService(notification_repo)


def get_email_provider() -> EmailProvider:
    return AzureCommunicationEmailProvider()


def get_otp_service(
    user_repo: UserRepository = Depends(get_user_repository),
    email_provider: EmailProvider = Depends(get_email_provider),
) -> OTPService:
    return OTPService(user_repo, email_provider)


_refresh_store = RefreshTokenStore()
_password_reset_store = MemoryPasswordResetStore()


async def get_refresh_service(user_repo: UserRepository = Depends(get_user_repository)):
    if use_sql():
        async with get_session_factory()() as session:
            yield RefreshTokenService(user_repo, SQLRefreshTokenStore(session))
    else:
        yield RefreshTokenService(user_repo, _refresh_store)


async def get_password_reset_service(
    user_repo: UserRepository = Depends(get_user_repository),
    refresh_service: RefreshTokenService = Depends(get_refresh_service),
    email_provider: EmailProvider = Depends(get_email_provider),
):
    if use_sql():
        async with get_session_factory()() as session:
            yield PasswordResetService(user_repo, email_provider, refresh_service, SQLPasswordResetStore(session))
    else:
        yield PasswordResetService(user_repo, email_provider, refresh_service, _password_reset_store)


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    audit_service: AuditService = Depends(get_audit_service),
    donor_repo: DonorRepository = Depends(get_donor_repository),
    otp_service: OTPService = Depends(get_otp_service),
    refresh_service: RefreshTokenService = Depends(get_refresh_service),
) -> AuthService:
    return AuthService(user_repo, audit_service, donor_repo, otp_service, refresh_service)


def get_qr_service(
    request_repo: RequestRepository = Depends(get_request_repository),
    audit_service: AuditService = Depends(get_audit_service),
    institution_repo: InstitutionRepository = Depends(get_institution_repository),
) -> QRService:
    return QRService(request_repo, audit_service, institution_repo)


def get_request_service(
    request_repo: RequestRepository = Depends(get_request_repository),
    qr_service: QRService = Depends(get_qr_service),
    notification_service: NotificationService = Depends(get_notification_service),
    audit_service: AuditService = Depends(get_audit_service),
    status_history_repo: StatusHistoryRepository = Depends(get_status_history_repository),
    blood_bag_repo: BloodBagRepository = Depends(get_blood_bag_repository),
) -> RequestService:
    return RequestService(
        request_repo,
        qr_service,
        notification_service,
        audit_service,
        status_history_repo,
        blood_bag_repo=blood_bag_repo,
    )


def get_inventory_service(
    inventory_repo: InventoryRepository = Depends(get_inventory_repository),
    audit_service: AuditService = Depends(get_audit_service),
) -> InventoryService:
    return InventoryService(inventory_repo, audit_service)


def get_document_service(
    document_repo: DocumentRepository = Depends(get_document_repository),
    request_repo: RequestRepository = Depends(get_request_repository),
) -> DocumentService:
    return DocumentService(document_repo, request_repo)


def get_matching_service(
    donor_repo: DonorRepository = Depends(get_donor_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    request_repo: RequestRepository = Depends(get_request_repository),
    institution_repo: InstitutionRepository = Depends(get_institution_repository),
) -> MatchingService:
    return MatchingService(donor_repo, user_repo, request_repo, institution_repo)


def get_donor_service(
    repo: DonorRepository = Depends(get_donor_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    request_repo: RequestRepository = Depends(get_request_repository),
    matching_service: MatchingService = Depends(get_matching_service),
) -> DonorService:
    return DonorService(repo, user_repo, request_repo, matching_service)


def get_caregiver_service(
    repo: CaregiverRepository = Depends(get_caregiver_repository),
    user_repo: UserRepository = Depends(get_user_repository),
    inventory_repo: InventoryRepository = Depends(get_inventory_repository),
    institution_repo: InstitutionRepository = Depends(get_institution_repository),
    request_repo: RequestRepository = Depends(get_request_repository),
    payment_repo: PaymentRepository = Depends(get_payment_repository),
    blood_bag_repo: BloodBagRepository = Depends(get_blood_bag_repository),
) -> CaregiverService:
    return CaregiverService(
        repo,
        user_repo,
        inventory_repo=inventory_repo,
        institution_repo=institution_repo,
        request_repo=request_repo,
        payment_repo=payment_repo,
        blood_bag_repo=blood_bag_repo,
    )


def get_payment_service(
    repo: PaymentRepository = Depends(get_payment_repository),
    request_repo: RequestRepository = Depends(get_request_repository),
) -> PaymentService:
    return PaymentService(repo, request_repo)


def get_blood_bag_service(
    repo: BloodBagRepository = Depends(get_blood_bag_repository),
    audit_service: AuditService = Depends(get_audit_service),
) -> BloodBagService:
    return BloodBagService(repo, audit_service)


def get_device_token_service(
    repo: DeviceTokenRepository = Depends(get_device_token_repository),
) -> DeviceTokenService:
    return DeviceTokenService(repo)


def reset_all_repositories() -> None:
    for factory in [
        _memory_user_repository,
        _memory_request_repository,
        _memory_inventory_repository,
        _memory_notification_repository,
        _memory_audit_repository,
        _memory_document_repository,
        _memory_status_history_repository,
        _memory_institution_repository,
        _memory_donor_repository,
        _memory_caregiver_repository,
        _memory_payment_repository,
        _memory_blood_bag_repository,
        _memory_device_token_repository,
    ]:
        factory.cache_clear()
    OTPService.reset_store()
    _refresh_store.items.clear()
    _password_reset_store.items.clear()
