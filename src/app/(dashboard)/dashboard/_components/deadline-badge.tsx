import * as React from "react";

export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  return Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

export function DeadlineBadge({ deadline }: { deadline: string | null }) {
  const days = daysUntil(deadline);
  if (days === null) return <span className="text-content-muted text-xs font-medium">No deadline</span>;
  if (days < 0)
    return (
      <span className="text-xs font-semibold text-status-danger-text bg-status-danger-surface ring-1 ring-inset ring-status-danger-border px-2.5 py-0.5 rounded-full">
        Overdue
      </span>
    );
  if (days <= 3)
    return (
      <span className="text-xs font-semibold text-status-warning-text bg-status-warning-surface ring-1 ring-inset ring-status-warning-border px-2.5 py-0.5 rounded-full">
        In {days}d
      </span>
    );
  return (
    <span className="text-xs font-medium text-content-secondary bg-surface-elevated/50 ring-1 ring-inset ring-theme-border/50 px-2.5 py-0.5 rounded-full">
      In {days}d
    </span>
  );
}
