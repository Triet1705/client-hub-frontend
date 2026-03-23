import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import JSONBigInt from "json-bigint";
import { normalizeApiError } from "@/lib/api/error";
import {
  getAuthToken,
  getTenantId,
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "./cookies";

const JSONBig = JSONBigInt({ storeAsString: true });

function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  timeout: 15_000, // 15 seconds
  headers: {
    "Content-Type": "application/json",
  },
  transformResponse: [
    (data) => {
      if (typeof data === "string") {
        try {
          return JSONBig.parse(data);
        } catch {
          return data;
        }
      }
      return data;
    },
  ],
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    const tenantId = getTenantId();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers["X-Tenant-ID"] = tenantId;
    }

    config.headers["X-Request-ID"] = createRequestId();

    return config;
  },
  (error) => Promise.reject(normalizeApiError(error)),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(normalizeApiError(error));
    }

    if (originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(normalizeApiError(err)));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      const tenantId = getTenantId();

      if (!refreshToken) {
        clearAuthCookies();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(normalizeApiError(error));
      }

      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh-token`,
          { refreshToken },
          { headers: { "X-Tenant-ID": tenantId || "default" } },
        );

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        setAuthCookies(newAccessToken, newRefreshToken, tenantId || "");

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        clearAuthCookies();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(normalizeApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);
