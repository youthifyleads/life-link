import { Droplets, LockKeyhole } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { env } from "@/app/config/env";
import { navigationByRole } from "@/app/config/navigation";
import type { AuthenticatedUser } from "@/features/authentication/model/auth.types";
import { OrganizationContext } from "@/shared/components/navigation/organization-context";
import { cn } from "@/shared/lib/utils";

interface AppSidebarProps {
  user: AuthenticatedUser;
  activePath?: string;
  onNavigate?: () => void;
  onOrganizationChange?: (organizationId: string) => void;
}

const navTranslationMap: Record<string, string> = {
  // Group labels
  "Hospital operations": "nav.hospitalOperations",
  "Blood bank operations": "nav.bloodBankOperations",
  "Administration": "nav.administration",
  "Donor Services": "nav.donorServices",
  "Caregiver Tracking": "nav.caregiverTracking",

  // Item labels
  Dashboard: "nav.dashboard",
  "Blood requests": "nav.bloodRequests",
  "Request queue": "nav.requestQueue",
  Inventory: "nav.inventory",
  "QR tracking": "nav.qrTracking",
  Documents: "nav.documents",
  Notifications: "nav.notifications",
  "System activity": "nav.systemActivity",
  Users: "nav.users",
  Hospitals: "nav.hospitals",
  "Blood banks": "nav.bloodBanks",
  "Roles & permissions": "nav.rolesPermissions",
  "Governance audit": "nav.governanceAudit",
  "Donation requests": "nav.donationRequests",
  "Donation history": "nav.donationHistory",
  "Donation vouchers": "nav.donationVouchers",
  "Consents & rights": "nav.consentsAndRights",
  Preferences: "nav.preferences",
  "QR scan & lookup": "nav.qrScanLookup",
};

export function AppSidebar({
  user,
  activePath,
  onNavigate,
  onOrganizationChange,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const navigationGroups = navigationByRole[user.primary_role];

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex min-h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <span className="flex size-9 items-center justify-center rounded-md border border-white/20 bg-white/[0.06]">
          <Droplets aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </span>
        <span className="text-base font-semibold tracking-[-0.015em]">
          {t("common.appName", env.appName)}
        </span>
      </div>

      <OrganizationContext
        organizations={user.organizations}
        activeOrganizationId={user.active_organization_id}
        onOrganizationChange={onOrganizationChange}
      />

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-5"
        aria-label={t("nav.primaryNavigation")}
      >
        {navigationGroups.map((group) => {
          const groupLabel = navTranslationMap[group.label]
            ? t(navTranslationMap[group.label])
            : group.label;

          return (
            <div key={group.label} className="mt-4 first:mt-1">
              <p className="px-3 pb-2 text-xs font-medium text-sidebar-muted">
                {groupLabel}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const itemLabel = navTranslationMap[item.label]
                    ? t(navTranslationMap[item.label])
                    : item.label;

                  if (!item.enabled) {
                  return (
                    <li key={item.href}>
                      <span
                        className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-sidebar-muted/65"
                        aria-disabled="true"
                        title={t("nav.availableLater")}
                      >
                        <Icon
                          aria-hidden="true"
                          className="size-[1.125rem] shrink-0"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {itemLabel}
                        </span>
                        <span className="text-xs font-medium">
                          {t("nav.planned")}
                        </span>
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      end={item.href === "/"}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                          (isActive || activePath === item.href) &&
                            "bg-sidebar-accent text-white",
                        )
                      }
                    >
                      <Icon
                        aria-hidden="true"
                        className="size-[1.125rem] shrink-0"
                      />
                      <span>{itemLabel}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <div className="flex items-start gap-3 text-xs leading-5 text-sidebar-muted">
          <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>{t("common.secureWorkspace", "Secure clinical workspace")}</p>
        </div>
      </div>
    </div>
  );
}
