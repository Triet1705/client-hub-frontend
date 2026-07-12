import * as React from "react";
import { OptimisticRouteShell } from "@/components/layout/optimistic-route-shell";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminProvider } from "@/features/admin/context/admin.context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider isAdmin={true}>
      <div className="flex h-screen bg-surface-base text-content-secondary font-sans selection:bg-theme-accent/30">
        <AdminSidebar />
        
        <div className="flex min-w-0 flex-1 flex-col transition-[padding] duration-300 md:pl-[var(--admin-sidebar-width,16rem)]">
          <AdminHeader />
          <main className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 scroll-smooth">
            <div className="mx-auto max-w-7xl">
              <OptimisticRouteShell scope="admin">
                {children}
              </OptimisticRouteShell>
            </div>
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
