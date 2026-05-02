import {
  QueryClient,
  QueryCache,
  MutationCache,
  QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";

type AxiosLikeError = {
  isAxiosError?: boolean;
  response?: { status?: number; data?: unknown };
};

function normalizeErrorMessage(error: unknown): string {
  const axiosErr = error as AxiosLikeError;
  if (axiosErr?.isAxiosError && axiosErr.response) {
    const resp = axiosErr.response;
      if (resp.data) {
      if (typeof resp.data === "string") return resp.data;
      const respData = resp.data as unknown;
      if (typeof (respData as { message?: unknown }).message === "string") return (respData as { message: string }).message;
      try {
        return JSON.stringify(resp.data);
      } catch {
        // fallthrough
      }
    }
    return `HTTP ${resp.status}`;
  }

  if (error instanceof Error && error.message) return error.message;

  if (typeof error === "object" && error !== null) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.length > 0) return maybeMessage;
  }

  return "An unexpected error occurred";
}

function handleError(error: unknown, context?: { queryKey?: QueryKey }) {
  const errorMessage = normalizeErrorMessage(error);

  if (process.env.NODE_ENV === "development") {
    try {
      const axiosErr = error as AxiosLikeError;
      const debugObj: Record<string, unknown> = { message: errorMessage, queryKey: context?.queryKey };
      if (axiosErr?.isAxiosError && axiosErr.response) {
        debugObj.status = axiosErr.response.status;
        debugObj.data = axiosErr.response.data;
      } else {
        debugObj.error = error;
      }
      console.error("API Error:", debugObj);
    } catch {
      console.error("API Error:", { message: errorMessage, queryKey: context?.queryKey, error });
    }
  }

  if (errorMessage.includes("Network Error") || errorMessage.includes("Failed to fetch")) {
    toast.error("Network connection lost. Please check your internet connection.");
    return;
  }

  toast.error(errorMessage);

  // TODO: Send to monitoring service in production
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleError(error, { queryKey: query.queryKey });
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      handleError(error);
    },
  }),

  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — avoids refetch on tab switch / re-navigation
      gcTime: 10 * 60 * 1000,   // 10 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        const axiosError = error as { response?: { status?: number } };
        const status = axiosError?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
