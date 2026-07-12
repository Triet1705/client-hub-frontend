"use client";

import * as React from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu } from "lucide-react";
import { ADMIN_SIDEBAR_TOGGLE_EVENT } from "./admin-sidebar";

export function AdminHeader() {
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-theme-border bg-surface-base/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open admin navigation"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-theme-border text-content-secondary md:hidden"
          onClick={() => window.dispatchEvent(new Event(ADMIN_SIDEBAR_TOGGLE_EVENT))}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-content-primary tracking-tight">Platform Admin</h1>
      </div>

      <div className="flex items-center gap-5">
        <ThemeToggle />
        <div className="flex items-center gap-3 rounded-full bg-surface-elevated/50 py-1.5 pl-1.5 pr-4 border border-theme-border">
          <div className="h-8 w-8 rounded-full bg-theme-accent/20 flex items-center justify-center text-theme-accent font-bold uppercase shrink-0 text-xs">
            {isMounted && user?.email?.charAt(0)}
          </div>
          <span className="hidden text-sm font-medium text-content-secondary sm:inline">
            {isMounted ? user?.email : "Loading..."}
          </span>
        </div>
      </div>
    </header>
  );
}
