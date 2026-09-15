import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  computeBloodStockMatrix,
  computeInventoryKPIs,
  computeInventoryWarnings,
  getBloodStockMatrix,
  getInventoryKPIs,
  getInventoryUnits,
  getInventoryWarnings,
  lookupBloodUnit,
  registerBloodUnits,
  updateBloodUnitStatus,
} from "@/features/blood-bank/inventory/inventory.mock";
import type {
  BloodUnitIntakePayload,
  BloodUnitStatus,
  InventoryLedgerFilters,
} from "@/features/blood-bank/types/blood-bank.types";

import { inventoryApi } from "@/features/blood-bank/api/inventory.api";
import { getAccessToken } from "@/shared/api/auth-token";

export const inventoryKeys = {
  all: ["blood-bank", "inventory"] as const,
  list: (filters?: Partial<InventoryLedgerFilters>) =>
    ["blood-bank", "inventory", "list", filters] as const,
  kpis: ["blood-bank", "inventory", "kpis"] as const,
  matrix: ["blood-bank", "inventory", "matrix"] as const,
  warnings: ["blood-bank", "inventory", "warnings"] as const,
  tracking: (id: string) => ["blood-bank", "tracking", id] as const,
};

export function useInventoryUnits(filters?: Partial<InventoryLedgerFilters>) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: async () => {
      if (getAccessToken()) {
        try {
          const liveData = await inventoryApi.getInventory(filters);
          if (liveData && liveData.length > 0) return liveData;
        } catch (err) {
          console.warn("Live inventory fetch fallback:", err);
        }
      }
      return getInventoryUnits(filters);
    },
  });
}

export function useInventoryKPIs() {
  const { data: units } = useInventoryUnits();

  return useQuery({
    queryKey: [...inventoryKeys.kpis, units?.length],
    queryFn: async () => {
      if (units && units.length > 0) {
        return computeInventoryKPIs(units);
      }
      return getInventoryKPIs();
    },
  });
}

export function useBloodStockMatrix() {
  const { data: units } = useInventoryUnits();

  return useQuery({
    queryKey: [...inventoryKeys.matrix, units?.length],
    queryFn: async () => {
      if (units && units.length > 0) {
        return computeBloodStockMatrix(units);
      }
      return getBloodStockMatrix();
    },
  });
}

export function useInventoryWarnings() {
  const { data: units } = useInventoryUnits();

  return useQuery({
    queryKey: [...inventoryKeys.warnings, units?.length],
    queryFn: async () => {
      if (units && units.length > 0) {
        return computeInventoryWarnings(units);
      }
      return getInventoryWarnings();
    },
  });
}

export function useLookupBloodUnit(idOrQr: string) {
  return useQuery({
    queryKey: inventoryKeys.tracking(idOrQr),
    queryFn: async () => {
      if (getAccessToken()) {
        try {
          const liveUnit = await inventoryApi.getBagByBarcode(idOrQr);
          if (liveUnit) return liveUnit;
        } catch {
          // fallback to lookupBloodUnit
        }
      }
      return lookupBloodUnit(idOrQr);
    },
    enabled: Boolean(idOrQr.trim()),
  });
}

export function useRegisterBloodUnits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BloodUnitIntakePayload) => {
      if (getAccessToken()) {
        try {
          return [await inventoryApi.registerUnit(payload)];
        } catch (err) {
          console.warn("Live intake fallback:", err);
        }
      }
      return registerBloodUnits(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["blood-bank"] });
    },
  });
}

export function useUpdateUnitStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      unitId,
      status,
      location,
      notes,
    }: {
      unitId: string;
      status: BloodUnitStatus;
      location?: string;
      notes?: string;
    }) => {
      if (getAccessToken()) {
        try {
          return await inventoryApi.updateUnitStatus(unitId, status, notes, location);
        } catch (err) {
          console.warn("Live update status fallback:", err);
        }
      }
      return updateBloodUnitStatus(unitId, status, location, notes);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["blood-bank"] });
    },
  });
}
