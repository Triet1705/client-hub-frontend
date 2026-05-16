"use client";

import React from "react";

interface CloseIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function CloseIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: CloseIconProps) {
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
        {/* X line 1 */}
        <line
          x1="6"
          y1="6"
          x2="18"
          y2="18"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* X line 2 */}
        <line
          x1="18"
          y1="6"
          x2="6"
          y2="18"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Circle background */}
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}
