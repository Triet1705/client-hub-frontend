import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

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
      "bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-6 rounded-3xl transition-all duration-300 group hover:bg-slate-800/80 hover:ring-white/20 relative overflow-hidden",
      className
    )}>
      {badge && (
        <div className={cn("absolute inset-0 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300", variantClasses[badge.variant].split(" ")[2])} />
      )}
      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
          </div>
          {badge && (
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ring-1 ring-inset", variantClasses[badge.variant])}>
              {badge.label}
            </span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-white font-space-grotesk tracking-tight">
            {isLoading ? (
              <span className="inline-block w-24 h-9 bg-slate-800 animate-pulse rounded" />
            ) : (
              value
            )}
          </span>
          {Icon && (
            <div className={cn("p-2 rounded-xl bg-slate-950/50 ring-1 ring-white/10 text-slate-400 group-hover:scale-110 transition-transform duration-300", iconClassName)}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
