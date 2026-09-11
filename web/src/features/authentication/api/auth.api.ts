import { apiClient, authHttpClient } from "@/shared/api/http-client";
import type {
  AuthenticatedUser,
  LoginInput,
  TokenResponse,
} from "@/features/authentication/model/auth.types";

export const authApi = {
  async login(input: LoginInput) {
    const { data } = await authHttpClient.post<TokenResponse>(
      "/auth/login",
      input,
    );
    return data;
  },

  async refresh() {
    const { data } = await authHttpClient.post<TokenResponse>("/auth/refresh");
    return data;
  },

  async getCurrentUser() {
    const { data } = await apiClient.get<AuthenticatedUser>("/auth/me");
    return data;
  },

  async logout() {
    await authHttpClient.post("/auth/logout");
  },
};
