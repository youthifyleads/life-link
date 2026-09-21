import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Bell,
  Globe2,
  LogOut,
  Menu,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { AuthenticatedUser } from "@/features/authentication/model/auth.types";
import { HeaderNotificationPopover } from "@/features/notifications/components/header-notification-popover";
import { BidiText, TechnicalText } from "@/shared/components/i18n/bidi-text";
import { LanguageOptions } from "@/shared/components/navigation/language-switcher";
import { OrganizationContext } from "@/shared/components/navigation/organization-context";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { SheetTrigger } from "@/shared/components/ui/sheet";
import {
  formatOrganizationName,
  formatUserName,
} from "@/shared/lib/formatters";

interface AppHeaderProps {
  user: AuthenticatedUser;
  notificationCount?: number;
  onSignOut?: () => void | Promise<void>;
}

export function AppHeader({ user, onSignOut }: AppHeaderProps) {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const roleLabel = t(
    `roles.${user.primary_role}`,
    user.primary_role.replaceAll("_", " "),
  );
  const activeOrgName = user.organizations.find(
    (organization) => organization.id === user.active_organization_id,
  )?.name;
  const localizedOrgName = activeOrgName
    ? formatOrganizationName(activeOrgName)
    : t("nav.assignedOrganization");
  const userDisplayName = formatUserName(user.display_name);

  return (
    <header className="sticky top-0 z-30 border-b border-header-border bg-header text-header-foreground">
      <div className="flex h-16 shrink-0 items-center gap-3 px-4 sm:px-5">
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden text-header-muted hover:bg-white/[0.06] hover:text-white"
            aria-label={t("nav.openNavigation", "Open navigation")}
          >
            <Menu aria-hidden="true" />
          </Button>
        </SheetTrigger>

        <div className="min-w-0 flex-1 lg:hidden">
          <OrganizationContext
            organizations={user.organizations}
            activeOrganizationId={user.active_organization_id}
            compact
          />
        </div>

        <div className="hidden min-w-0 flex-1 lg:block">
          <p className="truncate text-[11px] font-medium text-header-muted">
            {t("nav.activeOrganization", "Active organization")}
          </p>
          <p className="truncate text-sm font-semibold text-white">
            <BidiText>{localizedOrgName}</BidiText>
          </p>
        </div>

        <div className="flex items-center gap-1">
          <HeaderNotificationPopover user={user} />

          <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-header-muted hover:bg-white/[0.06] hover:text-white"
                aria-label={t("nav.settings", "Settings")}
                id="header-settings-trigger"
              >
                <Settings2 aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 max-w-[calc(100vw-2rem)] p-0"
              align="end"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {t("nav.settings", "Settings")}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  <BidiText>{userDisplayName}</BidiText>
                  <span aria-hidden="true"> · </span>
                  <span className="capitalize">{roleLabel}</span>
                </p>
              </div>

              <div className="border-b border-border p-2">
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  <Globe2 aria-hidden="true" className="size-3.5" />
                  <span>{t("common.selectLanguage")}</span>
                </div>
                <LanguageOptions />
              </div>

              <div className="space-y-0.5 border-b border-border p-2 text-sm">
                <Link
                  to="/notifications"
                  onClick={() => setSettingsOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-muted"
                >
                  <Bell
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  <span>
                    {t("nav.notificationCenter", "Notification Center")}
                  </span>
                </Link>
                {user.primary_role === "admin" ? (
                  <Link
                    to="/activity"
                    onClick={() => setSettingsOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-muted"
                  >
                    <Activity
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    <span>
                      {t("nav.systemActivity", "System Activity Ledger")}
                    </span>
                  </Link>
                ) : null}
                <Link
                  to="/settings/notifications"
                  onClick={() => setSettingsOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-foreground transition-colors hover:bg-muted"
                >
                  <SlidersHorizontal
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  <span>
                    {t(
                      "nav.notificationPreferences",
                      "Notification Preferences",
                    )}
                  </span>
                </Link>
              </div>

              <div className="p-2">
                <div className="px-2.5 pb-2 pt-1">
                  <p className="truncate text-xs text-muted-foreground">
                    <TechnicalText>{user.email}</TechnicalText>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={!onSignOut}
                  onClick={() => {
                    setSettingsOpen(false);
                    void onSignOut?.();
                  }}
                  id="header-signout-btn"
                >
                  <LogOut aria-hidden="true" />
                  {t("auth.signOut", "Sign out")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
