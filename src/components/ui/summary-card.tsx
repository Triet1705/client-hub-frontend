import * as React from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  iconClassName?: string;
  badge?: {
    label: string;
    variant: "amber" | "emerald" | "cyan" | "rose" | "indigo" | "blue" | "slate";
  };
  className?: string;
  isLoading?: boolean;
}

export function SummaryCard({ label, value, icon: Icon, iconClassName, badge, className, isLoading }: SummaryCardProps) {
  const variantClasses = {
    amber:   "bg-amber-500/10   text-amber-400   bg-amber-500/5   ring-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 bg-emerald-500/5 ring-emerald-500/20",
    cyan:    "bg-cyan-500/10    text-cyan-400    bg-cyan-500/5    ring-cyan-500/20",
    rose:    "bg-rose-500/10    text-rose-400    bg-rose-500/5    ring-rose-500/20",
    indigo:  "bg-indigo-500/10  text-indigo-400  bg-indigo-500/5  ring-indigo-500/20",
    blue:    "bg-blue-500/10    text-blue-400    bg-blue-500/5    ring-blue-500/20",
    slate:   "bg-slate-500/10   text-slate-400   bg-slate-500/5   ring-slate-500/20",
  };

  return (
    <div className={cn(
      "bg-surface-elevated/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-black/10 p-6 rounded-3xl transition-all duration-300 group hover:bg-surface-elevated hover:ring-theme-accent/20 relative overflow-hidden",
      className
    )}>
      {badge && (
        <div className={cn("absolute inset-0 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300", variantClasses[badge.variant].split(" ")[2])} />
      )}
      <div className="relative">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-content-muted uppercase tracking-widest">{label}</p>
          </div>
          {badge && (
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ring-1 ring-inset whitespace-nowrap shrink-0", variantClasses[badge.variant])}>
              {badge.label}
            </span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl lg:text-4xl font-bold text-content-primary font-space-grotesk tracking-tight">
            {isLoading ? (
              <span className="inline-block w-24 h-10 bg-surface-sunken animate-pulse rounded" />
            ) : (
              value
            )}
          </span>
          {Icon && (
            <div className={cn("p-2.5 rounded-2xl bg-surface-base ring-1 ring-theme-border text-content-muted group-hover:scale-110 transition-transform duration-300 shrink-0", iconClassName)}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
