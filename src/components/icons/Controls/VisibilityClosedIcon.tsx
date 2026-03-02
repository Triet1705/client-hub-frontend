"use client";

import React from "react";

interface VisibilityClosedIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * Visibility Closed Icon — Single eye with diagonal slash
 * Used as password field toggle (hide password)
 */
export function VisibilityClosedIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: VisibilityClosedIconProps) {
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
        {/* Eye outline — almond shape */}
        <path
          d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Iris */}
        <circle
          cx="12"
          cy="12"
          r="3.5"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Diagonal slash — visibility blocked */}
        <line
          x1="4"
          y1="4"
          x2="20"
          y2="20"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
