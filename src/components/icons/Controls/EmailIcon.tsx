"use client";

import React from "react";

interface EmailIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * Email Icon — Clean envelope with @ accent
 * Used in login/registration form email input fields
 */
export function EmailIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: EmailIconProps) {
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
        {/* Envelope body */}
        <rect
          x="3"
          y="6"
          width="18"
          height="12"
          rx="2"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Envelope flap — V-shape pointing to center */}
        <path
          d="M3 8L12 13L21 8"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* @ accent — subtle distinctive detail */}
        <circle
          cx="12"
          cy="13.5"
          r="1.5"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.6"
          fill="none"
        />
      </g>
    </svg>
  );
}
