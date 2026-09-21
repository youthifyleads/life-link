import type { BloodBagCustodyHistory } from "@/features/blood-bank/custody/blood-bag-custody.types";
import { apiClient } from "@/shared/api/http-client";

export async function getBloodBagCustodyHistory(bagId: string) {
  const response = await apiClient.get<BloodBagCustodyHistory>(
    `/blood-bags/${encodeURIComponent(bagId)}/history`,
  );

  return response.data;
}
