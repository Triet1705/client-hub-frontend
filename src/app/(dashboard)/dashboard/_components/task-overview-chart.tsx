import * as React from "react";
import { cn } from "@/lib/utils";
import type { TaskSummary } from "@/features/dashboard/types/dashboard.types";

export function TaskOverviewChart({
  taskSummary,
  isLoading,
}: {
  taskSummary: TaskSummary | undefined;
  isLoading: boolean;
}) {
  const todo       = taskSummary?.todo       ?? 0;
  const inProgress = taskSummary?.inProgress ?? 0;
  const done       = taskSummary?.done       ?? 0;
  const total      = taskSummary?.total      ?? 0;

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const bars = [
    { label: "To Do",       count: todo,       color: "bg-slate-500" },
    { label: "In Progress", count: inProgress, color: "bg-blue-500" },
    { label: "Done",        count: done,       color: "bg-emerald-500" },
  ];
  const maxCount = Math.max(todo, inProgress, done, 1);
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 rounded-3xl p-7 shadow-2xl shadow-black/50 transition-all hover:bg-slate-900/80 group/chart">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-space-grotesk font-semibold text-slate-100">Task Overview</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/50 ring-1 ring-white/10 shadow-inner">
          <span className="text-xs text-slate-400">Completion</span>
          <span className="text-sm font-bold text-emerald-400">{completionRate}%</span>
        </div>
      </div>

      <div className="mb-8 relative">
        <div className="absolute inset-0 border-b border-white/5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="flex items-end gap-3 h-32 px-2 relative z-10">
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full flex items-end h-24">
                    <div className="w-full rounded-t-lg bg-slate-800/50 animate-pulse" style={{ height: "60%" }} />
                  </div>
                  <span className="text-[10px] text-slate-500">&nbsp;</span>
                </div>
              ))
            : bars.map((item) => {
                const heightPct = Math.max(15, (item.count / maxCount) * 100);
                return (
                  <div
                    key={item.label}
                    className="flex-1 flex flex-col items-center gap-3 group/bar"
                  >
                    <div className="w-full flex items-end h-24 relative">
                      <div
                        className={cn(
                          "w-full rounded-t-xl transition-all duration-700 ease-out group-hover/bar:brightness-110 shadow-lg",
                          item.color,
                        )}
                        style={{ height: `${heightPct}%` }}
                      >
                         <div className="h-full w-full bg-gradient-to-t from-black/20 to-transparent rounded-t-xl" />
                      </div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                        {item.count}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover/bar:text-slate-200 transition-colors">{item.label}</span>
                  </div>
                );
              })}
        </div>
      </div>

      <div className="space-y-3">
        {bars.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/40 transition-colors flex-1 min-w-[33%]">
            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", item.color)} />
              <span className="text-sm font-medium text-slate-300">{item.label}</span>
            </div>
            {isLoading ? (
              <div className="w-6 h-5 rounded bg-slate-800 animate-pulse" />
            ) : (
              <span className="text-base font-bold text-white">{item.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
