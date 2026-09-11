import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

import { env } from "@/app/config/env";
import {
  getAccessToken,
  requestAccessTokenRefresh,
  setAccessToken,
} from "@/shared/api/auth-token";
import { normalizeApiError } from "@/shared/api/api-error";

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const commonConfig = {
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: "application/json",
  },
};

export const authHttpClient = axios.create({
  ...commonConfig,
  withCredentials: true,
});

export const apiClient = axios.create({
  ...commonConfig,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(normalizeApiError(error));
    }

    const request = error.config as RetryableRequest;

    if (error.response?.status !== 401 || request._retry) {
      return Promise.reject(normalizeApiError(error));
    }

    request._retry = true;

    try {
      const token = await requestAccessTokenRefresh();
      request.headers = AxiosHeaders.from(request.headers);
      request.headers.set("Authorization", `Bearer ${token}`);
      return await apiClient(request);
    } catch (refreshError) {
      setAccessToken(null);
      window.dispatchEvent(new Event("blood-bank:session-expired"));
      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);
