import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { OptimisticRouteShell } from "@/components/layout/optimistic-route-shell";
import { ImpersonationBanner } from "@/features/admin/components/impersonation-banner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Hub | Dashboard",
  description: "Secure workspace management.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell relative min-h-screen bg-surface-base font-space-grotesk text-content-primary selection:bg-theme-accent-surface">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col transition-[padding] duration-300 md:pl-[var(--dashboard-sidebar-width,16rem)]">
        <ImpersonationBanner />
        <Header />

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OptimisticRouteShell scope="dashboard">
              {children}
            </OptimisticRouteShell>
          </div>
        </main>
      </div>
    </div>
  );
}
