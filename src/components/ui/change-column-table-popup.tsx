"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";

export interface ColumnOption {
  key: string;
  label: string;
  locked?: boolean;
}

interface ChangeColumnTablePopupProps {
  columns: ColumnOption[];
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (key: string) => void;
  onResetColumns?: () => void;
}

export function ChangeColumnTablePopup({
  columns,
  visibleColumns,
  onToggleColumn,
  onResetColumns,
}: ChangeColumnTablePopupProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-700 bg-slate-900/80 px-2.5 text-xs font-bold text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Columns
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-10 z-30 min-w-52 rounded-md border border-slate-700 bg-[#020617] p-2 shadow-xl">
          <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Visible Columns
          </p>

          <div className="space-y-1">
            {columns.map((column) => {
              const checked = visibleColumns[column.key] ?? false;

              return (
                <label
                  key={column.key}
                  className="flex items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
                >
                  <span>{column.label}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={column.locked}
                    onChange={() => onToggleColumn(column.key)}
                    className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-950 text-emerald-500 focus:ring-emerald-500/30"
                  />
                </label>
              );
            })}
          </div>

          {onResetColumns ? (
            <button
              type="button"
              onClick={() => {
                onResetColumns();
                setIsOpen(false);
              }}
              className="mt-2 w-full rounded-sm border border-slate-700 px-2 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            >
              Reset Columns
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
