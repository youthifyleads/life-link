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

  async forgotPassword(input: { email: string }) {
    const { data } = await authHttpClient.post<{ message: string }>(
      "/auth/forgot-password",
      input,
    );
    return data;
  },

  async resetPassword(input: { email: string; code: string; new_password: string }) {
    const { data } = await authHttpClient.post<{ message: string }>(
      "/auth/reset-password",
      input,
    );
    return data;
  },
};
