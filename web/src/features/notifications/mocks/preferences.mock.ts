import type { NotificationPreferences } from "@/features/notifications/types/notifications.types";

const PREFERENCES_STORAGE_KEY = "blood_bank_notification_preferences";

const defaultPreferences: NotificationPreferences = {
  inAppNotifications: true,
  urgentAlerts: true,
  workflowUpdates: true,
  systemAnnouncements: true,
  emailDigest: false,
  smsEmergencyAlerts: true,
  soundEnabled: true,
};

let inMemoryPreferences: NotificationPreferences = { ...defaultPreferences };

function loadStoredPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return { ...defaultPreferences };
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return { ...defaultPreferences };
    return { ...defaultPreferences, ...JSON.parse(raw) };
  } catch {
    return inMemoryPreferences;
  }
}

function saveStoredPreferences(prefs: NotificationPreferences): void {
  inMemoryPreferences = { ...prefs };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore storage quota errors
    }
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(loadStoredPreferences());
    }, 80);
  });
}

export async function updateNotificationPreferences(
  updates: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const current = loadStoredPreferences();
      const updated = { ...current, ...updates };
      saveStoredPreferences(updated);
      resolve(updated);
    }, 120);
  });
}

export function resetNotificationPreferences(): void {
  saveStoredPreferences(defaultPreferences);
}
