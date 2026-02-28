"use client";

import React from "react";

interface PasswordIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * Password Lock Icon — Clean padlock with keyhole
 * Used in login/registration form password input fields
 */
export function PasswordIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: PasswordIconProps) {
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
        {/* Lock shackle — rounded arch */}
        <path
          d="M8 11V8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8V11"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Lock body */}
        <rect
          x="6"
          y="11"
          width="12"
          height="9"
          rx="2"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Keyhole — circle + line accent */}
        <circle
          cx="12"
          cy="15"
          r="1.5"
          stroke={accentColor}
          strokeWidth="1.2"
          fill="none"
        />
        <line
          x1="12"
          y1="16.5"
          x2="12"
          y2="18"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
