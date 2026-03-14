import {
  QueryClient,
  QueryCache,
  MutationCache,
  QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";

function normalizeErrorMessage(error: unknown): string {
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
    console.error("API Error:", {
      message: errorMessage,
      queryKey: context?.queryKey,
      error,
    });
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
