"use client";

import React from "react";
import { InvoiceStatus, EscrowStatus } from "@/lib/type";
import {
  getInvoiceStatusConfig,
  getEscrowStatusConfig,
} from "@/lib/invoice-status-mapper";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  confirmations?: number;
}

export function InvoiceStatusBadge({
  status,
  showIcon = true,
  size = "md",
  confirmations,
}: InvoiceStatusBadgeProps) {
  const config = getInvoiceStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-medium ${sizeClasses[size]} ${config.bgClass} ${config.textClass} ${config.borderClass}`}
      title={config.description}
    >
      {showIcon && (
        <Icon
          className={`${iconSizes[size]} ${config.shouldAnimate ? "animate-pulse" : ""}`}
          primaryColor={config.primaryColor}
          accentColor={config.accentColor}
          confirmations={confirmations}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function EscrowStatusBadge({
  status,
  showIcon = true,
  size = "md",
}: EscrowStatusBadgeProps) {
  const config = getEscrowStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-medium ${sizeClasses[size]} ${config.bgClass} ${config.textClass} ${config.borderClass}`}
      title={config.description}
    >
      {showIcon && (
        <Icon
          className={iconSizes[size]}
          primaryColor={config.primaryColor}
          accentColor={config.accentColor}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}

interface InvoiceStatusIconProps {
  status: InvoiceStatus;
  className?: string;
  showAnimation?: boolean;
  confirmations?: number;
}

export function InvoiceStatusIcon({
  status,
  className = "w-6 h-6",
  showAnimation = true,
  confirmations,
}: InvoiceStatusIconProps) {
  const config = getInvoiceStatusConfig(status);
  const Icon = config.icon;

  return (
    <Icon
      className={`${className} ${showAnimation && config.shouldAnimate ? "animate-pulse" : ""}`}
      primaryColor={config.primaryColor}
      accentColor={config.accentColor}
      confirmations={confirmations}
    />
  );
}

interface CryptoPaymentProgressProps {
  status: InvoiceStatus;
  confirmations?: number;
  showDetails?: boolean;
}

export function CryptoPaymentProgress({
  status,
  confirmations = 0,
  showDetails = true,
}: CryptoPaymentProgressProps) {
  const steps = [
    {
      status: InvoiceStatus.CRYPTO_ESCROW_WAITING,
      label: "Initiating",
      active: status === InvoiceStatus.CRYPTO_ESCROW_WAITING,
      completed:
        status !== InvoiceStatus.DRAFT &&
        status !== InvoiceStatus.CRYPTO_ESCROW_WAITING,
    },
    {
      status: InvoiceStatus.DEPOSIT_DETECTED,
      label: "Confirming (1)",
      active: status === InvoiceStatus.DEPOSIT_DETECTED,
      completed:
        status === InvoiceStatus.LOCKED ||
        status === InvoiceStatus.PAID ||
        status === InvoiceStatus.REFUNDED,
    },
    {
      status: InvoiceStatus.LOCKED,
      label: "Secured (12)",
      active: status === InvoiceStatus.LOCKED,
      completed:
        status === InvoiceStatus.PAID || status === InvoiceStatus.REFUNDED,
    },
    {
      status: InvoiceStatus.PAID,
      label: "Released",
      active: status === InvoiceStatus.PAID,
      completed: status === InvoiceStatus.PAID,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const config = getInvoiceStatusConfig(step.status);
          const Icon = config.icon;

          return (
            <React.Fragment key={step.status}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`p-3 rounded-full border-2 ${
                    step.completed
                      ? "bg-status-success-text border-theme-accent"
                      : step.active
                        ? `${config.bgClass} ${config.borderClass}`
                        : "bg-status-neutral-surface border-status-neutral-border"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${step.active && config.shouldAnimate ? "animate-pulse" : ""}`}
                    primaryColor={
                      step.completed
                        ? "var(--status-success-text)"
                        : step.active
                          ? config.primaryColor
                          : "var(--status-neutral-text)"
                    }
                    accentColor={config.accentColor}
                    confirmations={
                      step.status === InvoiceStatus.DEPOSIT_DETECTED
                        ? confirmations
                        : undefined
                    }
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    step.active
                      ? config.textClass
                      : step.completed
                        ? "text-theme-accent"
                        : "text-status-neutral-text"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-status-neutral-border relative">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all ${
                      step.completed ? "bg-status-success-text w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {showDetails && status === InvoiceStatus.DEPOSIT_DETECTED && (
        <div className="mt-2 p-3 bg-status-warning-text border border-status-warning-border rounded-lg">
          <p className="text-sm text-status-warning-text">
            <strong>Confirmations:</strong> {confirmations}/12
          </p>
          <p className="text-xs text-status-warning-text mt-1">
            Estimated time: ~{Math.max(0, (12 - confirmations) * 15)} seconds
            remaining
          </p>
        </div>
      )}
    </div>
  );
}
