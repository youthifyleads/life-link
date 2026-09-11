import { useState, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import type { AuthenticatedUser } from "@/features/authentication/model/auth.types";
import { AppHeader } from "@/shared/components/navigation/app-header";
import { AppSidebar } from "@/shared/components/navigation/app-sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/components/ui/sheet";

interface AppShellProps extends PropsWithChildren {
  user: AuthenticatedUser;
  notificationCount?: number;
  activePath?: string;
  onSignOut?: () => void | Promise<void>;
  onOrganizationChange?: (organizationId: string) => void;
}

export function AppShell({
  user,
  children,
  notificationCount,
  activePath,
  onSignOut,
  onOrganizationChange,
}: AppShellProps) {
  const { t } = useTranslation();
  const [navigationOpen, setNavigationOpen] = useState(false);

  return (
    <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
      <div className="min-h-svh bg-background lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <a
          href="#main-content"
          className="fixed start-4 top-3 z-[70] -translate-y-20 rounded-md bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-[var(--shadow-overlay)] transition-transform focus:translate-y-0"
        >
          {t("common.skipToContent")}
        </a>

        <aside className="sticky top-0 hidden h-svh border-e border-sidebar-border lg:block">
          <AppSidebar
            user={user}
            activePath={activePath}
            onOrganizationChange={onOrganizationChange}
          />
        </aside>

        <SheetContent aria-describedby="mobile-navigation-description">
          <SheetTitle className="sr-only">{t("nav.primaryNavigation")}</SheetTitle>
          <SheetDescription
            id="mobile-navigation-description"
            className="sr-only"
          >
            {t("nav.mobileNavigationDescription")}
          </SheetDescription>
          <AppSidebar
            user={user}
            activePath={activePath}
            onNavigate={() => setNavigationOpen(false)}
            onOrganizationChange={onOrganizationChange}
          />
        </SheetContent>

        <div className="min-w-0">
          <AppHeader
            user={user}
            notificationCount={notificationCount}
            onSignOut={onSignOut}
          />
          <main id="main-content" tabIndex={-1} className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </Sheet>
  );
}
