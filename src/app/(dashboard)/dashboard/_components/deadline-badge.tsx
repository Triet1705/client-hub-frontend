import * as React from "react";

export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  return Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

export function DeadlineBadge({ deadline }: { deadline: string | null }) {
  const days = daysUntil(deadline);
  if (days === null) return <span className="text-slate-500 text-xs font-medium">No deadline</span>;
  if (days < 0)
    return (
      <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 ring-1 ring-inset ring-rose-500/20 px-2.5 py-0.5 rounded-full">
        Overdue
      </span>
    );
  if (days <= 3)
    return (
      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20 px-2.5 py-0.5 rounded-full">
        In {days}d
      </span>
    );
  return (
    <span className="text-xs font-medium text-slate-400 bg-slate-800/50 ring-1 ring-inset ring-slate-700/50 px-2.5 py-0.5 rounded-full">
      In {days}d
    </span>
  );
}
