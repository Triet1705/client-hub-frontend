"use client";

import * as React from "react";
import Link from "next/link";
import { usePlatformStatsQuery, useSystemHealthQuery, useAdminAuditLogsQuery } from "@/features/admin/hooks/use-admin";
import { PlatformStatsCards } from "@/features/admin/components/platform-stats-cards";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { NavUsersIcon, NavInvoicesIcon, NavProjectsIcon, ChevronRightIcon } from "@/components/icons";
import { ACTION_ICON_MAP, ACTION_COLOR_MAP } from "@/features/admin/constants/admin-ui.constants";
import { RoleBadge } from "@/features/admin/components/role-badge";




export default function AdminOverviewPage() {
  const { data: stats, isLoading: isStatsLoading } = usePlatformStatsQuery();
  const { data: health, isLoading: isHealthLoading } = useSystemHealthQuery();
  const { data: auditLogs, isLoading: isAuditLoading } = useAdminAuditLogsQuery({ page: 0, size: 10 });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Platform Pulse Banner */}
      {health && health.overallStatus !== "UP" && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-sm font-medium text-amber-400">
            System Notice: {health.database.status !== "UP" ? "Database" : health.redis.status !== "UP" ? "Redis" : "AI Engine"} is currently experiencing degraded performance.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white tracking-tight drop-shadow-sm">
            Platform Overview
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base max-w-xl leading-relaxed">
            Monitor system metrics and manage cross-tenant data.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link 
            href="/admin/users"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            Add User
          </Link>
        </div>
      </div>

      <PlatformStatsCards stats={stats} isLoading={isStatsLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-wide">System Health</h3>
            {health && (
              <span className={cn("text-xs font-mono px-2 py-1 rounded", 
                health.overallStatus === "UP" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                health.overallStatus === "DEGRADED" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : 
                "bg-red-500/10 text-red-400 border border-red-500/20"
              )}>
                STATUS: {health.overallStatus}
              </span>
            )}
          </div>
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-6">
            {isHealthLoading ? (
              <div className="flex justify-center items-center h-32">
                <span className="text-slate-500">Loading system health...</span>
              </div>
            ) : health ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Database Card */}
                <div className="group flex flex-col items-center justify-center rounded-2xl bg-slate-800/20 p-6 hover:bg-slate-800/60 ring-1 ring-transparent hover:ring-white/10 transition-all duration-300">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 border border-slate-700/50 mb-4 transition-colors group-hover:bg-slate-700/50", 
                    health.database.status === "UP" ? "text-emerald-500" : 
                    health.database.status === "DEGRADED" ? "text-amber-500" : "text-red-500"
                  )}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mb-1 tracking-widest uppercase">Database</p>
                  <p className="text-sm font-bold text-white mb-3">{health.database.label}</p>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className={cn("h-full",
                      health.database.status === "UP" ? "bg-emerald-500 w-[100%]" : 
                      health.database.status === "DEGRADED" ? "bg-amber-500 w-[50%]" : "bg-red-500 w-[15%]"
                    )} />
                  </div>
                </div>

                {/* Redis Card */}
                <div className="group flex flex-col items-center justify-center rounded-2xl bg-slate-800/20 p-6 hover:bg-slate-800/60 ring-1 ring-transparent hover:ring-white/10 transition-all duration-300">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 border border-slate-700/50 mb-4 transition-colors group-hover:bg-slate-700/50", 
                    health.redis.status === "UP" ? "text-emerald-500" : 
                    health.redis.status === "DEGRADED" ? "text-amber-500" : "text-red-500"
                  )}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mb-1 tracking-widest uppercase">Redis Cache</p>
                  <p className="text-sm font-bold text-white mb-3">{health.redis.label}</p>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className={cn("h-full",
                      health.redis.status === "UP" ? "bg-emerald-500 w-[100%]" : 
                      health.redis.status === "DEGRADED" ? "bg-amber-500 w-[50%]" : "bg-red-500 w-[15%]"
                    )} />
                  </div>
                </div>

                {/* AI Engine Card */}
                <div className="group flex flex-col items-center justify-center rounded-2xl bg-slate-800/20 p-6 hover:bg-slate-800/60 ring-1 ring-transparent hover:ring-white/10 transition-all duration-300">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 border border-slate-700/50 mb-4 transition-colors group-hover:bg-slate-700/50", 
                    health.aiEngine.status === "UP" ? "text-emerald-500" : 
                    health.aiEngine.status === "DEGRADED" ? "text-amber-500" : "text-red-500"
                  )}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 mb-1 tracking-widest uppercase">AI Engine</p>
                  <p className="text-sm font-bold text-white mb-3">{health.aiEngine.label}</p>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className={cn("h-full",
                      health.aiEngine.status === "UP" ? "bg-emerald-500 w-[100%]" : 
                      health.aiEngine.status === "DEGRADED" ? "bg-amber-500 w-[50%]" : "bg-red-500 w-[15%]"
                    )} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <span className="text-slate-500">Failed to load system health.</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white tracking-wide">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link href="/admin/users" className="flex items-center justify-between rounded-2xl bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-xl shadow-black/50 p-5 hover:bg-slate-800/80 hover:ring-white/10 transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <NavUsersIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Manage Users</span>
                  <span className="text-xs text-slate-500">{stats?.totalUsers || 0} Total</span>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" primaryColor="currentColor" accentColor="currentColor" />
            </Link>

            <Link href="/admin/invoices" className="flex items-center justify-between rounded-2xl bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-xl shadow-black/50 p-5 hover:bg-slate-800/80 hover:ring-white/10 transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                  <NavInvoicesIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">View All Invoices</span>
                  <span className="text-xs text-slate-500">{stats?.totalInvoices || 0} Total</span>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" primaryColor="currentColor" accentColor="currentColor" />
            </Link>

            <Link href="/admin/projects" className="flex items-center justify-between rounded-2xl bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-xl shadow-black/50 p-5 hover:bg-slate-800/80 hover:ring-white/10 transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <NavProjectsIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">View All Projects</span>
                  <span className="text-xs text-slate-500">{stats?.totalProjects || 0} Total</span>
                </div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" primaryColor="currentColor" accentColor="currentColor" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white tracking-wide">Recent System Activity</h3>
          <Link 
            href="/admin/logs" 
            className="text-xs font-bold text-emerald-400 tracking-wider hover:text-emerald-300 transition-colors uppercase"
          >
            View Audit Log
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/40 text-xs uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Activity</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Tenant</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isAuditLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-6 bg-slate-800/50 animate-pulse rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : auditLogs?.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No activity found.</td>
                </tr>
              ) : (
                auditLogs?.content.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={cn("h-6 w-6 rounded-full flex items-center justify-center", ACTION_COLOR_MAP[log.action] || ACTION_COLOR_MAP["DEFAULT"])}>
                        {ACTION_ICON_MAP[log.action] ? React.createElement(ACTION_ICON_MAP[log.action], { className: "h-3 w-3" }) : React.createElement(ACTION_ICON_MAP["DEFAULT"], { className: "h-3 w-3" })}
                      </div>
                      <span className="text-slate-300 font-medium">{log.action.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                          {log.userEmail ? log.userEmail.charAt(0).toUpperCase() : "?"}
                        </div>
                        <span className={!log.userEmail ? "text-slate-600" : ""}>
                          {log.userEmail || "Anonymous"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={log.userRole === "UNKNOWN" || log.userRole === "SYSTEM" ? null : log.userRole} />
                    </td>
                    <td className="px-6 py-4">
                      {log.entityType ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-blue-500/10 text-blue-400 uppercase">
                          {log.entityType}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {log.tenantId || <span className="text-slate-400">SYSTEM</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
