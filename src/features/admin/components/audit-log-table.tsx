"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAdminAuditLogsQuery } from "../hooks/use-admin";
import { Pagination } from "@/components/ui/pagination";
import { AuditLogDetailSlideover } from "./audit-log-detail-slideover";
import { RoleBadge } from "./role-badge";
import { ACTION_ICON_MAP, ACTION_COLOR_MAP } from "../constants/admin-ui.constants";
import type { AdminAuditLogResponse } from "../types/admin.types";


export function AuditLogTable() {
  const [page, setPage] = React.useState(0);
  const [selectedLog, setSelectedLog] = React.useState<AdminAuditLogResponse | null>(null);
  const { data: logs, isLoading } = useAdminAuditLogsQuery({ page, size: 20 });

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/40 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Activity</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">IP Address</th>
                <th className="px-6 py-4 font-medium">Tenant</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-6 bg-slate-800/50 animate-pulse rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : logs?.content.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No activity logs found.</td>
                </tr>
              ) : (
                logs?.content.map((log) => (
                  <tr key={log.id} onClick={() => setSelectedLog(log)} className="group bg-slate-800/20 hover:bg-slate-800/60 ring-1 ring-transparent hover:ring-white/10 hover:-translate-y-px transition-all duration-300 hover:shadow-xl hover:z-10 relative cursor-pointer">
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
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {log.ipAddress || "—"}
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

      {logs && logs.totalPages > 1 && (
        <div className="mt-2">
          <Pagination
            page={page}
            totalPages={logs.totalPages}
            totalElements={logs.totalElements}
            onPageChange={setPage}
            label="logs"
          />
        </div>
      )}

      <AuditLogDetailSlideover 
        log={selectedLog} 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
    </div>
  );
}
