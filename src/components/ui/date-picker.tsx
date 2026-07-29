import * as React from "react";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isError?: boolean;
  disabled?: boolean;
  className?: string;
}

function parseLocalDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatLocalDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  isError = false,
  disabled = false,
  className,
}: DatePickerProps) {
  const selectedDate = React.useMemo(() => parseLocalDate(value), [value]);

  return (
    <CustomDatePicker
      value={selectedDate}
      onChange={(date) => onChange(date ? formatLocalDate(date) : "")}
      placeholder={placeholder}
      isError={isError}
      disabled={disabled}
      className={className}
    />
  );
}
