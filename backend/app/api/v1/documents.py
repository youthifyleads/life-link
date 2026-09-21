from fastapi import APIRouter, Depends, File, UploadFile

from app.api.deps import load_user_record
from app.core.security import CurrentUser
from app.schemas.documents import DocumentPublic, DocumentReview
from app.services.dependencies import get_document_service
from app.services.document_service import DocumentService

router = APIRouter(tags=["Supporting Documents"])


@router.post("/requests/{request_id}/documents", response_model=DocumentPublic, status_code=201, summary="Upload a supporting document")
async def upload_document(
    request_id: str, 
    current_user: CurrentUser, 
    file: UploadFile = File(...), 
    user_record=Depends(load_user_record), 
    service: DocumentService = Depends(get_document_service)
):
    data = await file.read()
    return await service.save_upload(request_id, user_record, file.filename or "document", file.content_type, data)


@router.get("/requests/{request_id}/documents", response_model=list[DocumentPublic], summary="List supporting documents")
async def list_documents(
    request_id: str, 
    current_user: CurrentUser, 
    user_record=Depends(load_user_record), 
    service: DocumentService = Depends(get_document_service)
):
    return await service.list_for_request(request_id, user_record)


@router.post("/documents/{document_id}/review", response_model=DocumentPublic, summary="Approve or reject a supporting document")
async def review_document(
    document_id: str, 
    payload: DocumentReview, 
    current_user: CurrentUser, 
    user_record=Depends(load_user_record), 
    service: DocumentService = Depends(get_document_service)
):
    return await service.review(document_id, user_record, payload.approved, payload.reason)
