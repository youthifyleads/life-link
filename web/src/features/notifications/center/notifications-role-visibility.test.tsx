import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthContext } from "@/features/authentication/model/auth-context-value";
import { setAppLanguage } from "@/app/i18n/i18n";
import type { AuthenticatedUser, UserRole } from "@/features/authentication/model/auth.types";
import { NotificationsPage } from "@/features/notifications/center/notifications-page";
import { HeaderNotificationPopover } from "@/features/notifications/components/header-notification-popover";
import {
  getNotifications,
  getUnreadCount,
  resetNotificationsMock,
} from "@/features/notifications/mocks/notifications.mock";

function createMockUser(role: UserRole, displayName = "Test User"): AuthenticatedUser {
  return {
    id: `user-${role}`,
    email: `${role}@lifelink.test`,
    display_name: displayName,
    primary_role: role,
    roles: [role],
    permissions: [],
    organizations: [
      {
        id: "org-01",
        name: "Test Organization",
        type: "hospital",
      },
    ],
    active_organization_id: "org-01",
  };
}

function renderWithProviders(ui: React.ReactElement, user: AuthenticatedUser) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          status: "authenticated",
          user,
          signIn: vi.fn(),
          signInDemo: vi.fn(),
          signOut: vi.fn(),
        }}
      >
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("Notification Role Visibility & Isolation", () => {
  beforeEach(() => {
    resetNotificationsMock();
  });

  describe("Backend/Mock Contract Verification", () => {
    it("hospital_staff only receives notifications intended for hospital_staff", async () => {
      const hospitalNotifs = await getNotifications({ roleView: "hospital_staff" });
      expect(hospitalNotifs.length).toBeGreaterThan(0);
      expect(hospitalNotifs.every((n) => n.recipientRoles.includes("hospital_staff"))).toBe(true);

      // Verify no cross-role leakage (caregiver-only, donor-only, or admin-only notifications)
      expect(hospitalNotifs.some((n) => n.id === "NOTIF-2026-007")).toBe(false); // Caregiver
      expect(hospitalNotifs.some((n) => n.id === "NOTIF-2026-009")).toBe(false); // Donor
      expect(hospitalNotifs.some((n) => n.id === "NOTIF-2026-012")).toBe(false); // Admin
    });

    it("blood_bank_staff only receives notifications intended for blood_bank_staff", async () => {
      const bloodBankNotifs = await getNotifications({ roleView: "blood_bank_staff" });
      expect(bloodBankNotifs.length).toBeGreaterThan(0);
      expect(bloodBankNotifs.every((n) => n.recipientRoles.includes("blood_bank_staff"))).toBe(true);

      // Verify no cross-role leakage
      expect(bloodBankNotifs.some((n) => n.id === "NOTIF-2026-006")).toBe(false); // Hospital-only
      expect(bloodBankNotifs.some((n) => n.id === "NOTIF-2026-007")).toBe(false); // Caregiver
      expect(bloodBankNotifs.some((n) => n.id === "NOTIF-2026-009")).toBe(false); // Donor
    });

    it("donor only receives notifications intended for donor", async () => {
      const donorNotifs = await getNotifications({ roleView: "donor" });
      expect(donorNotifs.length).toBeGreaterThan(0);
      expect(donorNotifs.every((n) => n.recipientRoles.includes("donor"))).toBe(true);

      // Verify no hospital/blood bank/caregiver notifications leak to donor
      expect(donorNotifs.some((n) => n.id === "NOTIF-2026-001")).toBe(false);
      expect(donorNotifs.some((n) => n.id === "NOTIF-2026-004")).toBe(false);
      expect(donorNotifs.some((n) => n.id === "NOTIF-2026-007")).toBe(false);
    });

    it("caregiver only receives notifications intended for caregiver", async () => {
      const caregiverNotifs = await getNotifications({ roleView: "caregiver" });
      expect(caregiverNotifs.length).toBeGreaterThan(0);
      expect(caregiverNotifs.every((n) => n.recipientRoles.includes("caregiver"))).toBe(true);

      // Verify no other roles leak to caregiver
      expect(caregiverNotifs.some((n) => n.id === "NOTIF-2026-001")).toBe(false);
      expect(caregiverNotifs.some((n) => n.id === "NOTIF-2026-004")).toBe(false);
      expect(caregiverNotifs.some((n) => n.id === "NOTIF-2026-009")).toBe(false);
      expect(caregiverNotifs.some((n) => n.id === "NOTIF-2026-012")).toBe(false);
    });

    it("admin receives admin & system notifications by default", async () => {
      const adminNotifs = await getNotifications({ roleView: "admin" });
      expect(adminNotifs.length).toBeGreaterThan(0);
      expect(adminNotifs.every((n) => n.recipientRoles.includes("admin"))).toBe(true);

      // Should include admin-only provision alert and system announcements
      expect(adminNotifs.some((n) => n.id === "NOTIF-2026-012")).toBe(true);
      expect(adminNotifs.some((n) => n.id === "NOTIF-2026-013")).toBe(true);

      // Should not include caregiver-only or donor-only notifications
      expect(adminNotifs.some((n) => n.id === "NOTIF-2026-007")).toBe(false);
      expect(adminNotifs.some((n) => n.id === "NOTIF-2026-009")).toBe(false);
    });

    it("role unread count is strictly isolated per role", async () => {
      const hospitalNotifs = await getNotifications({ roleView: "hospital_staff", unreadOnly: true });
      const hospitalUnread = await getUnreadCount("hospital_staff");
      expect(hospitalUnread).toBe(hospitalNotifs.length);

      const caregiverNotifs = await getNotifications({ roleView: "caregiver", unreadOnly: true });
      const caregiverUnread = await getUnreadCount("caregiver");
      expect(caregiverUnread).toBe(caregiverNotifs.length);

      const donorNotifs = await getNotifications({ roleView: "donor", unreadOnly: true });
      const donorUnread = await getUnreadCount("donor");
      expect(donorUnread).toBe(donorNotifs.length);
    });
  });

  describe("Notification Center UI Role Visibility", () => {
    it("hides role-switching tabs and 'All Roles' for hospital_staff", async () => {
      const hospitalUser = createMockUser("hospital_staff", "Dr. Sarah Chen");
      renderWithProviders(<NotificationsPage />, hospitalUser);

      // Wait for notifications to load
      await waitFor(() => {
        expect(screen.queryByText("Loading notification ledger")).not.toBeInTheDocument();
      });

      // Role switching buttons must NOT be present
      expect(screen.queryByRole("button", { name: /All Roles/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Caregiver/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Donor/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /admin/i })).not.toBeInTheDocument();

      // Notifications visible must be hospital staff only
      expect(screen.getByText("Blood request BR-2026-2194 confirmed")).toBeInTheDocument();
      expect(screen.queryByText("Unit UNT-B-POS-0331 is ready for transfer")).not.toBeInTheDocument(); // Caregiver notification
      expect(screen.queryByText("Your donation response was accepted")).not.toBeInTheDocument(); // Donor notification
    });

    it("hides role-switching tabs and 'All Roles' for caregiver", async () => {
      const caregiverUser = createMockUser("caregiver", "Sara Mostafa");
      renderWithProviders(<NotificationsPage />, caregiverUser);

      await waitFor(() => {
        expect(screen.queryByText("Loading notification ledger")).not.toBeInTheDocument();
      });

      // Role switching buttons must NOT be present
      expect(screen.queryByRole("button", { name: /All Roles/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /hospital/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /blood bank/i })).not.toBeInTheDocument();

      // Caregiver notifications visible
      expect(screen.getByText("Unit UNT-B-POS-0331 is ready for transfer")).toBeInTheDocument();

      // Cross-role notifications must NOT be visible
      expect(screen.queryByText("Urgent O- request received")).not.toBeInTheDocument();
      expect(screen.queryByText("Blood request BR-2026-2194 confirmed")).not.toBeInTheDocument();
      expect(screen.queryByText("Your donation response was accepted")).not.toBeInTheDocument();
    });

    it("hides role-switching tabs and 'All Roles' for donor", async () => {
      const donorUser = createMockUser("donor", "Omar Hassan");
      renderWithProviders(<NotificationsPage />, donorUser);

      await waitFor(() => {
        expect(screen.queryByText("Loading notification ledger")).not.toBeInTheDocument();
      });

      // Role switching buttons must NOT be present
      expect(screen.queryByRole("button", { name: /All Roles/i })).not.toBeInTheDocument();

      // Donor notifications visible
      expect(screen.getByText("Your donation response was accepted")).toBeInTheDocument();

      // Hospital / Caregiver notifications must NOT be visible
      expect(screen.queryByText("Unit UNT-B-POS-0331 is ready for transfer")).not.toBeInTheDocument();
      expect(screen.queryByText("Blood request BR-2026-2194 confirmed")).not.toBeInTheDocument();
    });

    it("allows admin to see role-switching tabs and 'All Roles'", async () => {
      const adminUser = createMockUser("admin", "System Administrator");
      renderWithProviders(<NotificationsPage />, adminUser);

      await waitFor(() => {
        expect(screen.queryByText("Loading notification ledger")).not.toBeInTheDocument();
      });

      // Admin CAN see "All Roles" and role-switching buttons
      expect(screen.getByRole("button", { name: /All Roles/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /hospital/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /blood bank/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /caregiver/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /donor/i })).toBeInTheDocument();
    });
  });

  describe("Header Notification Bell Role Visibility", () => {
    it("renders popover preview with caregiver-only notifications for caregiver", async () => {
      const caregiverUser = createMockUser("caregiver", "Sara Mostafa");
      renderWithProviders(<HeaderNotificationPopover user={caregiverUser} />, caregiverUser);

      // Verify bell exists with unread count
      const bellBtn = screen.getByRole("button", { name: /unread notifications|Notifications/i });
      expect(bellBtn).toBeInTheDocument();

      // Click to open popover
      fireEvent.click(bellBtn);

      // Notification list inside popover should only contain caregiver notifications
      await waitFor(() => {
        expect(screen.getByText("Unit UNT-B-POS-0331 is ready for transfer")).toBeInTheDocument();
      });

      expect(screen.queryByText("Urgent O- request received")).not.toBeInTheDocument();
      expect(screen.queryByText("Blood request BR-2026-2194 confirmed")).not.toBeInTheDocument();
    });

    it("renders popover preview with hospital-only notifications for hospital staff", async () => {
      const hospitalUser = createMockUser("hospital_staff", "Dr. Sarah Chen");
      renderWithProviders(<HeaderNotificationPopover user={hospitalUser} />, hospitalUser);

      const bellBtn = screen.getByRole("button", { name: /unread notifications|Notifications/i });
      fireEvent.click(bellBtn);

      await waitFor(() => {
        expect(screen.getByText("Blood request BR-2026-2194 confirmed")).toBeInTheDocument();
      });

      expect(screen.queryByText("Unit UNT-B-POS-0331 is ready for transfer")).not.toBeInTheDocument();
      expect(screen.queryByText("Your donation response was accepted")).not.toBeInTheDocument();
    });
  });

  describe("Arabic Notification Content Translation", () => {
    beforeEach(async () => {
      await setAppLanguage("en");
    });

    it("displays English titles and messages when English is active", async () => {
      await setAppLanguage("en");
      const hospitalUser = createMockUser("hospital_staff", "Dr. Sarah Chen");
      renderWithProviders(<NotificationsPage />, hospitalUser);

      await waitFor(() => {
        expect(screen.getByText("Blood request BR-2026-2194 confirmed")).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Central Blood Bank acknowledged and confirmed clinical requisition BR-2026-2194/),
      ).toBeInTheDocument();
    });

    it("translates notification titles and messages to Arabic when Arabic is active, preserving technical IDs", async () => {
      await setAppLanguage("ar");
      const hospitalUser = createMockUser("hospital_staff", "د. سارة تشن");
      renderWithProviders(<NotificationsPage />, hospitalUser);

      await waitFor(() => {
        // Arabic translated title
        expect(screen.getByText("تم تأكيد طلب الدم BR-2026-2194")).toBeInTheDocument();
      });

      // Arabic translated message with preserved technical code
      expect(
        screen.getByText(
          /أكد بنك الدم المركزي استلام الطلب السريري BR-2026-2194 واعتماده\. جاري تخصيص الوحدات\./,
        ),
      ).toBeInTheDocument();

      // Reset back to English
      await setAppLanguage("en");
    });

    it("translates notification items in header bell popover when Arabic is active", async () => {
      await setAppLanguage("ar");
      const caregiverUser = createMockUser("caregiver", "سارة مصطفى");
      renderWithProviders(<HeaderNotificationPopover user={caregiverUser} />, caregiverUser);

      const bellBtn = screen.getByRole("button", { name: /غير مقروء|إشعارات/i });
      fireEvent.click(bellBtn);

      await waitFor(() => {
        expect(screen.getByText("الوحدة UNT-B-POS-0331 جاهزة للنقل")).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          /اجتازت الوحدة الحيوية UNT-B-POS-0331 فحص التوافق وتم تغليفها في حاوية نقل حرارية معتمدة\./,
        ),
      ).toBeInTheDocument();

      await setAppLanguage("en");
    });
  });
});

