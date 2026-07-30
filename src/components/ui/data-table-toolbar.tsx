import * as React from "react";
import { ChangeColumnTablePopup, type ColumnOption } from "@/components/ui/change-column-table-popup";

interface DataTableToolbarProps {
  title: string;
  resultCount: number;
  totalCount: number;
  resultLabel: string;
  columns: ColumnOption[];
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (key: string) => void;
  onResetColumns: () => void;
}

export function DataTableToolbar({
  title,
  resultCount,
  totalCount,
  resultLabel,
  columns,
  visibleColumns,
  onToggleColumn,
  onResetColumns,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-theme-border px-6 py-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-content-secondary">{title}</h2>
      <div className="flex items-center gap-3">
        <p className="text-xs text-content-muted">
          {resultCount} result(s) from {totalCount} {resultLabel}
        </p>
        <ChangeColumnTablePopup
          columns={columns}
          visibleColumns={visibleColumns}
          onToggleColumn={onToggleColumn}
          onResetColumns={onResetColumns}
        />
      </div>
    </div>
  );
}
