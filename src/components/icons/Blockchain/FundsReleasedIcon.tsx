"use client";

import React from "react";

interface FundsReleasedIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * FundsReleasedIcon - Represents PAID state (funds released to freelancer)
 * Meaning: Payment has been successfully released from escrow
 * Color: #10b981 (Green) - indicates successful completion
 * Visual: Unlocked lock with money flow to show "funds transferred"
 * UX: Terminal state, should show celebration/success state
 */
export function FundsReleasedIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#10b981", // --state-paid: Green for completed
  accentColor = "#00f0ff", // --accent-crypto: Cyan for blockchain
}: FundsReleasedIconProps) {
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
        {/* Success circle (double ring for emphasis) */}
        <circle
          cx="64"
          cy="64"
          r="48"
          strokeWidth="3.5"
          stroke={primaryColor}
          fill="none"
        />
        <circle
          cx="64"
          cy="64"
          r="42"
          strokeWidth="2"
          stroke={primaryColor}
          opacity="0.3"
          fill="none"
        />

        {/* Large checkmark (payment confirmed) */}
        <path
          d="M 40 64 L 54 80 L 88 44"
          strokeWidth="5"
          stroke={primaryColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Coin 1 - large (closest) */}
        <circle cx="78" cy="26" r="7" fill={accentColor} opacity="0.9" />
        <text
          x="78"
          y="30"
          fontSize="8"
          textAnchor="middle"
          fill="#000"
          opacity="0.5"
        >
          $
        </text>

        {/* Coin 2 - medium */}
        <circle cx="96" cy="38" r="6" fill={accentColor} opacity="0.7" />
        <text
          x="96"
          y="41"
          fontSize="7"
          textAnchor="middle"
          fill="#000"
          opacity="0.4"
        >
          $
        </text>

        {/* Coin 3 - small (farthest) */}
        <circle cx="88" cy="18" r="5" fill={accentColor} opacity="0.5" />

        {/* Motion arrow (showing coins moving) */}
        <path
          d="M 100 50 L 108 42"
          strokeWidth="3"
          stroke={accentColor}
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M 104 50 L 108 42 L 108 46"
          strokeWidth="2.5"
          stroke={accentColor}
          fill={accentColor}
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* "RELEASED" indicator nodes */}
        <circle cx="20" cy="20" r="4" fill={accentColor} opacity="0.8" />
        <circle cx="108" cy="108" r="4" fill={accentColor} opacity="0.8" />
        <circle cx="64" cy="112" r="4" fill={primaryColor} opacity="0.8" />
      </g>
    </svg>
  );
}
