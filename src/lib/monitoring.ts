export function reportClientError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const endpoint = process.env.NEXT_PUBLIC_ERROR_REPORT_URL;
  if (!endpoint || typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function") {
    return;
  }

  const payload = JSON.stringify({
    message: error instanceof Error ? error.message : "Unknown client error",
    context,
    timestamp: new Date().toISOString(),
  });

  navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
}
