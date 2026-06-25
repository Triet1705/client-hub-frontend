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
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/10 text-emerald-400 uppercase ring-1 ring-emerald-500/30">ADMIN</span>;
    case "CLIENT":
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-sky-500/10 text-sky-400 uppercase ring-1 ring-sky-500/30">CLIENT</span>;
    case "FREELANCER":
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-amber-500/10 text-amber-400 uppercase ring-1 ring-amber-500/30">FREELANCER</span>;
    default:
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-slate-500/10 text-slate-400 uppercase ring-1 ring-slate-500/30">{role}</span>;
  }
}
