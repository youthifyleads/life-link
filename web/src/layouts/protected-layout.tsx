import { Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/features/authentication/model/use-auth";
import { AppShell } from "@/layouts/app-shell";

export function ProtectedLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <AppShell
      user={user}
      activePath={
        import.meta.env.DEV && location.pathname === "/ui-preview"
          ? "/"
          : undefined
      }
      onSignOut={signOut}
    >
      <Outlet />
    </AppShell>
  );
}
