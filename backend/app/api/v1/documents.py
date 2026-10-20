from fastapi import APIRouter, Depends, File, UploadFile, Response

from app.api.deps import load_user_record
from app.core.exceptions import NotFoundError
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
    record = await service.save_upload(request_id, user_record, file.filename or "document", file.content_type, data)
    return service.to_public_dto(record)


@router.get("/requests/{request_id}/documents", response_model=list[DocumentPublic], summary="List supporting documents")
async def list_documents(
    request_id: str, 
    current_user: CurrentUser, 
    user_record=Depends(load_user_record), 
    service: DocumentService = Depends(get_document_service)
):
    records = await service.list_for_request(request_id, user_record)
    return [service.to_public_dto(r) for r in records]


@router.post("/documents/{document_id}/review", response_model=DocumentPublic, summary="Approve or reject a supporting document")
async def review_document(
    document_id: str, 
    payload: DocumentReview, 
    current_user: CurrentUser, 
    user_record=Depends(load_user_record), 
    service: DocumentService = Depends(get_document_service)
):
    record = await service.review(document_id, user_record, payload.approved, payload.reason)
    return service.to_public_dto(record)


@router.delete("/documents/{document_id}", status_code=204, summary="Delete an unapproved supporting document")
async def delete_document(
    document_id: str, 
    current_user: CurrentUser, 
    user_record=Depends(load_user_record), 
    service: DocumentService = Depends(get_document_service)
):
    await service.delete(document_id, user_record)


@router.delete("/requests/{request_id}/documents/{document_id}", status_code=204, summary="Delete an unapproved supporting document")
async def delete_request_document(
    request_id: str,
    document_id: str, 
    current_user: CurrentUser, 
    user_record=Depends(load_user_record), 
    service: DocumentService = Depends(get_document_service)
):
    await service.delete(document_id, user_record)


@router.get("/documents/{document_id}/content", summary="Stream supporting document content")
async def get_document_content(
    document_id: str,
    download: bool = False,
    service: DocumentService = Depends(get_document_service),
):
    doc = await service.get_document_by_id_internal(document_id)
    if not doc:
        raise NotFoundError("Supporting document was not found", code="DOCUMENT_NOT_FOUND")

    data = await service.get_document_bytes(doc)
    media_type = doc.file_type or "application/octet-stream"
    disposition = "attachment" if download else "inline"
    filename = doc.file_name or "document"
    
    return Response(
        content=data,
        media_type=media_type,
        headers={
            "Content-Disposition": f'{disposition}; filename="{filename}"',
            "Cache-Control": "public, max-age=86400",
        },
    )
