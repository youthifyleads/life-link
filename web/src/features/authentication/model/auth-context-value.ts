import { createContext } from "react";

import type {
  AuthenticatedUser,
  LoginInput,
} from "@/features/authentication/model/auth.types";
import type { DemoSessionRole } from "@/features/authentication/model/demo-session";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  signIn: (input: LoginInput) => Promise<AuthenticatedUser>;
  signInDemo: (role?: DemoSessionRole) => Promise<AuthenticatedUser>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
