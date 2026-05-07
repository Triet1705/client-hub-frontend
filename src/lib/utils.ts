import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFiat(amount: number | string | null | undefined, currency = "USD"): string {
  if (amount == null) return "—";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) return "—";

  if (num < 0) {
    return `-${formatFiat(Math.abs(num), currency)}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(num);
}

export function formatDate(val: string | null | undefined, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-US", options);
}

export function formatTokenDisplay(
  amountStr: string | undefined | null,
  symbol = "USDT",
): string {
  if (!amountStr) return `0 ${symbol}`;

  return `${amountStr} ${symbol}`;
}

export function truncateAddress(address: string | undefined): string {
  if (!address) return "";

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
