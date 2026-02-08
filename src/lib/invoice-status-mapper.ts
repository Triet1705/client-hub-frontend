import {
  EscrowWaitingIcon,
  BlockchainPendingIcon,
  CryptographicLockIcon,
  FundsReleasedIcon,
} from "@/components/icons";
import { InvoiceStatus, EscrowStatus } from "@/lib/type";

export interface InvoiceStatusConfig {
  icon: React.ComponentType<{
    className?: string;
    primaryColor?: string;
    accentColor?: string;
    confirmations?: number;
  }>;
  primaryColor: string;
  accentColor: string;
  label: string;
  description: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  shouldAnimate?: boolean;
}

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, InvoiceStatusConfig> =
  {
    [InvoiceStatus.DRAFT]: {
      icon: EscrowWaitingIcon,
      primaryColor: "#64748b", // --state-draft
      accentColor: "#94a3b8",
      label: "Draft",
      description: "Invoice created but not sent",
      bgClass: "bg-gray-100",
      textClass: "text-gray-700",
      borderClass: "border-gray-300",
      shouldAnimate: false,
    },

    [InvoiceStatus.SENT]: {
      icon: EscrowWaitingIcon,
      primaryColor: "#64748b", // --state-draft
      accentColor: "#94a3b8",
      label: "Sent",
      description: "Invoice sent to client",
      bgClass: "bg-slate-100",
      textClass: "text-slate-700",
      borderClass: "border-slate-300",
      shouldAnimate: false,
    },

    [InvoiceStatus.CRYPTO_ESCROW_WAITING]: {
      icon: EscrowWaitingIcon,
      primaryColor: "#64748b", // --state-draft (gray - not confirmed yet)
      accentColor: "#00f0ff", // --accent-crypto
      label: "Awaiting Blockchain",
      description:
        "User initiated transaction, awaiting blockchain confirmation",
      bgClass: "bg-gray-100",
      textClass: "text-gray-700",
      borderClass: "border-gray-300",
      shouldAnimate: true,
    },

    [InvoiceStatus.DEPOSIT_DETECTED]: {
      icon: BlockchainPendingIcon,
      primaryColor: "#f59e0b", // --state-pending (amber)
      accentColor: "#00f0ff", // --accent-crypto
      label: "Processing (1 conf)",
      description:
        "Transaction detected on blockchain, awaiting 12 confirmations",
      bgClass: "bg-amber-100",
      textClass: "text-amber-700",
      borderClass: "border-amber-300",
      shouldAnimate: true, // Hourglass animation
    },

    [InvoiceStatus.LOCKED]: {
      icon: CryptographicLockIcon,
      primaryColor: "#3b82f6", // --state-locked (blue)
      accentColor: "#10b981", // --accent-success (green)
      label: "Funds Secured (12 conf)",
      description: "Funds cryptographically locked in smart contract",
      bgClass: "bg-blue-100",
      textClass: "text-blue-700",
      borderClass: "border-blue-300",
      shouldAnimate: false,
    },

    [InvoiceStatus.DISPUTED]: {
      icon: CryptographicLockIcon,
      primaryColor: "#ef4444", // --accent-admin (red)
      accentColor: "#f59e0b", // --accent-warning (amber)
      label: "Disputed",
      description: "Payment is under dispute resolution",
      bgClass: "bg-red-100",
      textClass: "text-red-700",
      borderClass: "border-red-300",
      shouldAnimate: false,
    },

    [InvoiceStatus.PAID]: {
      icon: FundsReleasedIcon,
      primaryColor: "#10b981", // --state-paid (green)
      accentColor: "#00f0ff", // --accent-crypto
      label: "Payment Released",
      description: "Funds released to freelancer wallet",
      bgClass: "bg-green-100",
      textClass: "text-green-700",
      borderClass: "border-green-300",
      shouldAnimate: false,
    },

    [InvoiceStatus.REFUNDED]: {
      icon: FundsReleasedIcon,
      primaryColor: "#94a3b8", // --state-refunded (light gray)
      accentColor: "#64748b",
      label: "Refunded",
      description: "Funds returned to client wallet",
      bgClass: "bg-slate-100",
      textClass: "text-slate-700",
      borderClass: "border-slate-300",
      shouldAnimate: false,
    },

    [InvoiceStatus.OVERDUE]: {
      icon: EscrowWaitingIcon,
      primaryColor: "#f59e0b", // --accent-warning (amber)
      accentColor: "#ef4444", // --accent-error (red)
      label: "Overdue",
      description: "Payment deadline exceeded",
      bgClass: "bg-amber-100",
      textClass: "text-amber-700",
      borderClass: "border-amber-300",
      shouldAnimate: true,
    },

    [InvoiceStatus.EXPIRED]: {
      icon: EscrowWaitingIcon,
      primaryColor: "#64748b", // --state-draft (gray)
      accentColor: "#94a3b8",
      label: "Expired",
      description: "Invoice validity period expired",
      bgClass: "bg-gray-100",
      textClass: "text-gray-700",
      borderClass: "border-gray-300",
      shouldAnimate: false,
    },
  };

