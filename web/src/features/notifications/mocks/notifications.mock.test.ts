import { beforeEach, describe, expect, it } from "vitest";

import {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  resetNotificationsMock,
} from "@/features/notifications/mocks/notifications.mock";

describe("notifications.mock", () => {
  beforeEach(() => {
    resetNotificationsMock();
  });

  it("returns initial notifications list with proper sorting", async () => {
    const list = await getNotifications();
    expect(list.length).toBeGreaterThan(0);
    // Verified newest first
    const firstDate = new Date(list[0]!.createdAt).getTime();
    const secondDate = new Date(list[1]!.createdAt).getTime();
    expect(firstDate).toBeGreaterThanOrEqual(secondDate);
  });

  it("filters notifications by role view", async () => {
    const hospitalList = await getNotifications({ roleView: "hospital_staff" });
    expect(hospitalList.every((n) => n.recipientRoles.includes("hospital_staff"))).toBe(true);

    const caregiverList = await getNotifications({ roleView: "caregiver" });
    expect(caregiverList.every((n) => n.recipientRoles.includes("caregiver"))).toBe(true);
  });

  it("filters notifications by unread status", async () => {
    const unreadList = await getNotifications({ unreadOnly: true });
    expect(unreadList.every((n) => !n.isRead)).toBe(true);
  });

  it("filters notifications by type", async () => {
    const trackingList = await getNotifications({ type: "tracking_update" });
    expect(trackingList.every((n) => n.type === "tracking_update")).toBe(true);
  });

  it("searches notifications by keyword", async () => {
    const searchResults = await getNotifications({ search: "BR-2026-2194" });
    expect(searchResults.length).toBeGreaterThan(0);
    expect(
      searchResults.some((n) =>
        n.title.includes("BR-2026-2194") ||
        n.message.includes("BR-2026-2194") ||
        n.relatedEntity.id === "BR-2026-2194",
      ),
    ).toBe(true);
  });

  it("calculates unread count correctly per role", async () => {
    const totalUnread = await getUnreadCount();
    expect(totalUnread).toBeGreaterThan(0);

    const caregiverUnread = await getUnreadCount("caregiver");
    expect(caregiverUnread).toBeGreaterThan(0);
  });

  it("marks an individual notification as read", async () => {
    const list = await getNotifications({ unreadOnly: true });
    const target = list[0]!;

    const updated = await markNotificationAsRead(target.id);
    expect(updated.isRead).toBe(true);

    const checkList = await getNotifications();
    const found = checkList.find((n) => n.id === target.id);
    expect(found?.isRead).toBe(true);
  });

  it("marks all notifications as read for a role", async () => {
    await markAllNotificationsAsRead("caregiver");
    const caregiverUnread = await getUnreadCount("caregiver");
    expect(caregiverUnread).toBe(0);
  });

  it("creates a new notification dynamically", async () => {
    const created = createNotification({
      title: "Test dynamic alert",
      message: "Testing in-memory creation.",
      type: "system_announcement",
      priority: "urgent",
      recipientRoles: ["admin"],
      relatedEntity: { type: "system", id: "TEST-01" },
    });

    expect(created.id).toContain("NOTIF-");
    expect(created.isRead).toBe(false);

    const adminList = await getNotifications({ roleView: "admin" });
    expect(adminList.some((n) => n.id === created.id)).toBe(true);
  });
});
