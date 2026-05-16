"use client";

import React from "react";

interface NavUsersIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function NavUsersIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: NavUsersIconProps) {
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
        {/* Primary user - head */}
        <circle
          cx="9"
          cy="7"
          r="2.5"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        {/* Primary user - body arc */}
        <path
          d="M3 21v-1a6 6 0 0 1 12 0v1"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Secondary user - head */}
        <circle
          cx="16"
          cy="8"
          r="2"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        {/* Secondary user - body arc */}
        <path
          d="M15 21v-1a4 4 0 0 1 6 0v1"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
