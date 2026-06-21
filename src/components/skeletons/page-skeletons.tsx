import * as React from "react";
import { cn } from "@/lib/utils";

function Pulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("animate-pulse rounded-lg bg-surface-elevated/70 ring-1 ring-theme-border/60", className)} style={style} />;
}

function HeaderSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-3">
        <Pulse className="h-8 w-52" />
        <Pulse className="h-4 w-80 max-w-full" />
      </div>
      {action ? <Pulse className="h-10 w-32 rounded-xl" /> : null}
    </div>
  );
}

function MetricGrid({ count = 3 }: { count?: number }) {
  return (
    <div className={cn("grid gap-4", count === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3")}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-3xl bg-surface-elevated/60 p-6 ring-1 ring-theme-border">
          <div className="mb-6 flex items-center justify-between">
            <Pulse className="h-4 w-24" style={{ animationDelay: `${index * 100}ms` }} />
            <Pulse className="h-8 w-8 rounded-2xl" style={{ animationDelay: `${index * 100}ms` }} />
          </div>
          <Pulse className="h-9 w-28" style={{ animationDelay: `${index * 100}ms` }} />
          <Pulse className="mt-3 h-3 w-36" style={{ animationDelay: `${index * 100}ms` }} />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-surface-elevated/60 ring-1 ring-theme-border">
      <div className="grid grid-cols-5 gap-4 border-b border-theme-border bg-surface-base/60 p-4">
        {Array.from({ length: 5 }).map((_, index) => <Pulse key={index} className="h-3 w-full" />)}
      </div>
      <div className="divide-y divide-theme-border/70">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 p-4">
            <Pulse className="h-5 w-full" style={{ animationDelay: `${index * 75}ms` }} />
            <Pulse className="h-5 w-3/4" style={{ animationDelay: `${index * 75}ms` }} />
            <Pulse className="h-5 w-2/3" style={{ animationDelay: `${index * 75}ms` }} />
            <Pulse className="h-5 w-1/2" style={{ animationDelay: `${index * 75}ms` }} />
            <Pulse className="h-8 w-20 rounded-full" style={{ animationDelay: `${index * 75}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {["To Do", "In Progress", "Done", "Cancelled"].map((label, columnIndex) => (
        <div key={label} className="rounded-3xl bg-surface-elevated/60 p-4 ring-1 ring-theme-border">
          <div className="mb-4 flex items-center justify-between">
            <Pulse className="h-4 w-24" />
            <Pulse className="h-6 w-8 rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: columnIndex === 3 ? 2 : 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl bg-surface-base/60 p-4 ring-1 ring-theme-border/70">
                <Pulse className="h-4 w-4/5" />
                <Pulse className="mt-3 h-3 w-full" />
                <Pulse className="mt-2 h-3 w-2/3" />
                <div className="mt-5 flex gap-2">
                  <Pulse className="h-6 w-16 rounded-full" />
                  <Pulse className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FormPanelSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <section className="rounded-3xl bg-surface-elevated/60 p-6 ring-1 ring-theme-border">
      <div className="mb-6 flex items-center gap-3">
        <Pulse className="h-10 w-10 rounded-2xl" />
        <div className="space-y-2">
          <Pulse className="h-5 w-36" />
          <Pulse className="h-3 w-48" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Pulse className="h-3 w-24" />
            <Pulse className={cn("h-11 w-full rounded-xl", index === 2 ? "h-28" : "")} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <MetricGrid count={4} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Pulse className="h-96 rounded-3xl" />
        <Pulse className="h-96 rounded-3xl" />
      </div>
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="space-y-8">
      <MetricGrid />
      <HeaderSkeleton />
      <TableSkeleton />
    </div>
  );
}

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <Pulse className="h-32 rounded-3xl" />
          <KanbanSkeleton />
        </div>
        <div className="space-y-4">
          <Pulse className="h-44 rounded-3xl" />
          <Pulse className="h-44 rounded-3xl" />
          <Pulse className="h-56 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <Pulse className="h-[34rem] rounded-3xl" />
        <KanbanSkeleton />
      </div>
    </div>
  );
}

export function InvoicesSkeleton() {
  return (
    <div className="space-y-6">
      <MetricGrid count={3} />
      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <Pulse className="h-[32rem] rounded-3xl" />
        <TableSkeleton rows={8} />
      </div>
    </div>
  );
}

export function InvoiceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <FormPanelSkeleton fields={6} />
        <div className="space-y-4">
          <Pulse className="h-52 rounded-3xl" />
          <Pulse className="h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function CommunicationSkeleton() {
  return (
    <div className="grid h-[calc(100vh-7rem)] min-h-[680px] overflow-hidden rounded-3xl bg-surface-elevated/60 ring-1 ring-theme-border lg:grid-cols-[24rem_minmax(0,1fr)]">
      <aside className="border-b border-theme-border p-4 lg:border-b-0 lg:border-r">
        <Pulse className="mb-4 h-11 w-full rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-2xl bg-surface-base/60 p-4 ring-1 ring-theme-border/70">
              <Pulse className="h-4 w-3/4" />
              <Pulse className="mt-3 h-3 w-full" />
              <Pulse className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      </aside>
      <section className="flex flex-col p-5">
        <div className="mb-5 flex items-center gap-3">
          <Pulse className="h-11 w-11 rounded-full" />
          <div className="space-y-2">
            <Pulse className="h-5 w-48" />
            <Pulse className="h-3 w-64" />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <Pulse className="h-20 w-3/5 rounded-2xl" />
          <Pulse className="ml-auto h-24 w-2/3 rounded-2xl" />
          <Pulse className="h-20 w-1/2 rounded-2xl" />
        </div>
        <Pulse className="h-14 w-full rounded-2xl" />
      </section>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-3xl bg-surface-elevated/60 p-8 ring-1 ring-theme-border lg:col-span-8">
          <div className="flex flex-col gap-6 md:flex-row">
            <Pulse className="h-36 w-36 rounded-3xl" />
            <div className="flex-1 space-y-4">
              <Pulse className="h-8 w-60" />
              <Pulse className="h-5 w-72" />
              <Pulse className="h-20 w-full rounded-2xl" />
              <div className="flex gap-3">
                <Pulse className="h-7 w-28 rounded-full" />
                <Pulse className="h-7 w-32 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <Pulse className="h-72 rounded-3xl lg:col-span-4" />
      </div>
      <MetricGrid count={3} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <FormPanelSkeleton fields={3} />
        <Pulse className="h-96 rounded-3xl" />
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <div className="rounded-3xl bg-surface-elevated/60 p-4 ring-1 ring-theme-border">
          {Array.from({ length: 5 }).map((_, index) => (
            <Pulse key={index} className="mb-3 h-11 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <FormPanelSkeleton fields={5} />
          <FormPanelSkeleton fields={4} />
          <FormPanelSkeleton fields={4} />
          <FormPanelSkeleton fields={4} />
        </div>
      </div>
    </div>
  );
}

export function AdminSettingsSkeleton() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <MetricGrid count={3} />
      <div className="grid gap-6 lg:grid-cols-2">
        <FormPanelSkeleton fields={3} />
        <FormPanelSkeleton fields={4} />
      </div>
    </div>
  );
}

export function AdminTableSkeleton() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <Pulse className="h-[34rem] rounded-3xl" />
        <TableSkeleton rows={9} />
      </div>
    </div>
  );
}
