"use client";

import * as React from "react";
import { Flag, LockKeyhole, ShieldCheck } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons/page-skeletons";
import { useAdminFlagsQuery } from "@/features/admin/hooks/use-admin";
import type { AdminFeatureFlag } from "@/features/admin/types/admin.types";
import { cn } from "@/lib/utils";

function FlagCard({ flag }: { flag: AdminFeatureFlag }) {
  return (
    <article className="rounded-lg border border-theme-border bg-surface-elevated/70 p-5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-content-primary">{flag.label}</h2>
          <p className="mt-1 text-sm text-content-muted">{flag.description}</p>
        </div>
        <span className={cn(
          "shrink-0 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
          flag.enabled ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-500/10 text-slate-300",
        )}>
          {flag.status}
        </span>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-md border border-theme-border bg-surface-base px-2.5 py-1.5 text-xs text-content-muted">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {flag.enabled ? "Enabled" : "Disabled"}
        </span>
        <span className="inline-flex items-center gap-2 rounded-md border border-theme-border bg-surface-base px-2.5 py-1.5 text-xs text-content-muted">
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
          Read only
        </span>
        <span className="truncate rounded-md border border-theme-border bg-surface-base px-2.5 py-1.5 font-mono text-xs text-content-muted">
          {flag.source}
        </span>
      </div>
    </article>
  );
}

export default function AdminFlagsPage() {
  const { data: flags, isLoading, isError } = useAdminFlagsQuery();

  if (isLoading && !flags) {
    return <DashboardSkeleton />;
  }

  if (isError || !flags) {
    return (
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-200">
        Feature flags are unavailable.
      </div>
    );
  }

  const enabledCount = flags.filter((flag) => flag.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-theme-border bg-surface-elevated px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-content-muted">
            <Flag className="h-3.5 w-3.5 text-theme-accent" aria-hidden="true" />
            Flags
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-content-primary">Read-Only Capability Flags</h1>
          <p className="mt-1 max-w-2xl text-sm text-content-muted">
            Runtime and configuration status for platform capabilities. These controls cannot be changed here.
          </p>
        </div>
        <div className="rounded-lg border border-theme-border bg-surface-elevated/70 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Enabled</p>
          <p className="mt-1 text-sm font-semibold text-content-primary">{enabledCount} of {flags.length}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {flags.map((flag) => (
          <FlagCard key={flag.key} flag={flag} />
        ))}
      </div>
    </div>
  );
}
