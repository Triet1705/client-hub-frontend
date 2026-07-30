"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { Matcher } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  disabledDays?: Matcher | Matcher[];
  isError?: boolean;
}

const CALENDAR_WIDTH = 320;
const CALENDAR_ESTIMATED_HEIGHT = 390;
const VIEWPORT_GUTTER = 12;

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  disabledDays,
  isError = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [dropdownCoords, setDropdownCoords] = React.useState({ top: 0, left: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Portal rendering must wait until the client DOM exists.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const updatePosition = React.useCallback(() => {
    const trigger = containerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const left = Math.min(
      Math.max(VIEWPORT_GUTTER, rect.left),
      Math.max(VIEWPORT_GUTTER, window.innerWidth - CALENDAR_WIDTH - VIEWPORT_GUTTER),
    );
    const hasRoomBelow =
      window.innerHeight - rect.bottom >= CALENDAR_ESTIMATED_HEIGHT;
    const top = hasRoomBelow
      ? rect.bottom + 8
      : Math.max(VIEWPORT_GUTTER, rect.top - CALENDAR_ESTIMATED_HEIGHT - 8);

    setDropdownCoords({ top, left });
  }, []);

  React.useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const calendar = document.querySelector("[data-clienthub-date-picker]");
      if (
        !containerRef.current?.contains(target) &&
        !calendar?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    if (date) setIsOpen(false);
  };

  const calendar = (
    <div
      data-clienthub-date-picker
      role="dialog"
      aria-label="Choose a date"
      className="fixed z-[9999] w-80 rounded-2xl border border-theme-border bg-surface-base p-3 text-content-primary shadow-[0_18px_45px_var(--shadow-color)] ring-1 ring-theme-border"
      style={{ top: dropdownCoords.top, left: dropdownCoords.left }}
    >
      <div className="mb-2 flex items-center justify-between border-b border-theme-border-subtle px-1 pb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">
            Schedule
          </p>
          <p className="mt-1 text-sm font-semibold text-content-primary">
            {value ? format(value, "EEEE, MMM d") : "Select a date"}
          </p>
        </div>
        <button
          type="button"
          aria-label="Close calendar"
          onClick={() => setIsOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-elevated hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <DayPicker
        mode="single"
        selected={value}
        defaultMonth={value}
        onSelect={handleSelect}
        disabled={disabledDays}
        showOutsideDays
        classNames={{
          root: "m-0 w-full",
          months: "w-full",
          month: "w-full space-y-3",
          month_caption: "relative flex h-10 items-center justify-center",
          caption_label: "text-sm font-bold tracking-wide text-content-primary",
          nav: "absolute inset-x-0 top-0 flex h-10 items-center justify-between",
          button_previous: "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-content-muted transition-colors hover:border-theme-border hover:bg-surface-elevated hover:text-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent",
          button_next: "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-content-muted transition-colors hover:border-theme-border hover:bg-surface-elevated hover:text-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent",
          chevron: "h-4 w-4 fill-current",
          month_grid: "w-full border-collapse",
          weekdays: "grid grid-cols-7",
          weekday: "py-2 text-center text-[10px] font-bold uppercase tracking-wider text-content-muted",
          weeks: "block",
          week: "mt-1 grid grid-cols-7",
          day: "relative h-10 w-10 p-0 text-center",
          day_button: "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium text-content-secondary transition-all hover:bg-theme-accent-surface hover:text-theme-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent",
          selected: "[&>button]:bg-action-primary [&>button]:font-bold [&>button]:text-action-primary-foreground [&>button]:shadow-lg hover:[&>button]:bg-action-primary-hover",
          today: "[&>button]:border [&>button]:border-theme-accent/50 [&>button]:text-theme-accent",
          outside: "[&>button]:text-content-muted [&>button]:opacity-35",
          disabled: "[&>button]:cursor-not-allowed [&>button]:opacity-25 [&>button]:hover:bg-transparent [&>button]:hover:text-content-muted",
          hidden: "invisible",
          focused: "[&>button]:ring-2 [&>button]:ring-theme-accent",
        }}
        style={{
          "--rdp-accent-color": "var(--theme-accent)",
          "--rdp-accent-background-color": "var(--theme-accent-surface)",
        } as React.CSSProperties}
      />
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-invalid={isError}
        onClick={() => {
          if (!disabled) setIsOpen((current) => !current);
        }}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-surface-base/70 px-4 py-3 text-left text-sm transition-all",
          "hover:bg-surface-elevated/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent/50",
          isOpen
            ? "border-theme-accent shadow-[0_0_0_1px_var(--theme-accent)]"
            : "border-theme-border hover:border-theme-accent/60",
          isError && "border-status-danger-border focus-visible:ring-status-danger-text/40",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-theme-accent-surface text-theme-accent",
              !value && !isOpen && "bg-surface-elevated text-content-muted",
            )}
          >
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className={cn("truncate", value ? "font-medium text-content-primary" : "text-content-muted")}>
            {value ? format(value, "MMM d, yyyy") : placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-content-muted transition-transform",
            isOpen && "rotate-180 text-theme-accent",
          )}
        />
      </button>

      {mounted && isOpen ? createPortal(calendar, document.body) : null}
    </div>
  );
}
