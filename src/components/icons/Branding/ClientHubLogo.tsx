"use client";

import React, { useId } from "react";

interface ClientHubLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function ClientHubLogo({
  className = "",
  size = "md",
  showText = true,
}: ClientHubLogoProps) {
  const gradientId = useId();
  const glowId = useId();

  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative flex items-center justify-center ${sizeMap[size]}`}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Client Hub Logo"
          role="img"
        >
          <title>Client Hub - Secure Web3 Freelancing</title>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(29 78 216)" />
              <stop offset="100%" stopColor="rgb(30 58 138)" />
            </linearGradient>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <path
            d="M 32 4 L 56.3 18 L 56.3 46 L 32 60 L 7.7 46 L 7.7 18 Z"
            fill={`url(#${gradientId})`}
            className="drop-shadow-md"
          />

          <g stroke="rgb(16 185 129)" strokeWidth="1" strokeOpacity="0.4">
            <line x1="32" y1="4" x2="32" y2="32" />
            <line x1="56.3" y1="18" x2="32" y2="32" />
            <line x1="56.3" y1="46" x2="32" y2="32" />
            <line x1="32" y1="60" x2="32" y2="32" />
            <line x1="7.7" y1="46" x2="32" y2="32" />
            <line x1="7.7" y1="18" x2="32" y2="32" />
          </g>

          <path
            d="M 32 4 L 56.3 18 L 56.3 46 L 32 60 L 7.7 46 L 7.7 18 Z"
            fill="none"
            stroke="rgb(16 185 129)"
            strokeWidth="2"
          />

          <circle
            cx="32"
            cy="32"
            r="6"
            fill="rgb(16 185 129)"
            filter={`url(#${glowId})`}
          />
          <circle
            cx="32"
            cy="32"
            r="3"
            fill="rgb(255 255 255 / 0.8)"
            className="dark:fill-slate-100"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col -space-y-1">
          <span className="text-lg font-extrabold text-blue-900 dark:text-blue-100 tracking-tighter uppercase">
            Client
            <span className="text-emerald-600 dark:text-emerald-400">Hub</span>
          </span>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
            Trustless Infrastructure
          </span>
        </div>
      )}
    </div>
  );
}

export function ClientHubIcon() {
  return <ClientHubLogo size="md" showText={false} />;
}

export function HeaderWithLogo() {
  return (
    <header className="border-b border-border bg-background">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <ClientHubLogo size="md" />

          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="text-foreground font-medium">Connected</p>
              <p className="text-xs text-accent">0x742d...8F4a</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xs font-bold text-white">W</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
