"use client";

import React from "react";

interface SpinnerIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function SpinnerIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: SpinnerIconProps) {
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
        {/* Spinning circle - animated */}
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeDasharray="18 36"
          strokeLinecap="round"
          style={{
            animation: "spin 1s linear infinite",
            transformOrigin: "center",
          }}
        />
        
        {/* Static circle background */}
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.3"
        />
        
        {/* Center dot */}
        <circle
          cx="12"
          cy="12"
          r="2"
          fill={primaryColor}
        />
        
        {/* CSS animation */}
        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </g>
    </svg>
  );
}
