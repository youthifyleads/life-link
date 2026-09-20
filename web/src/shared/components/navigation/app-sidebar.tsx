import { LockKeyhole } from "lucide-react";
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
  collapsible?: boolean;
}

const navTranslationMap: Record<string, string> = {
  // Group labels
  "Hospital operations": "nav.hospitalOperations",
  "Blood bank operations": "nav.bloodBankOperations",
  Administration: "nav.administration",
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
  collapsible = false,
}: AppSidebarProps) {
  const { t } = useTranslation();
  const navigationGroups =
    (user?.primary_role && navigationByRole[user.primary_role]) ||
    navigationByRole.hospital_staff ||
    [];

  return (
    <div
      className={cn(
        "group/sidebar flex h-full flex-col overflow-hidden border-e border-sidebar-border bg-sidebar text-sidebar-foreground",
        collapsible
          ? "absolute inset-y-0 start-0 w-[4.5rem] shadow-none transition-[width,box-shadow] duration-200 ease-out hover:w-[16.5rem] hover:shadow-[0_18px_42px_-24px_rgb(3_18_27/0.55)]"
          : "w-full",
      )}
    >
      <div
        className={cn(
          "flex min-h-16 items-center overflow-hidden border-b border-sidebar-border",
          collapsible
            ? "justify-center gap-0 px-2 group-hover/sidebar:justify-start group-hover/sidebar:gap-3 group-hover/sidebar:px-3.5"
            : "gap-3 px-3.5",
        )}
      >
        <img
          src="/logo.png"
          alt="Life Link Logo"
          className="h-11 w-auto shrink-0 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] transition-transform duration-150"
        />
        <span
          className={cn(
            "whitespace-nowrap text-base font-semibold tracking-[-0.015em] text-white transition-[max-width,opacity] duration-150",
            collapsible &&
              "max-w-0 overflow-hidden opacity-0 group-hover/sidebar:max-w-48 group-hover/sidebar:opacity-100",
          )}
        >
          {t("common.appName", env.appName)}
        </span>
      </div>

      <OrganizationContext
        organizations={user.organizations}
        activeOrganizationId={user.active_organization_id}
        onOrganizationChange={onOrganizationChange}
        collapsible={collapsible}
      />

      <nav
        className={cn(
          "min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-3",
          collapsible ? "px-2 group-hover/sidebar:px-2.5" : "px-2.5",
        )}
        aria-label={t("nav.primaryNavigation")}
      >
        {navigationGroups.map((group) => {
          const groupLabel = navTranslationMap[group.label]
            ? t(navTranslationMap[group.label])
            : group.label;

          return (
            <div key={group.label} className="mt-2 first:mt-0">
              <div
                className={cn(
                  "relative mb-1",
                  collapsible
                    ? "h-0 overflow-hidden opacity-0 transition-[height,opacity] duration-150 group-hover/sidebar:h-4 group-hover/sidebar:opacity-100 group-hover/sidebar:px-2.5"
                    : "h-4 px-2.5",
                )}
              >
                <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.06em] text-white/75 rtl:tracking-normal">
                  {groupLabel}
                </p>
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const itemLabel = navTranslationMap[item.label]
                    ? t(navTranslationMap[item.label])
                    : item.label;

                  if (!item.enabled) {
                    return (
                      <li key={item.href}>
                        <span
                          className={cn(
                            "flex h-9 w-full items-center rounded-md text-sm text-white/40 cursor-not-allowed",
                            collapsible
                              ? "justify-center gap-0 px-0 group-hover/sidebar:justify-start group-hover/sidebar:gap-2.5 group-hover/sidebar:px-2.5"
                              : "gap-2.5 px-2.5",
                          )}
                          aria-disabled="true"
                          title={t("nav.availableLater")}
                        >
                          <Icon
                            aria-hidden="true"
                            className="size-[1.125rem] shrink-0"
                          />
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate transition-[max-width,opacity] duration-150",
                              collapsible &&
                                "max-w-0 opacity-0 group-hover/sidebar:max-w-40 group-hover/sidebar:opacity-100",
                            )}
                          >
                            {itemLabel}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-medium text-white/50 transition-[max-width,opacity] duration-150",
                              collapsible &&
                                "max-w-0 overflow-hidden opacity-0 group-hover/sidebar:max-w-20 group-hover/sidebar:opacity-100",
                            )}
                          >
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
                        aria-label={itemLabel}
                        title={collapsible ? itemLabel : undefined}
                        className={({ isActive }) => {
                          const active = isActive || activePath === item.href;
                          return cn(
                            "flex h-9 w-full items-center rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
                            collapsible
                              ? "justify-center gap-0 px-0 group-hover/sidebar:justify-start group-hover/sidebar:gap-2.5 group-hover/sidebar:px-2.5"
                              : "gap-2.5 px-2.5",
                            active
                              ? "bg-black/18 text-white font-semibold shadow-2xs hover:bg-black/24"
                              : "text-white/90 hover:bg-white/12 hover:text-white",
                          );
                        }}
                      >
                        <Icon
                          aria-hidden="true"
                          className="size-[1.125rem] shrink-0"
                        />
                        <span
                          className={cn(
                            "whitespace-nowrap transition-[max-width,opacity] duration-150",
                            collapsible &&
                              "max-w-0 overflow-hidden opacity-0 group-hover/sidebar:max-w-44 group-hover/sidebar:opacity-100",
                          )}
                        >
                          {itemLabel}
                        </span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-2.5 py-2.5">
        <div
          className={cn(
            "flex min-h-8 items-center text-xs leading-5 text-white/75",
            collapsible
              ? "justify-center gap-0 group-hover/sidebar:justify-start group-hover/sidebar:gap-2.5 group-hover/sidebar:px-2"
              : "gap-2.5 px-2",
          )}
        >
          <LockKeyhole aria-hidden="true" className="size-3.5 shrink-0" />
          <p
            className={cn(
              "whitespace-nowrap transition-[max-width,opacity] duration-150",
              collapsible &&
                "max-w-0 overflow-hidden opacity-0 group-hover/sidebar:max-w-48 group-hover/sidebar:opacity-100",
            )}
          >
            {t("common.secureWorkspace", "Secure clinical workspace")}
          </p>
        </div>
      </div>
    </div>
  );
}
