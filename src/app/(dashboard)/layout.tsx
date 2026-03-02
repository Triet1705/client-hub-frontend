import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
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
    <div className="relative min-h-screen bg-[#020617] font-space-grotesk text-slate-100 selection:bg-emerald-500/30">
      <Sidebar />

      <div className="flex flex-col pl-64 min-h-screen transition-all duration-300">
        <Header />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
