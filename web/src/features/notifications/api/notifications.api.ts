import { apiClient } from "@/shared/api/http-client";
import type {
  Notification,
  NotificationFilters,
  NotificationType,
  NotificationPriority,
} from "@/features/notifications/types/notifications.types";

export interface BackendNotificationDTO {
  id: string;
  user_id?: string | null;
  title: string;
  message: string;
  type: string;
  related_entity_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export function mapBackendNotificationDtoToNotification(dto: BackendNotificationDTO): Notification {
  let type: NotificationType = "request_update";
  if (dto.type.includes("inventory")) type = "inventory_alert";
  else if (dto.type.includes("allocat")) type = "allocation_update";
  else if (dto.type.includes("system")) type = "system_announcement";

  let priority: NotificationPriority = "normal";
  if (dto.title.toLowerCase().includes("urgent") || dto.message.toLowerCase().includes("urgent")) {
    priority = "urgent";
  }

  return {
    id: dto.id,
    title: dto.title,
    message: dto.message,
    type,
    priority,
    relatedEntity: {
      type: "request",
      id: dto.related_entity_id || dto.id,
      label: dto.related_entity_id ? `Ref #${dto.related_entity_id.slice(-6)}` : undefined,
    },
    createdAt: dto.created_at,
    isRead: dto.is_read,
    recipientRoles: ["hospital_staff", "blood_bank_staff"],
  };
}

export const notificationsApi = {
  async getNotifications(filters?: Partial<NotificationFilters>): Promise<Notification[]> {
    const params: Record<string, any> = {};
    if (filters?.unreadOnly) {
      params.unread_only = true;
    }
    const { data } = await apiClient.get<BackendNotificationDTO[]>("/notifications", { params });
    return data.map(mapBackendNotificationDtoToNotification);
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post("/notifications/read-all");
  },
};
