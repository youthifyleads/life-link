import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
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
    queryFn: () => getInventoryUnits(filters),
  });
}

export function useInventoryKPIs() {
  return useQuery({
    queryKey: inventoryKeys.kpis,
    queryFn: getInventoryKPIs,
  });
}

export function useBloodStockMatrix() {
  return useQuery({
    queryKey: inventoryKeys.matrix,
    queryFn: getBloodStockMatrix,
  });
}

export function useInventoryWarnings() {
  return useQuery({
    queryKey: inventoryKeys.warnings,
    queryFn: getInventoryWarnings,
  });
}

export function useLookupBloodUnit(idOrQr: string) {
  return useQuery({
    queryKey: inventoryKeys.tracking(idOrQr),
    queryFn: () => lookupBloodUnit(idOrQr),
    enabled: Boolean(idOrQr.trim()),
  });
}

export function useRegisterBloodUnits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BloodUnitIntakePayload) => registerBloodUnits(payload),
    onSuccess: () => {
      // Invalidate all inventory, tracking, and allocation queries across the workspace
      void queryClient.invalidateQueries({ queryKey: ["blood-bank"] });
    },
  });
}

export function useUpdateUnitStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      status,
      location,
      notes,
    }: {
      unitId: string;
      status: BloodUnitStatus;
      location?: string;
      notes?: string;
    }) => updateBloodUnitStatus(unitId, status, location, notes),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["blood-bank"] });
    },
  });
}
