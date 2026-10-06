import { apiClient } from "@/shared/api/http-client";
import type { SupportingDocument } from "@/features/hospital/types/hospital.types";

export interface BackendDocumentDTO {
  id: string;
  blood_request_id?: string;
  request_id?: string;
  file_name: string;
  file_type?: string | null;
  file_size_bytes?: number;
  status?: string;
  document_type?: string;
  uploaded_by?: string;
  uploaded_at: string;
  download_url?: string;
}

export function mapBackendDtoToSupportingDocument(dto: BackendDocumentDTO): SupportingDocument {
  return {
    id: dto.id,
    name: dto.file_name,
    sizeBytes: dto.file_size_bytes ?? 245_000,
    mimeType: dto.file_type || "application/pdf",
    uploadedAt: dto.uploaded_at,
    reviewStatus:
      dto.status?.toLowerCase() === "accepted"
        ? "accepted"
        : dto.status?.toLowerCase() === "rejected"
          ? "changes_requested"
          : "pending",
    source: "local_preview",
  };
}

export const documentsApi = {
  async uploadDocument(
    requestId: string,
    file: File | Blob,
    fileName?: string,
  ): Promise<SupportingDocument> {
    const formData = new FormData();
    if (file instanceof File) {
      formData.append("file", file, fileName || file.name);
    } else {
      formData.append("file", file, fileName || "clinical-document.pdf");
    }

    try {
      const { data } = await apiClient.post<BackendDocumentDTO>(
        `/requests/${requestId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return mapBackendDtoToSupportingDocument(data);
    } catch {
      // Fallback in case backend uses /documents/upload
      const { data } = await apiClient.post<BackendDocumentDTO>(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return mapBackendDtoToSupportingDocument(data);
    }
  },

  async getRequestDocuments(requestId: string): Promise<SupportingDocument[]> {
    try {
      const { data } = await apiClient.get<BackendDocumentDTO[]>(`/requests/${requestId}/documents`);
      return data.map(mapBackendDtoToSupportingDocument);
    } catch {
      const { data } = await apiClient.get<BackendDocumentDTO[]>(`/documents/request/${requestId}`);
      return data.map(mapBackendDtoToSupportingDocument);
    }
  },

  async getDocumentDownloadUrl(documentId: string): Promise<{ downloadUrl: string }> {
    const { data } = await apiClient.get<{ download_url: string }>(`/documents/${documentId}`);
    return {
      downloadUrl: data.download_url,
    };
  },
};

