import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createHospitalRequest,
  getAvailableBloodBanks,
  getHospitalAllDocuments,
  getHospitalRequest,
  getHospitalRequests,
  rerouteHospitalRequest,
  uploadHospitalDocumentToRequest,
} from "@/features/hospital/requests/hospital-requests.mock";
import type { HospitalRequestInput } from "@/features/hospital/types/hospital.types";
import { queryClient } from "@/app/providers/query-client";

export const hospitalRequestKeys = {
  all: ["hospital", "requests"] as const,
  detail: (id: string) => ["hospital", "requests", id] as const,
  bloodBanks: ["hospital", "available-blood-banks"] as const,
  documents: ["hospital", "documents"] as const,
};

export function useHospitalRequests() {
  return useQuery({
    queryKey: hospitalRequestKeys.all,
    queryFn: getHospitalRequests,
  });
}

export function useAvailableBloodBanks() {
  return useQuery({
    queryKey: hospitalRequestKeys.bloodBanks,
    queryFn: getAvailableBloodBanks,
  });
}

export function useHospitalRequest(id: string) {
  return useQuery({
    queryKey: hospitalRequestKeys.detail(id),
    queryFn: () => getHospitalRequest(id),
  });
}

export function useHospitalAllDocuments() {
  return useQuery({
    queryKey: hospitalRequestKeys.documents,
    queryFn: getHospitalAllDocuments,
  });
}

export function useCreateHospitalRequest(shouldFail = false) {
  return useMutation({
    mutationFn: (input: HospitalRequestInput) =>
      createHospitalRequest(input, shouldFail),
    onSuccess: (request) => {
      queryClient.setQueryData(hospitalRequestKeys.detail(request.id), request);
      void queryClient.invalidateQueries({ queryKey: hospitalRequestKeys.all });
      void queryClient.invalidateQueries({ queryKey: hospitalRequestKeys.documents });
    },
  });
}

export function useRerouteHospitalRequest() {
  return useMutation({
    mutationFn: ({
      requestId,
      newBloodBankId,
      notes,
    }: {
      requestId: string;
      newBloodBankId: string;
      notes?: string;
    }) => rerouteHospitalRequest(requestId, newBloodBankId, notes),
    onSuccess: (updated) => {
      queryClient.setQueryData(hospitalRequestKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: hospitalRequestKeys.all });
      void queryClient.invalidateQueries({ queryKey: hospitalRequestKeys.documents });
    },
  });
}

export function useUploadHospitalDocument() {
  return useMutation({
    mutationFn: ({
      requestId,
      file,
    }: {
      requestId: string;
      file: { name: string; sizeBytes: number; mimeType: string };
    }) => uploadHospitalDocumentToRequest(requestId, file),
    onSuccess: (result) => {
      queryClient.setQueryData(hospitalRequestKeys.detail(result.request.id), result.request);
      void queryClient.invalidateQueries({ queryKey: hospitalRequestKeys.all });
      void queryClient.invalidateQueries({ queryKey: hospitalRequestKeys.documents });
    },
  });
}
