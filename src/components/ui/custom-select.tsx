"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className = "",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If click is outside container AND outside portal dropdown, close it
      // Simple approach: just rely on the portal click handling or overlay
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    // We bind to document to capture all clicks
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
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  const dropdown = (
    <div
      className="absolute z-[9999] bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl py-1"
      style={{
        top: dropdownCoords.top,
        left: dropdownCoords.left,
        width: dropdownCoords.width,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-h-60 overflow-y-auto custom-scrollbar px-1">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${
                isSelected
                  ? "bg-emerald-500/10 text-emerald-400 font-medium"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span>{option.label}</span>
              {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
            </button>
          );
        })}
      </div>
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
        <span className={`block truncate ${!selectedOption ? "text-slate-400" : "text-slate-100"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {mounted && isOpen && createPortal(dropdown, document.body)}
    </div>
  );
}
