"use client";

import React from "react";

interface NavInvoicesIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function NavInvoicesIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: NavInvoicesIconProps) {
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

      <g opacity={isActive ? "1" : "0.7"}>
        <rect
          x="4"
          y="2"
          width="10"
          height="16"
          rx="1.5"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />

        <rect
          x="4"
          y="2"
          width="10"
          height="3"
          rx="1.5"
          fill={accentColor}
          opacity="0.15"
        />
        <line
          x1="5"
          y1="3"
          x2="13"
          y2="3"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.6"
        />

        <text
          x="8"
          y="10"
          fontSize="3"
          fill={primaryColor}
          opacity="0.8"
          textAnchor="middle"
        >
          $
        </text>

        <line
          x1="5"
          y1="12"
          x2="11"
          y2="12"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.7"
        />
        <line
          x1="5"
          y1="14"
          x2="13"
          y2="14"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="5"
          y1="16"
          x2="10"
          y2="16"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.5"
        />

        <circle
          cx="17"
          cy="6"
          r="2.5"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <line
          x1="16"
          y1="6"
          x2="18"
          y2="6"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.8"
        />
      </g>
    </svg>
  );
}
