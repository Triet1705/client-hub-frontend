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

interface AuditLogTableProps {
  action?: string;
  entityType?: string;
  tenantId?: string;
  anchored?: boolean;
}

export function AuditLogTable({ action, entityType, tenantId, anchored }: AuditLogTableProps = {}) {
  const [page, setPage] = React.useState(0);
  const [selectedLog, setSelectedLog] = React.useState<AdminAuditLogResponse | null>(null);
  
  // Reset page when filters change
  React.useEffect(() => {
    setPage(0);
  }, [action, entityType, tenantId, anchored]);

  const { data: logs, isLoading } = useAdminAuditLogsQuery({ 
    page, 
    size: 20,
    action: action || undefined,
    entityType: entityType || undefined,
    tenantId: tenantId || undefined,
    anchored: anchored !== undefined ? anchored : undefined,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl border border-white/5 bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-theme-border text-[10px] font-bold uppercase tracking-widest text-content-muted">
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
            <tbody className="divide-y divide-theme-border">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-6 bg-surface-base/70 animate-pulse rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : logs?.content.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-content-muted">No activity logs found.</td>
                </tr>
              ) : (
                logs?.content.map((log) => (
                  <tr key={log.id} onClick={() => setSelectedLog(log)} className="group bg-transparent hover:bg-surface-base/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={cn("h-6 w-6 rounded-md flex items-center justify-center", ACTION_COLOR_MAP[log.action] || ACTION_COLOR_MAP["DEFAULT"])}>
                        {ACTION_ICON_MAP[log.action] ? React.createElement(ACTION_ICON_MAP[log.action], { className: "h-3 w-3" }) : React.createElement(ACTION_ICON_MAP["DEFAULT"], { className: "h-3 w-3" })}
                      </div>
                      <span className="text-content-primary font-medium">{log.action.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-6 py-4 text-content-secondary">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-surface-elevated flex items-center justify-center text-xs font-bold text-content-muted">
                          {log.userEmail ? log.userEmail.charAt(0).toUpperCase() : "?"}
                        </div>
                        <span className={!log.userEmail ? "text-content-muted" : ""}>
                          {log.userEmail || "Anonymous"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={log.userRole === "UNKNOWN" || log.userRole === "SYSTEM" ? null : log.userRole} />
                    </td>
                    <td className="px-6 py-4">
                      {log.entityType ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-sky-500/10 text-sky-400 uppercase">
                          {log.entityType}
                        </span>
                      ) : (
                        <span className="text-content-muted">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-content-muted font-mono text-xs">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="px-6 py-4 text-content-muted">
                      {log.tenantId || <span className="text-content-muted">SYSTEM</span>}
                    </td>
                    <td className="px-6 py-4 text-content-muted text-xs">
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
