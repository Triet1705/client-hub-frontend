"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLogout } from "@/features/auth/hooks/use-logout";

import {
  ClientHubLogo,
  NavDashboardIcon,
  NavProjectsIcon,
  NavTasksIcon,
  NavInvoicesIcon,
  NavCommunicationIcon,
  NavAdminIcon,
} from "@/components/icons";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: NavDashboardIcon,
    roles: ["ADMIN", "CLIENT", "FREELANCER"],
  },
  {
    name: "Projects",
    href: "/projects",
    icon: NavProjectsIcon,
    roles: ["ADMIN", "CLIENT", "FREELANCER"],
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: NavTasksIcon,
    roles: ["ADMIN", "CLIENT", "FREELANCER"],
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: NavInvoicesIcon,
    roles: ["ADMIN", "CLIENT", "FREELANCER"],
  },
  {
    name: "Communication",
    href: "/communication",
    icon: NavCommunicationIcon,
    roles: ["ADMIN", "CLIENT", "FREELANCER"],
  },
  {
    name: "Admin Portal",
    href: "/admin",
    icon: NavAdminIcon,
    roles: ["ADMIN"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useLogout();

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);

  const authorizedMenus = NAV_ITEMS.filter(
    (item) => isMounted && user?.role && item.roles.includes(user.role),
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-[#020617]/95 backdrop-blur-xl flex flex-col transition-all">
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-slate-800">
        <ClientHubLogo className="h-8 w-8 text-emerald-500" />
        {/* <span className="text-lg font-space-grotesk font-bold tracking-tight text-white">
          Client Hub
        </span> */}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {!isMounted ? (
          <div className="space-y-2 px-3">
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-800/50" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-800/50" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-slate-800/50" />
          </div>
        ) : (
          authorizedMenus.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive
                      ? "text-emerald-400"
                      : "text-slate-500 group-hover:text-slate-300",
                  )}
                  isActive={isActive}
                />
                {item.name}
              </Link>
            );
          })
        )}
      </div>

      <div className="shrink-0 border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-slate-900/50">
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold uppercase shrink-0">
            {isMounted && user?.email?.charAt(0)}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-medium text-white truncate">
              {isMounted ? user?.email : "Loading..."}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              {isMounted ? user?.role : "SESSION"}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Terminate Session
        </button>
      </div>
    </aside>
  );
}
