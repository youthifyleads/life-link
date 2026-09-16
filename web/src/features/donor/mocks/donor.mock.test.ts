import { beforeEach, describe, expect, it } from "vitest";

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
  resetDonorMockStore,
  respondToDonationRequest,
  revokeDonorConsent,
} from "@/features/donor/mocks/donor.mock";

describe("Donor Mock Repository", () => {
  beforeEach(() => {
    resetDonorMockStore();
  });

  it("retrieves the active donor profile with eligibility and impact metrics", async () => {
    const profile = await getDonorProfile();

    expect(profile.name).toBe("Omar Donor");
    expect(profile.bloodGroup).toBe("O+");
    expect(profile.eligibilityStatus).toBe("eligible");
    expect(profile.metrics.totalDonations).toBe(6);
    expect(profile.metrics.livesImpacted).toBe(18);
  });

  it("retrieves open donation requests matching the community shortage", async () => {
    const requests = await getDonationRequests();

    expect(requests.length).toBeGreaterThanOrEqual(3);
    const emergencyReq = requests.find((r) => r.urgency === "emergency");
    expect(emergencyReq).toBeDefined();
    expect(emergencyReq?.requestingOrg.name).toContain("Cairo University");
  });

  it("retrieves a single donation request by ID or reference", async () => {
    const req = await getDonationRequestById("dr-0811");
    expect(req).not.toBeNull();
    expect(req?.reference).toBe("DR-2026-0811");

    const byRef = await getDonationRequestById("DR-2026-0811");
    expect(byRef?.id).toBe("dr-0811");
  });

  it("registers a response to a donation request and logs a notification", async () => {
    const updated = await respondToDonationRequest("dr-0811", "interested");
    expect(updated.myResponse).toBe("interested");
    expect(updated.status).toBe("responded");

    const notifications = await getDonorNotifications();
    const latest = notifications[0];
    expect(latest.title).toContain("Response Registered");
    expect(latest.category).toBe("response");
    expect(latest.read).toBe(false);
  });

  it("allows declining a donation request without error", async () => {
    const declined = await respondToDonationRequest("dr-0799", "declined");
    expect(declined.myResponse).toBe("declined");

    const notifications = await getDonorNotifications();
    expect(notifications[0].title).toContain("Request Declined");
  });

  it("retrieves donation history records with linked vouchers", async () => {
    const history = await getDonationHistory();
    expect(history.length).toBeGreaterThanOrEqual(4);

    const withVoucher = history.find((h) => h.voucherId === "VCH-2026-9901");
    expect(withVoucher).toBeDefined();
    expect(withVoucher?.status).toBe("completed");
    expect(withVoucher?.volumeMl).toBe(450);
  });

  it("retrieves donation vouchers and validates active status", async () => {
    const vouchers = await getDonationVouchers();
    expect(vouchers.length).toBeGreaterThanOrEqual(2);

    const activeVoucher = vouchers.find((v) => v.status === "active");
    expect(activeVoucher?.voucherNumber).toBe("VCH-2026-9901");
    expect(activeVoucher?.beneficiaryRights).toContain("first-degree");
  });

  it("retrieves donor consents and allows grant and revoke actions", async () => {
    const consents = await getDonorConsents();
    expect(consents.length).toBe(4);
    expect(consents[0].status).toBe("granted");
    expect(consents[0].consentType).toBe("blood_donation_screening");

    // Revoke emergency outreach consent
    const revoked = await revokeDonorConsent("cst-02");
    expect(revoked.status).toBe("revoked");
    expect(revoked.revokedAt).toBeDefined();

    const afterRevoke = await getDonorConsents();
    expect(afterRevoke.find((c) => c.id === "cst-02")?.status).toBe("revoked");

    // Grant it back
    const reGranted = await grantDonorConsent("cst-02");
    expect(reGranted.status).toBe("granted");
    expect(reGranted.revokedAt).toBeUndefined();
    expect(reGranted.grantedAt).toBeDefined();
  });

  it("marks a notification as read", async () => {
    await markNotificationRead("notif-01");
    const notifications = await getDonorNotifications();
    const target = notifications.find((n) => n.id === "notif-01");
    expect(target?.read).toBe(true);
  });
});
