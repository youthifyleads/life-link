import { useQuery } from "@tanstack/react-query";

import { getBloodBagCustodyHistory } from "@/features/blood-bank/custody/blood-bag-custody.api";

export const bloodBagCustodyKeys = {
  history: (bagId: string) => ["blood-bank", "blood-bags", bagId, "history"] as const,
};

export function useBloodBagCustodyHistory(bagId?: string) {
  return useQuery({
    queryKey: bloodBagCustodyKeys.history(bagId ?? ""),
    queryFn: () => getBloodBagCustodyHistory(bagId ?? ""),
    enabled: Boolean(bagId),
  });
}
