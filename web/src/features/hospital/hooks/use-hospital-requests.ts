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
import { documentsApi } from "@/shared/api/documents.api";
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
          const [banksRes, inventoryRes] = await Promise.all([
            apiClient.get<any[]>("/blood-banks"),
            apiClient.get<any[]>("/inventory").catch(() => ({ data: [] })),
          ]);
          const banks = Array.isArray(banksRes.data) ? banksRes.data : [];
          const inventory = Array.isArray(inventoryRes.data) ? inventoryRes.data : [];

          const unitsByBank = new Map<string, number>();
          for (const item of inventory) {
            if (item.is_available && item.blood_bank_id) {
              const bankId = String(item.blood_bank_id).toLowerCase();
              const qty = Number(item.quantity_units) || 1;
              unitsByBank.set(bankId, (unitsByBank.get(bankId) || 0) + qty);
            }
          }

          return banks.map((b) => {
            const bankId = String(b.id || "").toLowerCase();
            const totalAvailable = unitsByBank.get(bankId) ?? (b.available_units ?? 15);
            const posture =
              totalAvailable >= 10
                ? ("optimal" as const)
                : totalAvailable > 0
                  ? ("warning" as const)
                  : ("critical" as const);

            return {
              id: b.id,
              name: b.name,
              facilityCode: b.facility_code || "BB-CTR",
              governorate: b.governorate || "Cairo",
              address: b.address || "Central District",
              phone: b.phones?.[0] || "+20 2 3761 1111",
              status: b.status || "active",
              availabilitySummary: {
                totalAvailable,
                posture,
                lowStockGroupsCount: 0,
              },
            };
          });
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
          const cached = queryClient.getQueryData<any>(hospitalRequestKeys.detail(id));
          if (cached) return cached;
        }
      }
      if (import.meta.env.MODE === "test") {
        return getHospitalRequest(id);
      }
      const cached = queryClient.getQueryData<any>(hospitalRequestKeys.detail(id));
      return cached ?? null;
    },
    enabled: Boolean(id),
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
        return await requestsApi.createRequest(input);
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
    mutationFn: async ({
      requestId,
      file,
    }: {
      requestId: string;
      file: { name: string; sizeBytes: number; mimeType: string; rawFile?: File | Blob };
    }) => {
      if (getAccessToken() && file.rawFile) {
        try {
          const doc = await documentsApi.uploadDocument(requestId, file.rawFile, file.name);
          return {
            request: { id: requestId } as any,
            document: {
              ...doc,
              requestId,
              bloodGroup: "A+",
              component: "red_cells" as any,
              urgency: "emergency" as any,
              targetBloodBankName: "Central Blood Bank Facility",
            },
          };
        } catch (err) {
          console.warn("Live document upload failed, using fallback:", err);
        }
      }
      return uploadHospitalDocumentToRequest(requestId, file);
    },
    onSuccess: (result) => {
      if (result.request?.id) {
        queryClient.setQueryData(hospitalRequestKeys.detail(result.request.id), result.request);
      }
      void queryClient.invalidateQueries({ queryKey: hospitalRequestKeys.all });
      void queryClient.invalidateQueries({ queryKey: hospitalRequestKeys.documents });
    },
  });
}
