import {
  QueryClient,
  QueryCache,
  MutationCache,
  QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";

function handleError(error: Error, context?: { queryKey?: QueryKey }) {
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", {
      message: error.message,
      queryKey: context?.queryKey,
      error,
    });
  }

  const errorMessage = error.message || "An unexpected error occurred";

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
      handleError(error as Error, { queryKey: query.queryKey });
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      handleError(error as Error);
    },
  }),

  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
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
