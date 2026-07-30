import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./input";

interface CurrencyInputProps extends InputProps {
  symbol?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ symbol = "$", className, ...props }, ref) => {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-content-muted">
          {symbol}
        </span>
        <Input
          ref={ref}
          className={cn("pl-8 font-mono", className)}
          inputMode="decimal"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
