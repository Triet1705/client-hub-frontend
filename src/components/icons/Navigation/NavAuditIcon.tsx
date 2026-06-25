"use client";

import React from "react";

interface NavAuditIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function NavAuditIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: NavAuditIconProps) {
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
        <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke={primaryColor} strokeWidth="1.5" />
        <path d="M9 8h6" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 12h3" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="15" cy="16" r="2.5" fill="none" stroke={accentColor} strokeWidth="1.5" />
        <path d="M16.5 17.5L19 20" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
