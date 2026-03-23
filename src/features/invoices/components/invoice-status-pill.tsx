import { cn } from "@/lib/utils";
import { InvoiceStatus } from "@/lib/type";
import {
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_PILL_CLASS,
} from "../constants/invoice.constants";

interface InvoiceStatusPillProps {
  status: InvoiceStatus;
  className?: string;
}

export function InvoiceStatusPill({ status, className }: InvoiceStatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
        INVOICE_STATUS_PILL_CLASS[status],
        className,
      )}
    >
      {INVOICE_STATUS_LABELS[status]}
    </span>
  );
}
