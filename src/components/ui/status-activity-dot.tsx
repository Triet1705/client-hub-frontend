import * as React from "react";
import { cn } from "@/lib/utils";
import { ProjectStatus, TaskStatus } from "@/lib/type";

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
    return ["SENT", "PENDING", "OVERDUE", "PAID"].includes(status);
  }, [category, status]);

  const dotClass = React.useMemo(() => {
    if (category === "INVOICE") {
      switch (status) {
        case "PAID":
          return "bg-status-success-text shadow-[0_0_8px_rgba(16,185,129,0.65)]";
        case "OVERDUE":
          return "bg-status-danger-text shadow-[0_0_8px_rgba(244,63,94,0.65)]";
        case "PENDING":
        case "SENT":
          return "bg-status-warning-text shadow-[0_0_8px_rgba(245,158,11,0.65)]";
        default:
          return "bg-status-neutral-text";
      }
    }

    return "bg-status-success-text shadow-[0_0_8px_rgba(16,185,129,0.65)]";
  }, [category, status]);

  if (!isVisible) return null;

  return (
    <span
      className={cn(
        "absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-surface",
        dotClass,
        className
      )}
    />
  );
}
