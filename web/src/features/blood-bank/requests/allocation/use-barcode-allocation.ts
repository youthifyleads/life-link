import { useMutation } from "@tanstack/react-query";

import {
  allocateBag,
  deallocateBag,
  type AllocateBagRequestBody,
  type DeallocateBagRequestBody,
} from "@/features/blood-bank/requests/allocation/barcode-allocation.api";

export function useAllocateBag(requestId: string) {
  return useMutation({
    mutationFn: (body: AllocateBagRequestBody) => allocateBag(requestId, body),
  });
}

export function useDeallocateBag(requestId: string) {
  return useMutation({
    mutationFn: (body: DeallocateBagRequestBody) =>
      deallocateBag(requestId, body),
  });
}
