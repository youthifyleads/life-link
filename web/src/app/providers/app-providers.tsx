import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { LocaleDocument } from "@/app/providers/locale-document";
import { queryClient } from "@/app/providers/query-client";
import { AuthProvider } from "@/features/authentication/model/auth-context";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleDocument>
        <AuthProvider>{children}</AuthProvider>
      </LocaleDocument>
    </QueryClientProvider>
  );
}
