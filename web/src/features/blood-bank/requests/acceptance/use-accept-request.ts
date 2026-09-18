import { useMutation } from "@tanstack/react-query";

import {
  acceptRequest,
  type AcceptRequestBody,
} from "@/features/blood-bank/requests/acceptance/request-accept-pricing.api";

export function useAcceptRequest(requestId: string) {
  return useMutation({
    mutationFn: (body: AcceptRequestBody) => acceptRequest(requestId, body),
  });
}
