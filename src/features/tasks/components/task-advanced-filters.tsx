import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/features/tasks/types/task.types";
import { AdvancedFilters, DEFAULT_ADVANCED_FILTERS } from "../utils/task-filter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TaskAdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
  onReset: () => void;
}

export function TaskAdvancedFilters({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}: TaskAdvancedFiltersProps) {
  const [draft, setDraft] = React.useState<AdvancedFilters>(filters);

  React.useEffect(() => {
    if (isOpen) {
      setDraft(filters);
    }
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleToggleStatus = (status: TaskStatus) => {
    setDraft((prev) => {
      const exists = prev.statuses.includes(status);
      return {
        ...prev,
        statuses: exists ? prev.statuses.filter((item) => item !== status) : [...prev.statuses, status],
      };
    });
  };

  return (
    <>
      <button
        aria-label="Close advanced filters"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
      />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-[#0c0c0c] shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Advanced Filters</h3>
              <p className="mt-1 text-xs text-slate-400">Refine tasks by keyword, statuses, and estimate range.</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md border border-white/10 p-1.5 text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 custom-scrollbar">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Keyword</label>
              <Input
                value={draft.keyword}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    keyword: event.target.value,
                  }))
                }
                placeholder="Title, description, project, assignee..."
                className="bg-white/5 border-white/10 text-sm focus:border-emerald-400/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Statuses</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "To Do", value: TaskStatus.TODO },
                  { label: "In Progress", value: TaskStatus.IN_PROGRESS },
                  { label: "Done", value: TaskStatus.DONE },
                  { label: "Cancelled", value: TaskStatus.CANCELED },
                ].map((option) => {
                  const selected = draft.statuses.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleToggleStatus(option.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                        selected
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estimated Hours</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={draft.minEstimate}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      minEstimate: event.target.value,
                    }))
                  }
                  placeholder="Min"
                  className="bg-white/5 border-white/10 text-sm focus:border-emerald-400/40"
                />
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={draft.maxEstimate}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      maxEstimate: event.target.value,
                    }))
                  }
                  placeholder="Max"
                  className="bg-white/5 border-white/10 text-sm focus:border-emerald-400/40"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/10 px-5 py-4">
            <Button
              variant="outline"
              onClick={onReset}
              className="px-6 text-xs border-white/10 text-slate-300 hover:bg-white/5"
            >
              Reset
            </Button>
            <Button
              onClick={() => onApply(draft)}
              className="px-6 text-xs font-bold"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
