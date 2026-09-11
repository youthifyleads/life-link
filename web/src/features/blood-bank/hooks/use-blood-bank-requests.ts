import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  allocateUnitsToRequest,
  deallocateUnitFromRequest,
  getBloodBankAllDocuments,
  getBloodBankOperationalSnapshot,
  getBloodBankRequestById,
  getBloodBankRequests,
  getBloodUnits,
  reserveUnitsForRequest,
  transitionBloodBankRequest,
  updateDocumentReviewStatus,
} from "@/features/blood-bank/requests/blood-bank-requests.mock";
import type {
  BloodBankRequest,
  BloodBankRequestAction,
  BloodUnitStatus,
  DocumentReviewStatus,
} from "@/features/blood-bank/types/blood-bank.types";
import type { BloodGroup } from "@/shared/components/clinical/clinical.types";

export const bloodBankRequestKeys = {
  all: ["blood-bank", "requests"] as const,
  detail: (id: string) => ["blood-bank", "requests", id] as const,
  snapshot: ["blood-bank", "operational-snapshot"] as const,
  documents: ["blood-bank", "documents"] as const,
  units: (params?: { bloodGroup?: BloodGroup; status?: BloodUnitStatus }) =>
    ["blood-bank", "units", params] as const,
};

export function useBloodBankRequests() {
  return useQuery({
    queryKey: bloodBankRequestKeys.all,
    queryFn: getBloodBankRequests,
  });
}

export function useBloodBankRequest(id: string) {
  return useQuery({
    queryKey: bloodBankRequestKeys.detail(id),
    queryFn: () => getBloodBankRequestById(id),
    enabled: Boolean(id),
  });
}

export function useBloodBankOperationalSnapshot() {
  return useQuery({
    queryKey: bloodBankRequestKeys.snapshot,
    queryFn: getBloodBankOperationalSnapshot,
  });
}

export function useBloodUnits(params?: {
  bloodGroup?: BloodGroup;
  status?: BloodUnitStatus;
}) {
  return useQuery({
    queryKey: bloodBankRequestKeys.units(params),
    queryFn: () => getBloodUnits(params),
  });
}

export function useTransitionBloodBankRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      action,
      note,
      rejectReason,
    }: {
      requestId: string;
      action: BloodBankRequestAction;
      note?: string;
      rejectReason?: string;
    }) => transitionBloodBankRequest(requestId, action, { note, rejectReason }),
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData(
        bloodBankRequestKeys.all,
        (current: BloodBankRequest[] | undefined) =>
          current?.map((request) =>
            request.id === updatedRequest.id ? updatedRequest : request,
          ) ?? [updatedRequest],
      );
      queryClient.setQueryData(
        bloodBankRequestKeys.detail(updatedRequest.id),
        updatedRequest,
      );
      void queryClient.invalidateQueries({
        queryKey: ["blood-bank", "units"],
      });
      void queryClient.invalidateQueries({
        queryKey: bloodBankRequestKeys.snapshot,
      });
    },
  });
}

export function useAllocateUnits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      unitIds,
    }: {
      requestId: string;
      unitIds: string[];
    }) => allocateUnitsToRequest(requestId, unitIds),
    onSuccess: ({ request }) => {
      queryClient.setQueryData(bloodBankRequestKeys.detail(request.id), request);
      queryClient.setQueryData(
        bloodBankRequestKeys.all,
        (current: BloodBankRequest[] | undefined) =>
          current?.map((r) => (r.id === request.id ? request : r)),
      );
      void queryClient.invalidateQueries({
        queryKey: ["blood-bank", "units"],
      });
      void queryClient.invalidateQueries({
        queryKey: bloodBankRequestKeys.snapshot,
      });
    },
  });
}

export function useReserveUnits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      unitIds,
    }: {
      requestId: string;
      unitIds: string[];
    }) => reserveUnitsForRequest(requestId, unitIds),
    onSuccess: ({ request }) => {
      queryClient.setQueryData(bloodBankRequestKeys.detail(request.id), request);
      queryClient.setQueryData(
        bloodBankRequestKeys.all,
        (current: BloodBankRequest[] | undefined) =>
          current?.map((r) => (r.id === request.id ? request : r)),
      );
      void queryClient.invalidateQueries({
        queryKey: ["blood-bank", "units"],
      });
      void queryClient.invalidateQueries({
        queryKey: bloodBankRequestKeys.snapshot,
      });
    },
  });
}

export function useDeallocateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      unitId,
    }: {
      requestId: string;
      unitId: string;
    }) => deallocateUnitFromRequest(requestId, unitId),
    onSuccess: ({ request }) => {
      queryClient.setQueryData(bloodBankRequestKeys.detail(request.id), request);
      queryClient.setQueryData(
        bloodBankRequestKeys.all,
        (current: BloodBankRequest[] | undefined) =>
          current?.map((r) => (r.id === request.id ? request : r)),
      );
      void queryClient.invalidateQueries({
        queryKey: ["blood-bank", "units"],
      });
      void queryClient.invalidateQueries({
        queryKey: bloodBankRequestKeys.snapshot,
      });
    },
  });
}

export function useBloodBankAllDocuments() {
  return useQuery({
    queryKey: bloodBankRequestKeys.documents,
    queryFn: getBloodBankAllDocuments,
  });
}

export function useUpdateDocumentReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      documentId,
      status,
    }: {
      requestId: string;
      documentId: string;
      status: DocumentReviewStatus;
    }) => updateDocumentReviewStatus(requestId, documentId, status),
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData(
        bloodBankRequestKeys.detail(updatedRequest.id),
        updatedRequest,
      );
      queryClient.setQueryData(
        bloodBankRequestKeys.all,
        (current: BloodBankRequest[] | undefined) =>
          current?.map((r) => (r.id === updatedRequest.id ? updatedRequest : r)),
      );
      void queryClient.invalidateQueries({
        queryKey: bloodBankRequestKeys.documents,
      });
    },
  });
}
