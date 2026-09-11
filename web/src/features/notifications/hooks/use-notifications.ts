import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UserRole } from "@/features/authentication/model/auth.types";
import {
  getActivityEvents,
} from "@/features/notifications/mocks/activity.mock";
import {
  emitWorkflowEvent,
  subscribeToEventBus,
} from "@/features/notifications/mocks/event-bus.mock";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/notifications/mocks/notifications.mock";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/features/notifications/mocks/preferences.mock";
import type {
  ActivityFilters,
  NotificationFilters,
  NotificationPreferences,
  WorkflowEventPayload,
} from "@/features/notifications/types/notifications.types";

export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: ["notifications", filters],
    queryFn: () => getNotifications(filters),
  });
}

export function useUnreadNotificationCount(role?: UserRole) {
  return useQuery({
    queryKey: ["notifications", "unread-count", role],
    queryFn: () => getUnreadCount(role),
    staleTime: 1000 * 10,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["activity-events"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role?: UserRole) => markAllNotificationsAsRead(role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["activity-events"] });
    },
  });
}

export function useActivityTimeline(filters?: ActivityFilters) {
  return useQuery({
    queryKey: ["activity-events", filters],
    queryFn: () => getActivityEvents(filters),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => getNotificationPreferences(),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(updates),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["notification-preferences"],
      });
    },
  });
}

export function useEventBusListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToEventBus(() => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["activity-events"] });
    });

    return unsubscribe;
  }, [queryClient]);
}

export function useSimulateWorkflowEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkflowEventPayload) => {
      const res = emitWorkflowEvent(payload);
      return Promise.resolve(res);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["activity-events"] });
    },
  });
}
