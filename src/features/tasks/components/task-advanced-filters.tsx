import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/features/tasks/types/task.types";
import { AdvancedFilters } from "../utils/task-filter";
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
        className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-[1px]"
      />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-theme-border bg-surface shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-theme-border px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-content-primary">Advanced Filters</h3>
              <p className="mt-1 text-xs text-content-secondary">Refine tasks by keyword, statuses, and estimate range.</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md border border-theme-border p-1.5 text-content-secondary transition-colors hover:border-theme-border hover:text-content-secondary"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 custom-scrollbar">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-content-secondary">Keyword</label>
              <Input
                value={draft.keyword}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    keyword: event.target.value,
                  }))
                }
                placeholder="Title, description, project, assignee..."
                className="bg-surface-sunken border-theme-border text-sm focus:border-theme-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-content-secondary">Statuses</label>
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
                          ? "border-theme-accent bg-action-subtle text-theme-accent"
                          : "border-theme-border bg-surface-sunken text-content-secondary hover:border-theme-border",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-content-secondary">Estimated Hours</label>
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
                  className="bg-surface-sunken border-theme-border text-sm focus:border-theme-accent"
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
                  className="bg-surface-sunken border-theme-border text-sm focus:border-theme-accent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-theme-border px-5 py-4">
            <Button
              variant="outline"
              onClick={onReset}
              className="px-6 text-xs border-theme-border text-content-secondary hover:bg-surface-sunken"
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
