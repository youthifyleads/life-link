import { createBrowserRouter, Outlet } from "react-router-dom";

import { ProtectedRoute } from "@/features/authentication/ui/protected-route";
import { ProtectedLayout } from "@/layouts/protected-layout";
import { PageLoader } from "@/shared/components/feedback/page-loader";

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    HydrateFallback: PageLoader,
    children: [
      {
        path: "/login",
        lazy: async () => {
          const { LoginPage } = await import("@/pages/auth/login-page");
          return { Component: LoginPage };
        },
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <ProtectedLayout />,
            children: [
              {
                index: true,
                lazy: async () => {
                  const { FoundationPage } =
                    await import("@/pages/system/foundation-page");
                  return { Component: FoundationPage };
                },
              },
              ...(import.meta.env.DEV
                ? [
                    {
                      path: "ui-preview",
                      lazy: async () => {
                        const { ShellPreviewPage } =
                          await import("@/pages/system/shell-preview-page");
                        return { Component: ShellPreviewPage };
                      },
                    },
                  ]
                : []),
              {
                path: "notifications",
                lazy: async () => {
                  const { NotificationsPage } =
                    await import(
                      "@/features/notifications/center/notifications-page"
                    );
                  return { Component: NotificationsPage };
                },
              },
              {
                path: "settings/notifications",
                lazy: async () => {
                  const { NotificationPreferencesPage } =
                    await import(
                      "@/features/notifications/preferences/notification-preferences-page"
                    );
                  return { Component: NotificationPreferencesPage };
                },
              },
              {
                element: <ProtectedRoute allowedRoles={["hospital_staff"]} />,
                children: [
                  {
                    path: "hospital/dashboard",
                    lazy: async () => {
                      const { HospitalDashboardPage } =
                        await import("@/features/hospital/dashboard/hospital-dashboard-page");
                      return { Component: HospitalDashboardPage };
                    },
                  },
                  {
                    path: "hospital/requests",
                    lazy: async () => {
                      const { RequestListPage } =
                        await import("@/features/hospital/requests/request-list-page");
                      return { Component: RequestListPage };
                    },
                  },
                  {
                    path: "hospital/requests/create",
                    lazy: async () => {
                      const { CreateRequestPage } =
                        await import("@/features/hospital/requests/create-request-page");
                      return { Component: CreateRequestPage };
                    },
                  },
                  {
                    path: "hospital/requests/:id",
                    lazy: async () => {
                      const { RequestDetailsPage } =
                        await import("@/features/hospital/requests/request-details-page");
                      return { Component: RequestDetailsPage };
                    },
                  },
                  {
                    path: "hospital/documents",
                    lazy: async () => {
                      const { HospitalDocumentsPage } =
                        await import("@/features/hospital/documents/hospital-documents-page");
                      return { Component: HospitalDocumentsPage };
                    },
                  },
                ],
              },
              {
                element: <ProtectedRoute allowedRoles={["blood_bank_staff"]} />,
                children: [
                  {
                    path: "blood-bank/dashboard",
                    lazy: async () => {
                      const { BloodBankDashboardPage } =
                        await import("@/features/blood-bank/dashboard/blood-bank-dashboard-page");
                      return { Component: BloodBankDashboardPage };
                    },
                  },
                  {
                    path: "blood-bank/requests",
                    lazy: async () => {
                      const { RequestQueuePage } =
                        await import("@/features/blood-bank/requests/request-queue-page");
                      return { Component: RequestQueuePage };
                    },
                  },
                  {
                    path: "blood-bank/requests/:id",
                    lazy: async () => {
                      const { BloodBankRequestDetailsPage } =
                        await import(
                          "@/features/blood-bank/requests/details/blood-bank-request-details-page"
                        );
                      return { Component: BloodBankRequestDetailsPage };
                    },
                  },
                  {
                    path: "blood-bank/inventory",
                    lazy: async () => {
                      const { BloodBankInventoryPage } =
                        await import(
                          "@/features/blood-bank/inventory/inventory-page"
                        );
                      return { Component: BloodBankInventoryPage };
                    },
                  },
                  {
                    path: "blood-bank/tracking",
                    lazy: async () => {
                      const { BloodBankTrackingPage } =
                        await import(
                          "@/features/blood-bank/tracking/tracking-page"
                        );
                      return { Component: BloodBankTrackingPage };
                    },
                  },
                  {
                    path: "blood-bank/documents",
                    lazy: async () => {
                      const { BloodBankDocumentsPage } =
                        await import(
                          "@/features/blood-bank/documents/blood-bank-documents-page"
                        );
                      return { Component: BloodBankDocumentsPage };
                    },
                  },
                ],
              },
              {
                element: <ProtectedRoute allowedRoles={["admin"]} />,
                children: [
                  {
                    path: "admin/dashboard",
                    lazy: async () => {
                      const { AdminDashboardPage } =
                        await import(
                          "@/features/admin/dashboard/admin-dashboard-page"
                        );
                      return { Component: AdminDashboardPage };
                    },
                  },
                  {
                    path: "admin/users",
                    lazy: async () => {
                      const { UsersPage } =
                        await import("@/features/admin/users/users-page");
                      return { Component: UsersPage };
                    },
                  },
                  {
                    path: "admin/hospitals",
                    lazy: async () => {
                      const { HospitalsPage } =
                        await import(
                          "@/features/admin/hospitals/hospitals-page"
                        );
                      return { Component: HospitalsPage };
                    },
                  },
                  {
                    path: "admin/blood-banks",
                    lazy: async () => {
                      const { BloodBanksPage } =
                        await import(
                          "@/features/admin/blood-banks/blood-banks-page"
                        );
                      return { Component: BloodBanksPage };
                    },
                  },
                  {
                    path: "admin/roles",
                    lazy: async () => {
                      const { RolesPermissionsPage } =
                        await import(
                          "@/features/admin/roles-permissions/roles-permissions-page"
                        );
                      return { Component: RolesPermissionsPage };
                    },
                  },
                  {
                    path: "admin/audit",
                    lazy: async () => {
                      const { AuditPage } =
                        await import("@/features/admin/audit/audit-page");
                      return { Component: AuditPage };
                    },
                  },
                  {
                    path: "activity",
                    lazy: async () => {
                      const { ActivityPage } =
                        await import(
                          "@/features/notifications/activity/activity-page"
                        );
                      return { Component: ActivityPage };
                    },
                  },
                ],
              },
              {
                element: <ProtectedRoute allowedRoles={["donor"]} />,
                children: [
                  {
                    path: "donor/dashboard",
                    lazy: async () => {
                      const { DonorDashboardPage } =
                        await import(
                          "@/features/donor/dashboard/donor-dashboard-page"
                        );
                      return { Component: DonorDashboardPage };
                    },
                  },
                  {
                    path: "donor/requests",
                    lazy: async () => {
                      const { DonorRequestsPage } =
                        await import(
                          "@/features/donor/requests/donor-requests-page"
                        );
                      return { Component: DonorRequestsPage };
                    },
                  },
                  {
                    path: "donor/requests/:id",
                    lazy: async () => {
                      const { DonorRequestDetailsPage } =
                        await import(
                          "@/features/donor/requests/donor-request-details-page"
                        );
                      return { Component: DonorRequestDetailsPage };
                    },
                  },
                  {
                    path: "donor/donations",
                    lazy: async () => {
                      const { DonorDonationsPage } =
                        await import(
                          "@/features/donor/donations/donor-donations-page"
                        );
                      return { Component: DonorDonationsPage };
                    },
                  },
                  {
                    path: "donor/vouchers",
                    lazy: async () => {
                      const { DonorVouchersPage } =
                        await import(
                          "@/features/donor/vouchers/donor-vouchers-page"
                        );
                      return { Component: DonorVouchersPage };
                    },
                  },
                  {
                    path: "donor/consents",
                    lazy: async () => {
                      const { DonorConsentsPage } =
                        await import(
                          "@/features/donor/consents/donor-consents-page"
                        );
                      return { Component: DonorConsentsPage };
                    },
                  },
                  {
                    path: "donor/notifications",
                    lazy: async () => {
                      const { DonorNotificationsPage } =
                        await import(
                          "@/features/donor/notifications/donor-notifications-page"
                        );
                      return { Component: DonorNotificationsPage };
                    },
                  },
                ],
              },
              {
                element: <ProtectedRoute allowedRoles={["caregiver"]} />,
                children: [
                  {
                    path: "caregiver/dashboard",
                    lazy: async () => {
                      const { CaregiverDashboardPage } =
                        await import(
                          "@/features/caregiver/dashboard/caregiver-dashboard-page"
                        );
                      return { Component: CaregiverDashboardPage };
                    },
                  },
                  {
                    path: "caregiver/scan",
                    lazy: async () => {
                      const { CaregiverScanPage } =
                        await import(
                          "@/features/caregiver/scan/caregiver-scan-page"
                        );
                      return { Component: CaregiverScanPage };
                    },
                  },
                  {
                    path: "caregiver/tracking/:reference",
                    lazy: async () => {
                      const { CaregiverTrackingPage } =
                        await import(
                          "@/features/caregiver/tracking/caregiver-tracking-page"
                        );
                      return { Component: CaregiverTrackingPage };
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "/forbidden",
        lazy: async () => {
          const { ForbiddenPage } =
            await import("@/pages/system/forbidden-page");
          return { Component: ForbiddenPage };
        },
      },
      {
        path: "*",
        lazy: async () => {
          const { NotFoundPage } =
            await import("@/pages/system/not-found-page");
          return { Component: NotFoundPage };
        },
      },
    ],
  },
]);
