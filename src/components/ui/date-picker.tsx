import * as React from "react";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isError?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  isError = false,
  disabled = false,
  className,
}: DatePickerProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const openPicker = React.useCallback(() => {
    if (disabled) return;
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  }, [disabled]);

  const displayDate = React.useMemo(() => {
    if (!value) return null;
    try {
      // Add time to avoid timezone issues with pure dates
      return format(new Date(value + "T00:00:00"), "MMM d, yyyy");
    } catch (e) {
      return null;
    }
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <div
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm flex items-center gap-3 cursor-pointer select-none transition-all",
          disabled && "opacity-60 cursor-not-allowed",
          isError
            ? "border-rose-500"
            : "border-slate-700 hover:border-slate-600",
          value ? "text-white" : "text-slate-600",
        )}
      >
        <Calendar className="w-4 h-4 shrink-0 text-slate-500" />
        <span className="truncate">{displayDate || placeholder}</span>
      </div>
      
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none scheme-dark"
      />
    </div>
  );
}
