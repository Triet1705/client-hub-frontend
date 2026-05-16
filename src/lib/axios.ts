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
import { useAuthStore } from "@/features/auth/store/auth.store";

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
    const { isImpersonating, impersonationToken } = useAuthStore.getState();

    if (isImpersonating && impersonationToken) {
      config.headers.Authorization = `Bearer ${impersonationToken}`;
    } else if (token) {
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

    const requestUrl = originalRequest.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/logout") ||
      requestUrl.includes("/auth/refresh-token");
    const isOnAuthPage =
      typeof window !== "undefined" &&
      (window.location.pathname === "/login" ||
        window.location.pathname === "/register" ||
        window.location.pathname === "/recovery");

    if (
      error.response?.status !== 401 ||
      isAuthEndpoint
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
        if (!isOnAuthPage) {
          clearAuthCookies();
          if (typeof window !== "undefined") window.location.href = "/login";
        }
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
        const refreshedTenantId = data.tenant_id || tenantId || "";

        setAuthCookies(newAccessToken, newRefreshToken, refreshedTenantId);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        if (!isOnAuthPage) {
          clearAuthCookies();
          if (typeof window !== "undefined") window.location.href = "/login";
        }
        return Promise.reject(normalizeApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);
