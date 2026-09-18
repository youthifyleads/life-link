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
  title?: string | null;
  message?: string | null;
  type?: string | null;
  trigger?: string | null;
  related_entity_id?: string | null;
  related_request_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export function mapBackendNotificationDtoToNotification(dto: BackendNotificationDTO): Notification {
  const typeStr = String(dto.type || dto.trigger || "").toLowerCase();
  let type: NotificationType = "request_update";
  if (typeStr.includes("inventory")) type = "inventory_alert";
  else if (typeStr.includes("allocat")) type = "allocation_update";
  else if (typeStr.includes("system")) type = "system_announcement";

  const titleStr = String(dto.title || dto.trigger || "System Notification");
  const messageStr = String(dto.message || "");

  let priority: NotificationPriority = "normal";
  if (titleStr.toLowerCase().includes("urgent") || messageStr.toLowerCase().includes("urgent")) {
    priority = "urgent";
  }

  const relatedId = dto.related_entity_id || dto.related_request_id || dto.id;

  return {
    id: dto.id,
    title: titleStr,
    message: messageStr,
    type,
    priority,
    relatedEntity: {
      type: "request",
      id: relatedId,
      label: relatedId ? `Ref #${relatedId.slice(-6)}` : undefined,
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
