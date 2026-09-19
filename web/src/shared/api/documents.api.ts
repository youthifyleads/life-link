import { apiClient } from "@/shared/api/http-client";
import type { SupportingDocument } from "@/features/hospital/types/hospital.types";

export interface BackendDocumentDTO {
  id: string;
  request_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  document_type: string;
  uploaded_by: string;
  uploaded_at: string;
  download_url?: string;
}

export function mapBackendDtoToSupportingDocument(dto: BackendDocumentDTO): SupportingDocument {
  return {
    id: dto.id,
    name: dto.file_name,
    sizeBytes: dto.file_size_bytes,
    mimeType: dto.file_type,
    uploadedAt: dto.uploaded_at,
    reviewStatus: "accepted",
    source: "local_preview",
  };
}

export const documentsApi = {
  async uploadDocument(
    requestId: string,
    file: File,
    documentType = "clinical_report",
  ): Promise<SupportingDocument> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("request_id", requestId);
    formData.append("document_type", documentType);

    const { data } = await apiClient.post<BackendDocumentDTO>("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return mapBackendDtoToSupportingDocument(data);
  },

  async getRequestDocuments(requestId: string): Promise<SupportingDocument[]> {
    const { data } = await apiClient.get<BackendDocumentDTO[]>(`/documents/request/${requestId}`);
    return data.map(mapBackendDtoToSupportingDocument);
  },

  async getDocumentDownloadUrl(documentId: string): Promise<{ downloadUrl: string }> {
    const { data } = await apiClient.get<{ download_url: string }>(`/documents/${documentId}`);
    return {
      downloadUrl: data.download_url,
    };
  },
};
