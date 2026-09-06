from fastapi import APIRouter, Depends, File, UploadFile

from app.core.security import CurrentUser
from app.repositories.interfaces.user_repository import UserRepository
from app.schemas.documents import DocumentPublic, DocumentReview
from app.services.dependencies import get_document_service, get_user_repository
from app.services.document_service import DocumentService

router = APIRouter(tags=["Supporting Documents"])


async def _load_user_record(current_user: CurrentUser, user_repo: UserRepository = Depends(get_user_repository)):
    return await user_repo.get_by_id(current_user.id)


@router.post("/requests/{request_id}/documents", response_model=DocumentPublic, status_code=201, summary="Upload a supporting document")
async def upload_document(
    request_id: str, 
    file: UploadFile = File(...), 
    current_user: CurrentUser = [1mNone[0m, # العودة للتعريف الأصلي السليم
    user_record=Depends(_load_user_record), 
    service: DocumentService = Depends(get_document_service)
):
    # لو الـ CurrentUser بيتعبأ أوتوماتيك من الـ Middleware أو الـ Dependency الأصلية للمشروع:
    data = await file.read()
    return await service.save_upload(request_id, user_record, file.filename or "document", file.content_type, data)


@router.get("/requests/{request_id}/documents", response_model=list[DocumentPublic], summary="List supporting documents")
async def list_documents(
    request_id: str, 
    current_user: CurrentUser = None, 
    user_record=Depends(_load_user_record), 
    service: DocumentService = Depends(get_document_service)
):
    return await service.list_for_request(request_id, user_record)


@router.post("/documents/{document_id}/review", response_model=DocumentPublic, summary="Approve or reject a supporting document")
async def review_document(
    document_id: str, 
    payload: DocumentReview, 
    current_user: CurrentUser = None, 
    user_record=Depends(_load_user_record), 
    service: DocumentService = Depends(get_document_service)
):
    return await service.review(document_id, user_record, payload.approved, payload.reason)
