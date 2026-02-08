"use client";

import React from "react";

interface CryptographicLockIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * CryptographicLockIcon - Represents LOCKED state (12 confirmations)
 * Meaning: Funds are cryptographically secured in smart contract
 * Color: #3b82f6 (Blue) - indicates trust and security
 * Visual: Solid shield + lock to convey "absolutely safe"
 */
export function CryptographicLockIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#3b82f6", // --state-locked: Blue for secured funds
  accentColor = "#10b981", // --accent-success: Green accent for confirmed
}: CryptographicLockIconProps) {
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
        {/* Outer hexagon (blockchain structure) */}
        <path
          d="M 32 48 L 48 38 L 80 38 L 96 48 L 96 80 L 80 90 L 48 90 L 32 80 Z"
          strokeWidth="2.5"
          stroke={primaryColor}
          opacity="0.3"
          fill="none"
        />

        {/* Main shield (cryptographic protection) */}
        <path
          d="M 38 50 L 50 42 L 78 42 L 90 50 L 90 72 C 90 88 64 100 64 100 C 64 100 38 88 38 72 L 38 50 Z"
          strokeWidth="3.5"
          stroke={primaryColor}
          fill="none"
        />

        {/* Inner shield layer (double protection) */}
        <path
          d="M 46 54 L 56 48 L 72 48 L 82 54 L 82 70 C 82 82 64 92 64 92 C 64 92 46 82 46 70 Z"
          strokeWidth="2"
          stroke={primaryColor}
          opacity="0.5"
          fill="none"
        />

        {/* Lock icon in center */}
        <rect
          x="56"
          y="64"
          width="16"
          height="12"
          rx="2"
          strokeWidth="2"
          stroke={primaryColor}
          fill="none"
        />

        {/* Lock shackle */}
        <path
          d="M 58 64 L 58 58 C 58 55 61 52 64 52 C 67 52 70 55 70 58 L 70 64"
          strokeWidth="2"
          stroke={primaryColor}
          fill="none"
        />

        {/* Keyhole */}
        <circle cx="64" cy="68" r="2" fill={accentColor} />
        <rect x="63" y="68" width="2" height="4" fill={accentColor} />

        {/* 12 confirmation dots around shield (3 corners) */}
        <circle cx="90" cy="50" r="3" fill={accentColor} opacity="0.9" />
        <circle cx="64" cy="100" r="3" fill={accentColor} opacity="0.9" />
        <circle cx="38" cy="50" r="3" fill={accentColor} opacity="0.9" />
      </g>
    </svg>
  );
}
