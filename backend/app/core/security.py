from datetime import datetime,timedelta,timezone
import uuid
from typing import Annotated
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer
try:
 from jose import JWTError,jwt
except ImportError:
 import jwt
 JWTError=(jwt.InvalidTokenError,jwt.PyJWTError)
from app.core.config import get_settings
from app.core.domain import Role
from app.core.exceptions import ForbiddenError,UnauthorizedError
from app.core.hashing import hash_password,verify_password
from app.repositories.interfaces.user_repository import UserRepository
from app.schemas.users import UserPublic
security=HTTPBearer(auto_error=False)
def create_access_token(*,subject:str,role:str)->str:
 s=get_settings();now=datetime.now(timezone.utc);return jwt.encode({'sub':subject,'role':role,'iat':int(now.timestamp()),'jti':str(uuid.uuid4()),'type':'access','exp':now+timedelta(minutes=s.ACCESS_TOKEN_EXPIRE_MINUTES)},s.SECRET_KEY,algorithm=s.ALGORITHM)
def decode_access_token(token):
 s=get_settings()
 try:
  p=jwt.decode(token,s.SECRET_KEY,algorithms=[s.ALGORITHM])
  if p.get('type') not in (None,'access'):raise JWTError()
  return p
 except JWTError:raise UnauthorizedError('Invalid or expired access token',code='INVALID_TOKEN')
async def get_current_user(credentials:Annotated[HTTPAuthorizationCredentials|None,Depends(security)],repo:UserRepository=Depends(lambda:None))->UserPublic:
 if not credentials:raise UnauthorizedError('Authentication required',code='MISSING_TOKEN')
 # Resolve repository lazily to avoid circular import in annotations.
 from app.services.dependencies import get_user_repository
 payload=decode_access_token(credentials.credentials);sub=payload.get('sub')
 if not sub:raise UnauthorizedError('Invalid token subject',code='INVALID_TOKEN')
 gen=get_user_repository(); real_repo=await gen.__anext__()
 try:user=await real_repo.get_by_id(str(sub))
 finally:
  await gen.aclose()
 if not user:raise UnauthorizedError('User not found',code='INVALID_TOKEN')
 if user.status.lower() in {'banned','suspended'}:raise UnauthorizedError('This account has been banned.',code='ACCOUNT_BANNED')
 if not user.is_active:raise UnauthorizedError('This account is inactive.',code='ACCOUNT_INACTIVE')
 if not getattr(user,'email_verified',True):raise UnauthorizedError('Please verify your email before signing in.',code='EMAIL_NOT_VERIFIED')
 return UserPublic.model_validate(user)
CurrentUser=Annotated[UserPublic,Depends(get_current_user)]
def require_roles(*roles:Role):
 async def dep(current_user:CurrentUser):
  if current_user.role not in roles:raise ForbiddenError('You are not authorized for this action',code='FORBIDDEN_ROLE')
  return current_user
 return dep
def create_tracking_reference(request_id):
 s=get_settings();return jwt.encode({'sub':request_id,'typ':'tracking'},s.SECRET_KEY,algorithm=s.ALGORITHM)
def decode_tracking_reference(reference):
 s=get_settings()
 try:
  p=jwt.decode(reference,s.SECRET_KEY,algorithms=[s.ALGORITHM]);return str(p['sub']) if p.get('typ')=='tracking' else None
 except JWTError:return None
