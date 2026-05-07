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
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono pointer-events-none">
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
