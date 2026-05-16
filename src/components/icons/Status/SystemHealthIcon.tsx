"use client";

import React from "react";

interface SystemHealthIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function SystemHealthIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: SystemHealthIconProps) {
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
        {/* Heart rate monitor line */}
        <path
          d="M2 12 L6 12 L8 8 L10 16 L12 10 L14 14 L16 12 L22 12"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Pulse point accent */}
        <circle
          cx="12"
          cy="10"
          r="1.5"
          fill={accentColor}
        />
        
        {/* Monitor frame top */}
        <line
          x1="2"
          y1="4"
          x2="22"
          y2="4"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.3"
        />
        
        {/* Monitor frame bottom */}
        <line
          x1="2"
          y1="20"
          x2="22"
          y2="20"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.3"
        />
      </g>
    </svg>
  );
}
