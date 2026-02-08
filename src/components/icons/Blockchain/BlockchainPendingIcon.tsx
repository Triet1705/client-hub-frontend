"use client";

import React from "react";

interface BlockchainPendingIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
  showProgress?: boolean; // NEW: Toggle "1/12" text display
  confirmations?: number; // NEW: Dynamic confirmation count
}

/**
 * BlockchainPendingIcon - Represents DEPOSIT_DETECTED state (1-11 confirmations)
 * Meaning: Transaction detected on blockchain, awaiting final confirmations
 * Color: #f59e0b (Amber) - indicates "processing/awaiting"
 * Visual: Hourglass + blocks to show "confirmations in progress"
 * UX: Use with animation to show this is a transitional state
 *
 * @param showProgress - If true, displays "X/12" text (default: true for clarity)
 * @param confirmations - Number of confirmations received (1-11, default: 1)
 *                       At 12 confirmations, should transition to CryptographicLockIcon
 */
export function BlockchainPendingIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#f59e0b", // --state-pending: Amber for awaiting confirmations
  accentColor = "#00f0ff", // --accent-crypto: Cyan for blockchain context
  showProgress = true, // Show "1/12" by default for transparency
  confirmations = 1, // Default to 1 confirmation (DEPOSIT_DETECTED)
}: BlockchainPendingIconProps) {
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
        {/* Outer confirmation ring */}
        <circle
          cx="64"
          cy="64"
          r="52"
          strokeWidth="3"
          stroke={primaryColor}
          opacity="0.3"
          fill="none"
        />
        {/* Hourglass frame */}
        <path
          d="M 44 36 L 84 36 L 84 40 L 66 56 L 66 72 L 84 88 L 84 92 L 44 92 L 44 88 L 62 72 L 62 56 L 44 40 Z"
          strokeWidth="3"
          stroke={primaryColor}
          fill="none"
        />
        {/* Sand in top (emptying - shrinks as confirmations increase) */}
        <path
          d="M 50 42 L 78 42 L 78 46 L 64 56 Z"
          fill={primaryColor}
          opacity={0.6 - confirmations / 24} // Fades as progress increases
        />
        {/* Sand in bottom (filling - grows as confirmations increase) */}
        <path
          d="M 64 72 L 50 86 L 78 86 L 78 82 Z"
          fill={primaryColor}
          opacity={0.4 + confirmations / 24} // Gets darker as progress increases
        />
        {/* Falling sand particles */}
        <circle cx="64" cy="62" r="1.5" fill={primaryColor} opacity="0.9" />
        <circle cx="62" cy="66" r="1.5" fill={primaryColor} opacity="0.7" />
        <circle cx="66" cy="66" r="1.5" fill={primaryColor} opacity="0.7" />
        {/* Progress indicator (optional, controlled by showProgress prop) */}
        {showProgress && (
          <text
            x="64"
            y="110"
            fontSize="10"
            textAnchor="middle"
            fill={accentColor}
            opacity="0.8"
            fontWeight="bold"
          >
            {confirmations}/12
          </text>
        )}
        {/* Network nodes showing confirmation progress */}
        <circle cx="24" cy="24" r="4" fill={accentColor} opacity="0.9" />{" "}
        {/* Always lit (1st confirmation) */}
        <circle
          cx="104"
          cy="24"
          r="3"
          fill={accentColor}
          opacity={confirmations >= 4 ? 0.9 : 0.4}
        />{" "}
        {/* Lights at 4 conf */}
        <circle
          cx="104"
          cy="104"
          r="3"
          fill={accentColor}
          opacity={confirmations >= 8 ? 0.9 : 0.4}
        />{" "}
        {/* Lights at 8 conf */}
      </g>
    </svg>
  );
}
