"use client";

import React from "react";

interface NavSettingsIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function NavSettingsIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: NavSettingsIconProps) {
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
        {/* Outer Gear Ring */}
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center Axle / Dot */}
        <circle 
          cx="12" 
          cy="12" 
          r="3" 
          fill="none" 
          stroke={accentColor} 
          strokeWidth="1.5" 
        />
        <circle 
          cx="12" 
          cy="12" 
          r="1" 
          fill={accentColor} 
        />

        {/* Inner Arc Details */}
        <path
          d="M9 12a3 3 0 0 1 3-3"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M15 12a3 3 0 0 1-3 3"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}
