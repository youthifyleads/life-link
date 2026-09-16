import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/features/authentication/model/use-auth";
import type { UserRole } from "@/features/authentication/model/auth.types";
import { PageLoader } from "@/shared/components/feedback/page-loader";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <PageLoader />;
  }

  if (status === "unauthenticated" || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles) {
    const hasRole =
      allowedRoles.includes(user.primary_role) ||
      (Array.isArray(user.roles) &&
        user.roles.some((role) => allowedRoles.includes(role)));

    if (!hasRole) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return <Outlet />;
}
