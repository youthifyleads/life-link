from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token, verify_password
from app.repositories.interfaces.user_repository import UserRepository
from app.repositories.models import UserRecord
from app.services.audit_service import AuditService


class AuthService:
    def __init__(self, user_repo: UserRepository, audit_service: AuditService):
        self._user_repo = user_repo
        self._audit_service = audit_service

    async def authenticate(self, email: str, password: str) -> tuple[UserRecord, str]:
        user = await self._user_repo.get_by_email(email)
        if user is None or not user.is_active or not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password", code="INVALID_CREDENTIALS")

        token = create_access_token(subject=user.id, role=user.role.value)
        await self._audit_service.record(actor_user_id=user.id, action="LOGIN", details=f"user {user.email} logged in")
        return user, token
