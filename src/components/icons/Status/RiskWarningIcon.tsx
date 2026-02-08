"use client";

import React from "react";

interface RiskWarningIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  _accentColor?: string;
  alertColor?: string;
}

export function RiskWarningIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  _accentColor = "#00D9A3",
  alertColor = "#FF6B35",
}: RiskWarningIconProps) {
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
        <path
          d="M12 2 L20 6 L20 12 Q20 18 12 22 Q4 18 4 12 L4 6 Z"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />

        <path
          d="M12 8 L14 14 L10 14 Z"
          fill="none"
          stroke={alertColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        <circle cx="12" cy="15" r="0.7" fill={alertColor} opacity="0.9" />

        <path
          d="M16 12 L18 14"
          stroke={alertColor}
          strokeWidth="1"
          opacity="0.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
