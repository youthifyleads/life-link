import { useContext } from "react";

import { AuthContext } from "@/features/authentication/model/auth-context-value";

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
