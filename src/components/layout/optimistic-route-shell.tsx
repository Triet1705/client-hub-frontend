"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  AdminSettingsSkeleton,
  AdminTableSkeleton,
  CommunicationSkeleton,
  DashboardSkeleton,
  InvoiceDetailSkeleton,
  InvoicesSkeleton,
  ProfileSkeleton,
  ProjectDetailSkeleton,
  ProjectsSkeleton,
  SettingsSkeleton,
  TasksSkeleton,
} from "@/components/skeletons/page-skeletons";
import { useNavigationProgress } from "@/providers/navigation-progress-provider";

type ShellScope = "dashboard" | "admin";

function getPathnameFromHref(href: string) {
  try {
    return new URL(href, "http://client-hub.local").pathname;
  } catch {
    return href.split("?")[0] || href;
  }
}

function getDashboardSkeleton(pathname: string) {
  if (pathname === "/dashboard") return <DashboardSkeleton />;
  if (pathname === "/projects") return <ProjectsSkeleton />;
  if (pathname.startsWith("/projects/")) return <ProjectDetailSkeleton />;
  if (pathname === "/tasks") return <TasksSkeleton />;
  if (pathname === "/invoices") return <InvoicesSkeleton />;
  if (pathname.startsWith("/invoices/")) return <InvoiceDetailSkeleton />;
  if (pathname === "/communication") return <CommunicationSkeleton />;
  if (pathname === "/profile") return <ProfileSkeleton />;
  if (pathname === "/settings") return <SettingsSkeleton />;
  return null;
}

function getAdminSkeleton(pathname: string) {
  if (pathname === "/admin") return <DashboardSkeleton />;
  if (pathname === "/admin/settings") return <AdminSettingsSkeleton />;
  if (
    pathname === "/admin/users" ||
    pathname === "/admin/projects" ||
    pathname === "/admin/invoices" ||
    pathname === "/admin/logs" ||
    pathname === "/admin/health" ||
    pathname === "/admin/events" ||
    pathname === "/admin/flags"
  ) {
    return <AdminTableSkeleton />;
  }
  return null;
}

export function OptimisticRouteShell({
  children,
  scope,
}: {
  children: React.ReactNode;
  scope: ShellScope;
}) {
  const pathname = usePathname();
  const { pendingHref } = useNavigationProgress();

  const pendingPathname = pendingHref ? getPathnameFromHref(pendingHref) : null;
  const skeleton = pendingPathname
    ? scope === "admin"
      ? getAdminSkeleton(pendingPathname)
      : getDashboardSkeleton(pendingPathname)
    : null;

  if (skeleton && pendingPathname !== pathname) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-200" aria-busy="true">
        {skeleton}
      </div>
    );
  }

  return <>{children}</>;
}