export const ESCROW_STATUS_CONFIG: Record<EscrowStatus, InvoiceStatusConfig> = {
  [EscrowStatus.NOT_STARTED]: {
    icon: EscrowWaitingIcon,
    primaryColor: "#64748b",
    accentColor: "#00f0ff",
    label: "Not Started",
    description: "Escrow not initiated",
    bgClass: "bg-gray-100",
    textClass: "text-gray-700",
    borderClass: "border-gray-300",
  },

  [EscrowStatus.DEPOSITED]: {
    icon: CryptographicLockIcon,
    primaryColor: "#3b82f6",
    accentColor: "#10b981",
    label: "Deposited",
    description: "Funds held in smart contract",
    bgClass: "bg-blue-100",
    textClass: "text-blue-700",
    borderClass: "border-blue-300",
  },

  [EscrowStatus.RELEASED]: {
    icon: FundsReleasedIcon,
    primaryColor: "#10b981",
    accentColor: "#00f0ff",
    label: "Released",
    description: "Funds transferred to freelancer",
    bgClass: "bg-green-100",
    textClass: "text-green-700",
    borderClass: "border-green-300",
  },

  [EscrowStatus.REFUNDED]: {
    icon: FundsReleasedIcon,
    primaryColor: "#94a3b8",
    accentColor: "#64748b",
    label: "Refunded",
    description: "Funds returned to client",
    bgClass: "bg-slate-100",
    textClass: "text-slate-700",
    borderClass: "border-slate-300",
  },

  [EscrowStatus.DISPUTED]: {
    icon: CryptographicLockIcon,
    primaryColor: "#ef4444",
    accentColor: "#f59e0b",
    label: "Disputed",
    description: "Under dispute resolution",
    bgClass: "bg-red-100",
    textClass: "text-red-700",
    borderClass: "border-red-300",
  },
};

export function getInvoiceStatusConfig(
  status: InvoiceStatus,
): InvoiceStatusConfig {
  return INVOICE_STATUS_CONFIG[status];
}

export function getEscrowStatusConfig(
  status: EscrowStatus,
): InvoiceStatusConfig {
  return ESCROW_STATUS_CONFIG[status];
}

export function canTransitionTo(
  current: InvoiceStatus,
  next: InvoiceStatus,
): boolean {
  const transitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    [InvoiceStatus.DRAFT]: [
      InvoiceStatus.SENT,
      InvoiceStatus.CRYPTO_ESCROW_WAITING,
    ],
    [InvoiceStatus.SENT]: [
      InvoiceStatus.PAID,
      InvoiceStatus.OVERDUE,
      InvoiceStatus.DRAFT,
    ],
    [InvoiceStatus.CRYPTO_ESCROW_WAITING]: [
      InvoiceStatus.DEPOSIT_DETECTED,
      InvoiceStatus.DRAFT,
      InvoiceStatus.EXPIRED,
    ],
    [InvoiceStatus.DEPOSIT_DETECTED]: [
      InvoiceStatus.LOCKED,
      InvoiceStatus.DRAFT,
    ],
    [InvoiceStatus.LOCKED]: [InvoiceStatus.PAID, InvoiceStatus.REFUNDED],
    [InvoiceStatus.DISPUTED]: [
      InvoiceStatus.PAID,
      InvoiceStatus.REFUNDED,
      InvoiceStatus.LOCKED,
    ],
    [InvoiceStatus.PAID]: [],
    [InvoiceStatus.REFUNDED]: [],
    [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID, InvoiceStatus.DRAFT],
    [InvoiceStatus.EXPIRED]: [InvoiceStatus.DRAFT],
  };

  return transitions[current]?.includes(next) ?? false;
}
