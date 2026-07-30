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
  NavTasksIcon,
  NavInvoicesIcon,
  NavCommunicationIcon,
  NavSettingsIcon,
  PersonIcon,
} from "@/components/icons";

const SIDEBAR_STORAGE_KEY = "clienthub.sidebar.collapsed";
const SIDEBAR_WIDTH_EXPANDED = "16rem";
const SIDEBAR_WIDTH_COLLAPSED = "5rem";
export const DASHBOARD_SIDEBAR_TOGGLE_EVENT =
  "clienthub:dashboard-sidebar-toggle";

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
    name: "Profile",
    href: "/profile",
    icon: PersonIcon,
    roles: ["ADMIN", "CLIENT", "FREELANCER"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: NavSettingsIcon,
    roles: ["CLIENT", "FREELANCER"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { logout } = useLogout();
  const { pendingHref } = useNavigationProgress();

  const [isMounted, setIsMounted] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

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
      "--dashboard-sidebar-width",
      isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
    );
  }, [isCollapsed, isMounted]);

  React.useEffect(() => {
    const toggleMobileSidebar = () => {
      setIsCollapsed(false);
      setIsMobileOpen((current) => !current);
    };
    window.addEventListener(
      DASHBOARD_SIDEBAR_TOGGLE_EVENT,
      toggleMobileSidebar,
    );
    return () =>
      window.removeEventListener(
        DASHBOARD_SIDEBAR_TOGGLE_EVENT,
        toggleMobileSidebar,
      );
  }, []);

  React.useEffect(() => setIsMobileOpen(false), [pathname]);

  const authorizedMenus = NAV_ITEMS.filter(
    (item) => isMounted && user?.role && item.roles.includes(user.role),
  );

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Close workspace navigation"
          className="fixed inset-0 z-40 bg-[var(--overlay)] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-theme-border bg-surface-base/95 backdrop-blur-xl transition-[width,transform] duration-300 md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "md:w-20" : "md:w-64",
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
            "ml-auto hidden h-8 w-8 items-center justify-center rounded-md border border-theme-border bg-surface/70 text-content-secondary transition-colors hover:border-theme-accent hover:text-theme-accent md:inline-flex",
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
          authorizedMenus.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const isPending = pendingHref?.startsWith(item.href) && !isActive;
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
                    ? "bg-surface-elevated/70 text-theme-accent pointer-events-none"
                    : isActive
                    ? "bg-action-subtle text-theme-accent"
                    : "text-content-secondary hover:bg-surface-elevated/50 hover:text-content-primary",
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
                  primaryColor="currentColor"
                  accentColor="currentColor"
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
            "flex items-center rounded-lg bg-surface/50 mb-2",
            isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2",
          )}
          title={isCollapsed && isMounted ? user?.email : undefined}
        >
          <div className="h-8 w-8 rounded-full bg-action-subtle flex items-center justify-center text-theme-accent font-bold uppercase shrink-0">
            {isMounted && user?.email?.charAt(0)}
          </div>
          {!isCollapsed ? (
            <div className="flex flex-col truncate">
              <span className="text-sm font-medium text-content-primary truncate">
                {isMounted ? user?.email : "Loading..."}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-content-muted font-bold">
                {isMounted ? user?.role : "SESSION"}
              </span>
            </div>
          ) : null}
        </div>

        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center justify-center rounded-lg py-2 text-sm font-medium text-status-danger-text hover:bg-status-danger-surface hover:text-status-danger-text transition-colors",
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
    </>
  );
}
