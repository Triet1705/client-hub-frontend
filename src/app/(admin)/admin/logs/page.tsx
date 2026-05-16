"use client";

import * as React from "react";
import { AuditLogTable } from "@/features/admin/components/audit-log-table";

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-content-primary">System Audit Logs</h2>
        <p className="text-content-muted">
          Track all user activities and system events across the platform.
        </p>
      </div>

      <AuditLogTable />
    </div>
  );
}
