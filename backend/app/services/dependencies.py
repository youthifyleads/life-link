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
from app.repositories.memory.audit_repository import InMemoryAuditRepository
from app.repositories.memory.inventory_repository import InMemoryInventoryRepository
from app.repositories.memory.notification_repository import InMemoryNotificationRepository
from app.repositories.memory.request_repository import InMemoryRequestRepository
from app.repositories.memory.user_repository import InMemoryUserRepository
from app.repositories.memory.document_repository import InMemoryDocumentRepository
from app.repositories.memory.status_history_repository import InMemoryStatusHistoryRepository
from app.repositories.memory.institution_repository import InMemoryInstitutionRepository
from app.repositories.sqlalchemy.audit_repository import SQLAlchemyAuditRepository
from app.repositories.sqlalchemy.inventory_repository import SQLAlchemyInventoryRepository
from app.repositories.sqlalchemy.notification_repository import SQLAlchemyNotificationRepository
from app.repositories.sqlalchemy.request_repository import SQLAlchemyRequestRepository
from app.repositories.sqlalchemy.user_repository import SQLAlchemyUserRepository
from app.repositories.sqlalchemy.document_repository import SQLAlchemyDocumentRepository
from app.repositories.sqlalchemy.status_history_repository import SQLAlchemyStatusHistoryRepository
from app.repositories.sqlalchemy.institution_repository import SQLAlchemyInstitutionRepository


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


def use_sql() -> bool:
    return get_settings().REPOSITORY_BACKEND.lower() in {"sql", "sqlserver", "database"}


async def _repo_or_memory(sql_factory, memory_factory) -> AsyncIterator:
    if not use_sql():
        yield memory_factory()
        return
    async with get_session_factory()() as session:
        yield sql_factory(session)


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


def reset_all_repositories() -> None:
    _memory_user_repository.cache_clear()
    _memory_request_repository.cache_clear()
    _memory_inventory_repository.cache_clear()
    _memory_notification_repository.cache_clear()
    _memory_audit_repository.cache_clear()
    _memory_document_repository.cache_clear()
    _memory_status_history_repository.cache_clear()
    _memory_institution_repository.cache_clear()


from app.services.audit_service import AuditService
from app.services.auth_service import AuthService
from app.services.document_service import DocumentService
from app.services.inventory_service import InventoryService
from app.services.notification_service import NotificationService
from app.services.qr_service import QRService
from app.services.request_service import RequestService


def get_audit_service(audit_repo: AuditRepository = Depends(get_audit_repository)) -> AuditService:
    return AuditService(audit_repo)


def get_notification_service(notification_repo: NotificationRepository = Depends(get_notification_repository)) -> NotificationService:
    return NotificationService(notification_repo)


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    audit_service: AuditService = Depends(get_audit_service),
) -> AuthService:
    return AuthService(user_repo, audit_service)


def get_qr_service(
    request_repo: RequestRepository = Depends(get_request_repository),
    audit_service: AuditService = Depends(get_audit_service),
) -> QRService:
    return QRService(request_repo, audit_service)


def get_request_service(
    request_repo: RequestRepository = Depends(get_request_repository),
    qr_service: QRService = Depends(get_qr_service),
    notification_service: NotificationService = Depends(get_notification_service),
    audit_service: AuditService = Depends(get_audit_service),
    status_history_repo: StatusHistoryRepository = Depends(get_status_history_repository),
) -> RequestService:
    return RequestService(request_repo, qr_service, notification_service, audit_service, status_history_repo)


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
