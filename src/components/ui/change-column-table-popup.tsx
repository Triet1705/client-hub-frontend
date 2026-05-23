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
        <div className="absolute right-0 top-10 z-30 min-w-60 rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl">
          <p className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Visible Columns
          </p>

          <div className="flex flex-wrap gap-2">
            {columns.map((column) => {
              const checked = visibleColumns[column.key] ?? false;

              if (column.locked) {
                return (
                  <span
                    key={column.key}
                    className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 opacity-80 cursor-default"
                  >
                    {column.label}
                  </span>
                );
              }

              return (
                <button
                  key={column.key}
                  type="button"
                  onClick={() => onToggleColumn(column.key)}
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    checked
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-900/50 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-300"
                  }`}
                >
                  {column.label}
                </button>
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
              className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              Reset Columns
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
