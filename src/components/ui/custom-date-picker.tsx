"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface CustomDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className = "",
  disabled = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Basic outside click check
      const target = event.target as HTMLElement;
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !target.closest(".rdp-portal-container") // Exclude clicks inside the portal
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
  };

  const dropdown = (
    <div
      className="absolute z-[9999] bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl p-3 rdp-portal-container"
      style={{
        top: dropdownCoords.top,
        left: dropdownCoords.left,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* We apply a wrapper class to style react-day-picker for our dark theme */}
      <style dangerouslySetInnerHTML={{ __html: `
        .rdp-portal-container {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #10b981; /* emerald-500 */
          --rdp-background-color: rgba(16, 185, 129, 0.1);
          --rdp-accent-color-dark: #059669; /* emerald-600 */
          --rdp-background-color-dark: rgba(16, 185, 129, 0.2);
          --rdp-outline: 2px solid #10b981;
          --rdp-outline-selected: 2px solid #10b981;
        }
        .rdp-portal-container .rdp {
          margin: 0;
          color: #f1f5f9; /* slate-100 */
        }
        .rdp-portal-container .rdp-day_selected, 
        .rdp-portal-container .rdp-day_selected:focus-visible, 
        .rdp-portal-container .rdp-day_selected:hover {
          color: white;
          background-color: var(--rdp-accent-color);
        }
        .rdp-portal-container .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: rgba(255,255,255,0.1);
        }
        .rdp-portal-container .rdp-day_today {
          font-weight: bold;
          color: #34d399; /* emerald-400 */
        }
      `}} />
      <DayPicker
        mode="single"
        selected={value}
        onSelect={handleSelect}
        showOutsideDays
      />
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-left transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-slate-400" />
          <span className={`block truncate ${!value ? "text-slate-400" : "text-slate-100"}`}>
            {value ? format(value, "dd/MM/yyyy") : placeholder}
          </span>
        </div>
      </button>

      {mounted && isOpen && createPortal(dropdown, document.body)}
    </div>
  );
}
