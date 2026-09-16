import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { AuthenticatedUser } from "@/features/authentication/model/auth.types";
import { HeaderNotificationPopover } from "@/features/notifications/components/header-notification-popover";
import { LanguageSwitcher } from "@/shared/components/navigation/language-switcher";
import { OrganizationContext } from "@/shared/components/navigation/organization-context";
import { BidiText, TechnicalText } from "@/shared/components/i18n/bidi-text";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { SheetTrigger } from "@/shared/components/ui/sheet";

interface AppHeaderProps {
  user: AuthenticatedUser;
  notificationCount?: number;
  onSignOut?: () => void | Promise<void>;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppHeader({
  user,
  onSignOut,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roleLabel = t(`roles.${user.primary_role}`, user.primary_role.replaceAll("_", " "));

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
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
          <p className="truncate text-xs font-medium text-muted-foreground">
            {t("nav.activeOrganization", "Active organization")}
          </p>
          <p className="truncate text-sm font-semibold text-foreground">
            <BidiText>{user.organizations.find(
              (organization) => organization.id === user.active_organization_id,
            )?.name ?? t("nav.assignedOrganization")}</BidiText>
          </p>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language Switcher (EN / العربية) */}
          <LanguageSwitcher />

          {/* Real-time Notification Popover */}
          <HeaderNotificationPopover user={user} />

          {/* User Account Menu */}
          <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-12 min-h-12 gap-2 px-2 sm:px-3"
                aria-label={t("nav.openUserMenu", { name: user.display_name })}
                id="header-user-menu-trigger"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  {getInitials(user.display_name)}
                </span>
                <span className="hidden min-w-0 text-start md:block">
                  <span className="block max-w-40 truncate text-sm font-semibold">
                    <BidiText>{user.display_name}</BidiText>
                  </span>
                  <span className="block text-xs font-normal capitalize text-muted-foreground">
                    {roleLabel}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="hidden size-4 text-muted-foreground md:block"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 shadow-lg" align="end">
              <div className="border-b border-border px-4 py-4">
                <p className="truncate text-sm font-semibold">
                  <BidiText>{user.display_name}</BidiText>
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  <TechnicalText>{user.email}</TechnicalText>
                </p>
              </div>
              <div className="flex items-start gap-3 border-b border-border px-4 py-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                <div>
                  <p className="text-sm font-medium capitalize">
                    {roleLabel}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {t("auth.secureNotice", "Access is limited by your assigned role and organization.")}
                  </p>
                </div>
              </div>

              <div className="p-2 border-b border-border text-xs space-y-1">
                <Link
                  to="/notifications"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-muted transition-colors"
                >
                  <Bell className="size-3.5 text-muted-foreground" />
                  <span>{t("nav.notificationCenter", "Notification Center")}</span>
                </Link>
                <Link
                  to="/activity"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-muted transition-colors"
                >
                  <Activity className="size-3.5 text-muted-foreground" />
                  <span>{t("nav.systemActivity", "System Activity Ledger")}</span>
                </Link>
                <Link
                  to="/settings/notifications"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground hover:bg-muted transition-colors"
                >
                  <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                  <span>{t("nav.notificationPreferences", "Notification Preferences")}</span>
                </Link>
              </div>

              <div className="p-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={!onSignOut}
                  onClick={() => {
                    setUserMenuOpen(false);
                    void onSignOut?.();
                  }}
                  id="header-signout-btn"
                >
                  <LogOut aria-hidden="true" className="size-3.5" />
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
