import { apiClient } from "@/shared/api/http-client";

export interface AllocateBagRequestBody {
  barcode: string;
}

export interface DeallocateBagRequestBody {
  barcode: string;
  reason: string;
}

export async function allocateBag(
  requestId: string,
  body: AllocateBagRequestBody,
) {
  const response = await apiClient.post<void>(
    `/requests/${encodeURIComponent(requestId)}/allocate-bag`,
    body,
  );

  return response.data;
}

export async function deallocateBag(
  requestId: string,
  body: DeallocateBagRequestBody,
) {
  const response = await apiClient.post<void>(
    `/requests/${encodeURIComponent(requestId)}/deallocate-bag`,
    body,
  );

  return response.data;
}
