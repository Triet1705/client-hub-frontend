"use client";

import React from "react";

interface EscrowWaitingIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * EscrowWaitingIcon - Represents CRYPTO_ESCROW_WAITING state
 * Meaning: User has initiated wallet transaction, awaiting blockchain confirmation
 * Color: #64748b (Gray) - indicates "initiated but not yet confirmed"
 * Visual: Clock/hourglass with blockchain network to show "waiting for network"
 * UX: Should have subtle animation (rotating or pulsing)
 */
export function EscrowWaitingIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#64748b", // --state-draft: Gray for not-yet-started
  accentColor = "#00f0ff", // --accent-crypto: Cyan for blockchain context
}: EscrowWaitingIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {isActive && (
        <rect
          x="0"
          y="0"
          width="128"
          height="128"
          rx="20"
          fill={primaryColor}
          opacity="0.1"
        />
      )}

      <g opacity={isActive ? "1" : "0.7"}>
        {/* Outer dashed circle - "waiting for network" */}
        <circle
          cx="64"
          cy="64"
          r="52"
          strokeWidth="2"
          stroke={primaryColor}
          opacity="0.3"
          strokeDasharray="5 5"
        />

        {/* Clock circle with visible border */}
        <circle
          cx="64"
          cy="64"
          r="32"
          strokeWidth="3"
          stroke={primaryColor}
          fill="none"
        />

        {/* Clock hands - hour hand (vertical) */}
        <path
          d="M 64 64 L 64 44"
          strokeWidth="3"
          stroke={primaryColor}
          strokeLinecap="round"
        />

        {/* Clock hands - minute hand (diagonal) */}
        <path
          d="M 64 64 L 78 58"
          strokeWidth="2.5"
          stroke={primaryColor}
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Hour markers (4 points) */}
        <circle cx="64" cy="32" r="2" fill={primaryColor} />
        <circle cx="96" cy="64" r="2" fill={primaryColor} />
        <circle cx="64" cy="96" r="2" fill={primaryColor} />
        <circle cx="32" cy="64" r="2" fill={primaryColor} />

        {/* Blockchain network nodes (glowing dots) */}
        <circle cx="64" cy="16" r="5" fill={accentColor} opacity="0.8" />
        <circle cx="104" cy="90" r="5" fill={accentColor} opacity="0.8" />
        <circle cx="24" cy="90" r="5" fill={accentColor} opacity="0.8" />

        {/* Connecting lines (dashed to show "not connected yet") */}
        <path
          d="M 64 32 L 64 20"
          strokeWidth="2"
          stroke={accentColor}
          opacity="0.6"
          strokeDasharray="4 4"
        />
        <path
          d="M 88 84 L 100 90"
          strokeWidth="2"
          stroke={accentColor}
          opacity="0.6"
          strokeDasharray="4 4"
        />
        <path
          d="M 40 84 L 28 90"
          strokeWidth="2"
          stroke={accentColor}
          opacity="0.6"
          strokeDasharray="4 4"
        />
      </g>
    </svg>
  );
}
