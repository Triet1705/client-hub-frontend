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
    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
      <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400">{title}</h2>
      <div className="flex items-center gap-3">
        <p className="text-xs text-slate-500">
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
