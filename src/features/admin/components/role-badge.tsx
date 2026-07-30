import * as React from "react";
import type { Role } from "@/features/auth/types/auth.types";

interface RoleBadgeProps {
  role?: Role | string | null;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (!role) {
    return <span className="text-content-muted italic">N/A</span>;
  }

  switch (role) {
    case "ADMIN":
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-action-subtle text-theme-accent uppercase ring-1 ring-theme-accent">ADMIN</span>;
    case "CLIENT":
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-status-info-surface text-status-info-text uppercase ring-1 ring-status-info-border">CLIENT</span>;
    case "FREELANCER":
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-status-warning-surface text-status-warning-text uppercase ring-1 ring-status-warning-border">FREELANCER</span>;
    default:
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-status-neutral-surface text-content-secondary uppercase ring-1 ring-status-neutral-border">{role}</span>;
  }
}
