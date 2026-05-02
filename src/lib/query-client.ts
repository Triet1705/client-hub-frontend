import {
  QueryClient,
  QueryCache,
  MutationCache,
  QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";

function normalizeErrorMessage(error: unknown): string {
  // Axios-style errors often include a response with data and message
  const anyErr = error as any;
  if (anyErr?.isAxiosError && anyErr.response) {
    const resp = anyErr.response;
    if (resp.data) {
      if (typeof resp.data === "string") return resp.data;
      if (typeof resp.data.message === "string") return resp.data.message;
      try {
        return JSON.stringify(resp.data);
      } catch {
        // fallthrough
      }
    }
    return `HTTP ${resp.status}`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
      return maybeMessage;
    }
  }

  return "An unexpected error occurred";
}

function handleError(error: unknown, context?: { queryKey?: QueryKey }) {
  const errorMessage = normalizeErrorMessage(error);

  if (process.env.NODE_ENV === "development") {
    try {
      const anyErr = error as any;
      const debugObj: any = { message: errorMessage, queryKey: context?.queryKey };
      if (anyErr?.isAxiosError && anyErr.response) {
        debugObj.status = anyErr.response.status;
        debugObj.data = anyErr.response.data;
      } else {
        debugObj.error = error;
      }
      console.error("API Error:", debugObj);
    } catch (e) {
      console.error("API Error:", { message: errorMessage, queryKey: context?.queryKey, error });
    }
  }

  if (
    errorMessage.includes("Network Error") ||
    errorMessage.includes("Failed to fetch")
  ) {
    toast.error(
      "Network connection lost. Please check your internet connection.",
    );
    return;
  }

  toast.error(errorMessage);

  // TODO: Send to monitoring service in production
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, {
  //     tags: { source: 'react-query' },
  //     extra: { queryKey: context?.queryKey },
  //   });
  // }
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
