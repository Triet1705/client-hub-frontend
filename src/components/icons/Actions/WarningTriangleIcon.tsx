"use client";

import React from "react";

interface WarningTriangleIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function WarningTriangleIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#FF4444",
  accentColor = "#00D9A3",
}: WarningTriangleIconProps) {
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
        {/* Triangle outline */}
        <path
          d="M12 2 L22 20 L2 20 Z"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Warning exclamation dot */}
        <circle
          cx="12"
          cy="16"
          r="0.8"
          fill={primaryColor}
        />
        
        {/* Warning exclamation line */}
        <line
          x1="12"
          y1="9"
          x2="12"
          y2="14"
          stroke={primaryColor}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        
        {/* Accent corner */}
        <line
          x1="12"
          y1="2"
          x2="14"
          y2="4"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}
