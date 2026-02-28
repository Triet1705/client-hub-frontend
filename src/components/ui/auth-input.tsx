"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { VisibilityOpenIcon, VisibilityClosedIcon } from "@/components/icons";

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Custom SVG icon component rendered before the input */
  icon?: React.ComponentType<{ className?: string }>;
  error?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, label, icon: Icon, type, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;

    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="group relative flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className={cn(
            "text-[10px] uppercase tracking-[0.2em] font-bold transition-colors cursor-pointer w-fit",
            error
              ? "text-red-400"
              : "text-slate-500 group-focus-within:text-emerald-400",
          )}
        >
          {label}
        </label>

        <div className="flex items-center relative">
          {Icon && (
            <span className="mr-2 shrink-0 select-none" aria-hidden="true">
              <Icon className="w-5 h-5" />
            </span>
          )}

          <input
            id={inputId}
            type={inputType}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "w-full bg-transparent border-t-0 border-x-0 border-b border-slate-800 focus:border-emerald-500 focus:ring-0 text-white placeholder-slate-700 py-2 px-0 transition-all text-base disabled:opacity-50",
              error && "border-red-500/50 focus:border-red-500",
              isPassword && "pr-10",
              className,
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-0 text-slate-600 hover:text-slate-400 transition-colors flex items-center justify-center p-2"
              onClick={() => setShowPassword(!showPassword)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {showPassword ? (
                <VisibilityClosedIcon className="w-5 h-5" />
              ) : (
                <VisibilityOpenIcon className="w-5 h-5" />
              )}
            </button>
          )}

          <div
            className={cn(
              "absolute bottom-0 left-0 h-px transition-all duration-300 pointer-events-none",
              error
                ? "w-full bg-red-500"
                : "w-0 bg-emerald-500 group-focus-within:w-full",
            )}
          />
        </div>

        <div className="min-h-5">
          {error && (
            <p
              id={errorId}
              className="text-[11px] text-red-400 font-medium animate-in fade-in slide-in-from-top-1"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";
