import { AxiosError } from "axios";

export type ApiClientError = Error & {
  status?: number;
  code?: string;
  requestId?: string;
  details?: unknown;
  cause?: unknown;
};

export function normalizeApiError(input: unknown): ApiClientError {
  if (input instanceof Error && "status" in input) {
    return input as ApiClientError;
  }

  if (input && typeof input === "object" && "isAxiosError" in input) {
    const axiosError = input as AxiosError<{
      message?: string;
      code?: string;
      details?: unknown;
      requestId?: string;
      traceId?: string;
    }>;

    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Unexpected API error";

    const requestId =
      axiosError.response?.data?.requestId ||
      axiosError.response?.data?.traceId ||
      axiosError.response?.headers?.["x-request-id"];

    const normalized = new Error(message) as ApiClientError;
    normalized.status = axiosError.response?.status;
    normalized.code = axiosError.response?.data?.code || axiosError.code;
    normalized.requestId = typeof requestId === "string" ? requestId : undefined;
    normalized.details = axiosError.response?.data?.details;
    normalized.cause = axiosError;

    return normalized;
  }

  const fallback = new Error("Unexpected API error") as ApiClientError;
  fallback.cause = input;
  return fallback;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const normalized = normalizeApiError(error);
  return normalized.message || fallback;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return normalizeApiError(error).status;
}
