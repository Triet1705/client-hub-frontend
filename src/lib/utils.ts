import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFiat(amount: number | string, currency = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) return "0.00";

  if (num < 0) {
    return `-${formatFiat(Math.abs(num), currency)}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(num);
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
