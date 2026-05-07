import * as React from "react";
import { cn } from "@/lib/utils";
import { ProjectStatus, TaskStatus, InvoiceStatus } from "@/lib/type";

export type ActivityCategory = "PROJECT" | "TASK" | "INVOICE";

interface StatusActivityDotProps {
  category: ActivityCategory;
  status: string;
  className?: string;
}

export function StatusActivityDot({ category, status, className }: StatusActivityDotProps) {
  const isVisible = React.useMemo(() => {
    if (category === "PROJECT") return status === ProjectStatus.IN_PROGRESS;
    if (category === "TASK") return status === TaskStatus.IN_PROGRESS;
    // Invoices are visible for most active states
    return ["SENT", "PENDING", "OVERDUE", "PAID"].includes(status);
  }, [category, status]);

  const dotClass = React.useMemo(() => {
    if (category === "INVOICE") {
      switch (status) {
        case "PAID":
          return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
        case "OVERDUE":
          return "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]";
        case "PENDING":
        case "SENT":
          return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]";
        default:
          return "bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.8)]";
      }
    }
    
    // Default for Project/Task IN_PROGRESS
    return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
  }, [category, status]);

  if (!isVisible) return null;

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#0A0E17]",
        dotClass,
        className
      )}
    />
  );
}
