import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getDonationHistory,
  getDonationRequestById,
  getDonationRequests,
  getDonationVouchers,
  getDonorConsents,
  getDonorNotifications,
  getDonorProfile,
  grantDonorConsent,
  markNotificationRead,
  respondToDonationRequest,
  revokeDonorConsent,
} from "@/features/donor/mocks/donor.mock";
import type { DonationResponseStatus } from "@/features/donor/types/donor.types";

export const donorQueryKeys = {
  profile: ["donor", "profile"] as const,
  requests: ["donor", "requests"] as const,
  request: (id: string) => ["donor", "request", id] as const,
  donations: ["donor", "donations"] as const,
  vouchers: ["donor", "vouchers"] as const,
  notifications: ["donor", "notifications"] as const,
  consents: ["donor", "consents"] as const,
};

export function useDonorProfile() {
  return useQuery({
    queryKey: donorQueryKeys.profile,
    queryFn: getDonorProfile,
  });
}

export function useDonationRequests() {
  return useQuery({
    queryKey: donorQueryKeys.requests,
    queryFn: getDonationRequests,
  });
}

export function useDonationRequest(id: string) {
  return useQuery({
    queryKey: donorQueryKeys.request(id),
    queryFn: () => getDonationRequestById(id),
    enabled: Boolean(id),
  });
}

export function useRespondToDonationRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      response,
    }: {
      id: string;
      response: DonationResponseStatus;
    }) => respondToDonationRequest(id, response),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: donorQueryKeys.requests,
      });
      void queryClient.invalidateQueries({
        queryKey: donorQueryKeys.request(variables.id),
      });
      void queryClient.invalidateQueries({
        queryKey: donorQueryKeys.notifications,
      });
    },
  });
}

export function useDonationHistory() {
  return useQuery({
    queryKey: donorQueryKeys.donations,
    queryFn: getDonationHistory,
  });
}

export function useDonationVouchers() {
  return useQuery({
    queryKey: donorQueryKeys.vouchers,
    queryFn: getDonationVouchers,
  });
}

export function useDonorNotifications() {
  return useQuery({
    queryKey: donorQueryKeys.notifications,
    queryFn: getDonorNotifications,
  });
}

export function useDonorConsents() {
  return useQuery({
    queryKey: donorQueryKeys.consents,
    queryFn: getDonorConsents,
  });
}

export function useGrantConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => grantDonorConsent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donorQueryKeys.consents,
      });
    },
  });
}

export function useRevokeConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokeDonorConsent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donorQueryKeys.consents,
      });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: donorQueryKeys.notifications,
      });
    },
  });
}
