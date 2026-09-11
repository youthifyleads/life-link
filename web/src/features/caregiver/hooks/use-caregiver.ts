import { useQuery } from "@tanstack/react-query";

import {
  getCaregiverDashboardUnits,
  lookupCaregiverUnit,
} from "@/features/caregiver/mocks/caregiver.mock";

export const caregiverKeys = {
  dashboard: ["caregiver", "dashboard"] as const,
  unit: (ref: string) => ["caregiver", "unit", ref] as const,
};

export function useCaregiverDashboardUnits() {
  return useQuery({
    queryKey: caregiverKeys.dashboard,
    queryFn: getCaregiverDashboardUnits,
  });
}

export function useCaregiverUnit(reference: string) {
  return useQuery({
    queryKey: caregiverKeys.unit(reference),
    queryFn: () => lookupCaregiverUnit(reference),
    enabled: Boolean(reference?.trim()),
  });
}
