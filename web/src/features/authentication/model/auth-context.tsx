import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";

import { queryClient } from "@/app/providers/query-client";
import { authApi } from "@/features/authentication/api/auth.api";
import {
  AuthContext,
  type AuthStatus,
} from "@/features/authentication/model/auth-context-value";
import type {
  AuthenticatedUser,
  LoginInput,
} from "@/features/authentication/model/auth.types";
import type { DemoSessionRole } from "@/features/authentication/model/demo-session";
import {
  registerRefreshHandler,
  setAccessToken,
} from "@/shared/api/auth-token";

interface AuthState {
  status: AuthStatus;
  user: AuthenticatedUser | null;
}

type AuthAction =
  | { type: "authenticated"; user: AuthenticatedUser }
  | { type: "unauthenticated" };

function authReducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "authenticated":
      return { status: "authenticated", user: action.user };
    case "unauthenticated":
      return { status: "unauthenticated", user: null };
  }
}

const initialState: AuthState = {
  status: "loading",
  user: null,
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const establishSession = useCallback(async (accessToken: string) => {
    setAccessToken(accessToken);
    const user = await authApi.getCurrentUser();
    dispatch({ type: "authenticated", user });
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const tokenResponse = await authApi.refresh();
      await establishSession(tokenResponse.access_token);
      return tokenResponse.access_token;
    } catch {
      setAccessToken(null);
      dispatch({ type: "unauthenticated" });
      throw new Error("No active session");
    }
  }, [establishSession]);

  useEffect(() => {
    if (import.meta.env.DEV) return;
    return registerRefreshHandler(restoreSession);
  }, [restoreSession]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      void import("@/features/authentication/model/demo-session").then(
        ({ restoreDemoSession }) => {
          const user = restoreDemoSession();
          dispatch(
            user
              ? { type: "authenticated", user }
              : { type: "unauthenticated" },
          );
        },
      );
      return;
    }

    void restoreSession().catch(() => undefined);
  }, [restoreSession]);

  useEffect(() => {
    const handleSessionExpiry = () => {
      setAccessToken(null);
      queryClient.clear();
      dispatch({ type: "unauthenticated" });
    };

    window.addEventListener("blood-bank:session-expired", handleSessionExpiry);
    return () => {
      window.removeEventListener(
        "blood-bank:session-expired",
        handleSessionExpiry,
      );
    };
  }, []);

  const signIn = useCallback(
    async (input: LoginInput) => {
      if (import.meta.env.DEV) {
        throw new Error(
          "Password authentication is disabled in the development preview.",
        );
      }

      const tokenResponse = await authApi.login(input);
      await establishSession(tokenResponse.access_token);
    },
    [establishSession],
  );

  const signInDemo = useCallback(
    async (role: DemoSessionRole = "hospital_staff") => {
      if (!import.meta.env.DEV) {
        throw new Error("Demo authentication is unavailable.");
      }

      const { startDemoSession } =
        await import("@/features/authentication/model/demo-session");
      const user = startDemoSession(role);
      setAccessToken(null);
      queryClient.clear();
      dispatch({ type: "authenticated", user });
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (import.meta.env.DEV) {
      const { clearDemoSession } =
        await import("@/features/authentication/model/demo-session");
      clearDemoSession();
      setAccessToken(null);
      queryClient.clear();
      dispatch({ type: "unauthenticated" });
      return;
    }

    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      queryClient.clear();
      dispatch({ type: "unauthenticated" });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, signIn, signInDemo, signOut }),
    [state, signIn, signInDemo, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
