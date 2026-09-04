"""
Dependency-injection wiring.

This is the ONLY place that decides which repository implementation is
used. Today it wires up the in-memory repositories. When the SQL Server
implementations exist, swap the constructors below (or branch on
settings.ENVIRONMENT) - routers and services never import the memory
repositories directly, so nothing else needs to change.
"""
from functools import lru_cache

from app.repositories.interfaces.audit_repository import AuditRepository
from app.repositories.interfaces.inventory_repository import InventoryRepository
from app.repositories.interfaces.notification_repository import NotificationRepository
from app.repositories.interfaces.request_repository import RequestRepository
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.memory.audit_repository import InMemoryAuditRepository
from app.repositories.memory.inventory_repository import InMemoryInventoryRepository
from app.repositories.memory.notification_repository import InMemoryNotificationRepository
from app.repositories.memory.request_repository import InMemoryRequestRepository
from app.repositories.memory.user_repository import InMemoryUserRepository


@lru_cache
def get_user_repository() -> UserRepository:
    return InMemoryUserRepository()


@lru_cache
def get_request_repository() -> RequestRepository:
    return InMemoryRequestRepository()


@lru_cache
def get_inventory_repository() -> InventoryRepository:
    return InMemoryInventoryRepository()


@lru_cache
def get_notification_repository() -> NotificationRepository:
    return InMemoryNotificationRepository()


@lru_cache
def get_audit_repository() -> AuditRepository:
    return InMemoryAuditRepository()


def reset_all_repositories() -> None:
    """Used by tests to get a clean slate between test cases."""
    get_user_repository.cache_clear()
    get_request_repository.cache_clear()
    get_inventory_repository.cache_clear()
    get_notification_repository.cache_clear()
    get_audit_repository.cache_clear()


# --- Service-layer providers -------------------------------------------------
# Services are cheap to construct, so they are built fresh per-request from
# the (cached/singleton) repositories rather than cached themselves.

from fastapi import Depends  # noqa: E402

from app.services.audit_service import AuditService  # noqa: E402
from app.services.auth_service import AuthService  # noqa: E402
from app.services.inventory_service import InventoryService  # noqa: E402
from app.services.notification_service import NotificationService  # noqa: E402
from app.services.qr_service import QRService  # noqa: E402
from app.services.request_service import RequestService  # noqa: E402


def get_audit_service(audit_repo=Depends(get_audit_repository)) -> AuditService:
    return AuditService(audit_repo)


def get_notification_service(notification_repo=Depends(get_notification_repository)) -> NotificationService:
    return NotificationService(notification_repo)


def get_auth_service(
    user_repo=Depends(get_user_repository),
    audit_service: AuditService = Depends(get_audit_service),
) -> AuthService:
    return AuthService(user_repo, audit_service)


def get_qr_service(
    request_repo=Depends(get_request_repository),
    audit_service: AuditService = Depends(get_audit_service),
) -> QRService:
    return QRService(request_repo, audit_service)


def get_request_service(
    request_repo=Depends(get_request_repository),
    qr_service: QRService = Depends(get_qr_service),
    notification_service: NotificationService = Depends(get_notification_service),
    audit_service: AuditService = Depends(get_audit_service),
) -> RequestService:
    return RequestService(request_repo, qr_service, notification_service, audit_service)


def get_inventory_service(
    inventory_repo=Depends(get_inventory_repository),
    audit_service: AuditService = Depends(get_audit_service),
) -> InventoryService:
    return InventoryService(inventory_repo, audit_service)
