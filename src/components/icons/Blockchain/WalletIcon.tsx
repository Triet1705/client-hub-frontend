"use client";

import React from "react";

interface WalletIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function WalletIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: WalletIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {isActive && (
        <rect
          x="0"
          y="0"
          width="24"
          height="24"
          rx="6"
          fill={primaryColor}
          opacity="0.1"
        />
      )}

      <g opacity={isActive ? "1" : "0.8"}>
        <path
          d="M2 9C2 7.9 2.9 7 4 7H20C21.1 7 22 7.9 22 9V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V9Z"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />

        <path
          d="M2 9V8C2 7.45 2.45 7 3 7H13C13 7 14 7 14 8V9.5C14 10 13.5 10.5 13 10.5H3C2.45 10.5 2 10.05 2 9.5V9Z"
          fill={primaryColor}
          opacity="0.2"
          stroke={primaryColor}
          strokeWidth="0.8"
        />

        <path
          d="M18 12H21C21.5 12 22 12.5 22 13V16C22 16.5 21.5 17 21 17H18C17.5 17 17 16.5 17 16V13C17 12.5 17.5 12 18 12Z"
          fill={primaryColor}
          opacity="0.15"
          stroke={primaryColor}
          strokeWidth="1"
        />

        <path
          d="M5 13H8"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M8 13V18"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M5 18H10"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />

        <circle cx="5" cy="13" r="1" fill={accentColor} opacity="0.8" />
        <circle cx="10" cy="13" r="0.8" fill={accentColor} opacity="0.8" />
        <circle cx="5" cy="18" r="0.8" fill={accentColor} opacity="0.8" />
        <circle cx="10" cy="18" r="1" fill={accentColor} opacity="0.8" />

        <circle
          cx="12"
          cy="8.5"
          r="4"
          fill={accentColor}
          stroke={primaryColor}
          strokeWidth="1.2"
          opacity="0.9"
        />
        <text
          x="12"
          y="10.5"
          textAnchor="middle"
          fontSize="5"
          fontWeight="bold"
          fill={primaryColor}
        >
          ¢
        </text>
      </g>
    </svg>
  );
}
