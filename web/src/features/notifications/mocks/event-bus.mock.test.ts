import { beforeEach, describe, expect, it } from "vitest";

import { getActivityEvents, resetActivityMock } from "@/features/notifications/mocks/activity.mock";
import {
  simulateDonorResponseReceived,
  simulateHospitalRequestCreated,
  simulateInventoryAlert,
  simulateUnitReleased,
  simulateUnitsAllocated,
  subscribeToEventBus,
} from "@/features/notifications/mocks/event-bus.mock";
import { getNotifications, resetNotificationsMock } from "@/features/notifications/mocks/notifications.mock";

describe("event-bus.mock", () => {
  beforeEach(() => {
    resetNotificationsMock();
    resetActivityMock();
  });

  it("emits REQUEST_CREATED and notifies blood bank staff and admin", async () => {
    const res = simulateHospitalRequestCreated("BR-2026-TEST", "Nile Specialist Hospital");
    expect(res.notification.recipientRoles).toContain("blood_bank_staff");
    expect(res.notification.recipientRoles).toContain("admin");
    expect(res.notification.type).toBe("request_update");
    expect(res.activity.action).toContain("created requisition BR-2026-TEST");

    const bbNotifs = await getNotifications({ roleView: "blood_bank_staff" });
    expect(bbNotifs.some((n) => n.id === res.notification.id)).toBe(true);

    const activities = await getActivityEvents({ search: "BR-2026-TEST" });
    expect(activities.length).toBeGreaterThan(0);
  });

  it("emits UNITS_ALLOCATED and notifies hospital staff and admin", async () => {
    const res = simulateUnitsAllocated("BR-2026-TEST", "UNT-O-NEG-0992");
    expect(res.notification.recipientRoles).toContain("hospital_staff");
    expect(res.notification.recipientRoles).toContain("admin");
    expect(res.notification.type).toBe("allocation_update");

    const hospitalNotifs = await getNotifications({ roleView: "hospital_staff" });
    expect(hospitalNotifs.some((n) => n.id === res.notification.id)).toBe(true);
  });

  it("emits UNIT_RELEASED and notifies caregiver and hospital staff", async () => {
    const res = simulateUnitReleased("UNT-B-POS-0331");
    expect(res.notification.recipientRoles).toContain("caregiver");
    expect(res.notification.recipientRoles).toContain("hospital_staff");
    expect(res.notification.type).toBe("tracking_update");

    const caregiverNotifs = await getNotifications({ roleView: "caregiver" });
    expect(caregiverNotifs.some((n) => n.id === res.notification.id)).toBe(true);
  });

  it("emits DONATION_RESPONSE_RECEIVED and notifies blood bank staff", async () => {
    const res = simulateDonorResponseReceived("Omar Donor", "DR-2026-0811");
    expect(res.notification.recipientRoles).toContain("blood_bank_staff");
    expect(res.notification.type).toBe("donation_update");

    const bbNotifs = await getNotifications({ roleView: "blood_bank_staff" });
    expect(bbNotifs.some((n) => n.id === res.notification.id)).toBe(true);
  });

  it("emits INVENTORY_ALERT and records urgent notification", async () => {
    const res = simulateInventoryAlert("AB-");
    expect(res.notification.priority).toBe("urgent");
    expect(res.notification.type).toBe("inventory_alert");
    expect(res.notification.recipientRoles).toContain("blood_bank_staff");
  });

  it("supports listener subscriptions for real-time reactivity", () => {
    let capturedEvent: string | null = null;
    const unsubscribe = subscribeToEventBus(({ event }) => {
      capturedEvent = event.eventType;
    });

    simulateHospitalRequestCreated("BR-2026-SUB");
    expect(capturedEvent).toBe("REQUEST_CREATED");

    unsubscribe();
    capturedEvent = null;
    simulateUnitsAllocated("BR-2026-SUB");
    // Should not fire listener after unsubscribe
    expect(capturedEvent).toBeNull();
  });
});
