import type { UserRole } from "@/features/authentication/model/auth.types";

export type NotificationType =
  | "request_update"
  | "inventory_alert"
  | "allocation_update"
  | "donation_update"
  | "tracking_update"
  | "system_announcement";

export type NotificationPriority = "urgent" | "high" | "normal" | "low";

export interface NotificationRelatedEntity {
  type: "request" | "inventory" | "unit" | "donation" | "user" | "hospital" | "blood_bank" | "system";
  id: string;
  label?: string;
  link?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  relatedEntity: NotificationRelatedEntity;
  createdAt: string;
  isRead: boolean;
  recipientRoles: UserRole[];
  recipientUserId?: string;
  sourceModule?: "hospital" | "blood_bank" | "admin" | "donor" | "caregiver" | "system";
}

export interface NotificationFilters {
  search?: string;
  type?: NotificationType | "all";
  priority?: NotificationPriority | "all";
  unreadOnly?: boolean;
  roleView?: UserRole | "all";
}

export interface NotificationPreferences {
  inAppNotifications: boolean;
  urgentAlerts: boolean;
  workflowUpdates: boolean;
  systemAnnouncements: boolean;
  emailDigest: boolean;
  smsEmergencyAlerts: boolean;
  soundEnabled: boolean;
}

export type ActivityResult = "success" | "warning" | "failure";

export interface ActivityEvent {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    role: UserRole;
    organization: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  entityName?: string;
  organization: string;
  result: ActivityResult;
  details?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityFilters {
  search?: string;
  role?: UserRole | "all";
  result?: ActivityResult | "all";
  timeRange?: "all" | "today" | "week" | "month";
}

export type WorkflowEventType =
  | "REQUEST_CREATED"
  | "UNITS_ALLOCATED"
  | "UNIT_RELEASED"
  | "DONATION_RESPONSE_RECEIVED"
  | "INVENTORY_ALERT"
  | "USER_PERMISSION_CHANGED";

export interface WorkflowEventPayload {
  eventType: WorkflowEventType;
  actor: {
    id: string;
    name: string;
    role: UserRole;
    organization: string;
  };
  entityId: string;
  entityName?: string;
  message: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}
