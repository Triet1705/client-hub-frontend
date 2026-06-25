"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useNavigationProgress } from "@/providers/navigation-progress-provider";

import {
  ClientHubLogo,
  NavDashboardIcon,
  NavProjectsIcon,
  NavInvoicesIcon,
  NavUsersIcon,
  NavSettingsIcon,
  NavHealthIcon,
  NavEventsIcon,
  NavFlagsIcon,
  NavAuditIcon,
} from "@/components/icons";

const SIDEBAR_STORAGE_KEY = "clienthub.admin.sidebar.collapsed";
const SIDEBAR_WIDTH_EXPANDED = "16rem";
const SIDEBAR_WIDTH_COLLAPSED = "5rem";



const ADMIN_NAV_ITEMS = [
  {
    name: "Overview",
    href: "/admin",
    icon: NavDashboardIcon,
    exactMatch: true,
  },
  {
    name: "Health",
    href: "/admin/health",
    icon: NavHealthIcon,
  },
  {
    name: "Events",
    href: "/admin/events",
    icon: NavEventsIcon,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: NavUsersIcon,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: NavProjectsIcon,
  },
  {
    name: "Invoices",
    href: "/admin/invoices",
    icon: NavInvoicesIcon,
  },
  {
    name: "Audit",
    href: "/admin/logs",
    icon: NavAuditIcon,
  },
  {
    name: "Flags",
    href: "/admin/flags",
    icon: NavFlagsIcon,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: NavSettingsIcon,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useLogout();
  const { pendingHref } = useNavigationProgress();

  const [isMounted, setIsMounted] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);

    const savedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (savedValue === "1") {
      setIsCollapsed(true);
    }
  }, []);

  React.useEffect(() => {
    if (!isMounted) return;

    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, isCollapsed ? "1" : "0");
    document.documentElement.style.setProperty(
      "--admin-sidebar-width",
      isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
    );
  }, [isCollapsed, isMounted]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 border-r border-theme-border bg-surface-base/95 backdrop-blur-xl flex flex-col transition-[width] duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-theme-border",
          isCollapsed ? "px-3" : "px-4",
        )}
      >
        <ClientHubLogo
          size="sm"
          showText={!isCollapsed}
          className={cn(
            "shrink-0 overflow-hidden",
            isCollapsed ? "w-8" : "w-auto [&_span:first-child]:text-sm [&_span:last-child]:text-[9px]",
          )}
        />
        <button
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md border border-theme-border bg-surface-elevated/70 text-content-secondary hover:border-theme-accent/40 hover:text-theme-accent-hover transition-colors",
            "ml-auto",
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="text-base leading-none">{isCollapsed ? ">" : "<"}</span>
        </button>
      </div>

      <div className={cn("flex-1 overflow-y-auto py-4 space-y-1", isCollapsed ? "px-2" : "px-3")}>
        {!isMounted ? (
          <div className="space-y-2 px-2">
            <div className="h-10 w-full animate-pulse rounded-lg bg-surface-elevated/50" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-surface-elevated/50" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-surface-elevated/50" />
          </div>
        ) : (
          ADMIN_NAV_ITEMS.map((item) => {
            const isActive = item.exactMatch ? pathname === item.href : pathname.startsWith(item.href);
            const isPending = item.exactMatch
              ? pendingHref === item.href && !isActive
              : pendingHref?.startsWith(item.href) && !isActive;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-lg py-2.5 text-sm font-medium transition-all duration-200 group",
                  isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                  isPending
                    ? "bg-surface-elevated text-theme-accent pointer-events-none"
                    : isActive
                    ? "bg-theme-accent-surface text-theme-accent"
                    : "text-content-muted hover:bg-surface-elevated/50 hover:text-content-primary",
                )}
                aria-busy={isPending}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isPending
                      ? "text-theme-accent animate-pulse"
                      : isActive
                      ? "text-theme-accent"
                      : "text-content-muted group-hover:text-content-secondary",
                  )}
                  isActive={isActive}
                />
                {!isCollapsed ? <span className="truncate">{isPending ? "Loading..." : item.name}</span> : null}
              </Link>
            );
          })
        )}
      </div>

      <div className="shrink-0 border-t border-theme-border p-3">
        <div
          className={cn(
            "flex items-center rounded-lg bg-surface-elevated/50 mb-2",
            isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2",
          )}
          title={isCollapsed && isMounted ? user?.email : undefined}
        >
          <div className="h-8 w-8 rounded-full bg-theme-accent/20 flex items-center justify-center text-theme-accent font-bold uppercase shrink-0">
            {isMounted && user?.email?.charAt(0)}
          </div>
          {!isCollapsed ? (
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-content-primary truncate">
                {isMounted ? user?.email : "Loading..."}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-theme-accent font-bold">
                PLATFORM ADMIN
              </span>
            </div>
          ) : null}
        </div>

        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center justify-center rounded-lg py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors",
            isCollapsed ? "px-2" : "gap-2 px-3",
          )}
          title={isCollapsed ? "Terminate Session" : undefined}
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
          {!isCollapsed ? "Terminate Session" : null}
        </button>
      </div>
    </aside>
  );
}
