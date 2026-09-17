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

import { apiClient } from "@/shared/api/http-client";
import { requestsApi } from "@/shared/api/requests.api";
import { getAccessToken } from "@/shared/api/auth-token";

export const hospitalRequestKeys = {
  all: ["hospital", "requests"] as const,
  detail: (id: string) => ["hospital", "requests", id] as const,
  bloodBanks: ["hospital", "available-blood-banks"] as const,
  documents: ["hospital", "documents"] as const,
};

export function useHospitalRequests() {
  return useQuery({
    queryKey: hospitalRequestKeys.all,
    queryFn: async () => {
      if (getAccessToken()) {
        try {
          const liveData = await requestsApi.getRequests();
          return liveData || [];
        } catch (err) {
          console.warn("Live requests fetch failed:", err);
          return [];
        }
      }
      if (import.meta.env.MODE === "test") {
        return getHospitalRequests();
      }
      return [];
    },
  });
}

export function useAvailableBloodBanks() {
  return useQuery({
    queryKey: hospitalRequestKeys.bloodBanks,
    queryFn: async () => {
      if (getAccessToken()) {
        try {
          const { data } = await apiClient.get<any[]>("/blood-banks");
          if (Array.isArray(data)) {
            return data.map((b) => ({
              id: b.id,
              name: b.name,
              facilityCode: b.facility_code || "BB-CTR",
              governorate: b.governorate || "Cairo",
              address: b.address || "Central District",
              phone: b.phones?.[0] || "+20 2 3761 1111",
              status: b.status || "active",
              availabilitySummary: {
                totalAvailable: b.available_units ?? 0,
                posture: "optimal" as const,
                lowStockGroupsCount: 0,
              },
            }));
          }
        } catch (err) {
          console.warn("Live blood banks fetch failed:", err);
          return [];
        }
      }
      if (import.meta.env.MODE === "test") {
        return getAvailableBloodBanks();
      }
      return [];
    },
  });
}

export function useHospitalRequest(id: string) {
  return useQuery({
    queryKey: hospitalRequestKeys.detail(id),
    queryFn: async () => {
      if (getAccessToken()) {
        try {
          return await requestsApi.getRequestById(id);
        } catch (err) {
          console.warn("Live request detail failed:", err);
        }
      }
      if (import.meta.env.MODE === "test") {
        return getHospitalRequest(id);
      }
      return null;
    },
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
    mutationFn: async (input: HospitalRequestInput) => {
      if (getAccessToken() && !shouldFail) {
        try {
          return await requestsApi.createRequest(input);
        } catch (err) {
          console.warn("Live create request fallback:", err);
        }
      }
      return createHospitalRequest(input, shouldFail);
    },
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
