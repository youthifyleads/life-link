import { apiClient } from "@/shared/api/http-client";

export interface AcceptRequestBody {
  unit_price: number;
}

export async function acceptRequest(
  requestId: string,
  body: AcceptRequestBody,
) {
  const response = await apiClient.post<void>(
    `/requests/${encodeURIComponent(requestId)}/accept`,
    body,
  );

  return response.data;
}
