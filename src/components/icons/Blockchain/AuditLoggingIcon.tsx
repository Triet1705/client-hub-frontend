"use client";

import React from "react";

interface AuditLoggingIconProps {
  className?: string;
  isActive?: boolean; // Active = logging enabled, Inactive = paused/disabled
  primaryColor?: string;
  accentColor?: string;
  showStatus?: boolean; // Display status indicator dot
}

/**
 * AuditLoggingIcon - Represents blockchain audit trail logging system
 * Meaning: Monitoring and recording all blockchain transactions for audit purposes
 * Visual: Server logs (stacked lines) + Eye icon (monitoring) + Status indicator
 *
 * States:
 * - Active (Green): Audit logging is running, events being recorded
 * - Inactive (Gray): Logging paused or disabled
 *
 * Usage:
 * <AuditLoggingIcon isActive={true} />  // Green, monitoring active
 * <AuditLoggingIcon isActive={false} /> // Gray, logging paused
 */
export function AuditLoggingIcon({
  className = "w-6 h-6",
  isActive = true,
  primaryColor,
  accentColor,
  showStatus = true,
}: AuditLoggingIconProps) {
  const defaultPrimaryColor = isActive ? "#10b981" : "#94a3b8"; // Green or Gray
  const defaultAccentColor = isActive ? "#00f0ff" : "#64748b"; // Cyan or Dark Gray

  const finalPrimaryColor = primaryColor || defaultPrimaryColor;
  const finalAccentColor = accentColor || defaultAccentColor;

  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {isActive && (
        <circle
          cx="64"
          cy="64"
          r="58"
          stroke={finalPrimaryColor}
          strokeWidth="2"
          opacity="0.15"
          fill={finalPrimaryColor}
        />
      )}

      <rect
        x="28"
        y="32"
        width="72"
        height="64"
        rx="6"
        stroke={finalPrimaryColor}
        strokeWidth="3"
        fill="none"
      />

      <g opacity={isActive ? 1 : 0.6}>
        <path
          d="M 38 44 L 90 44"
          stroke={finalPrimaryColor}
          strokeWidth="2.5"
        />
        <path
          d="M 38 54 L 90 54"
          stroke={finalPrimaryColor}
          strokeWidth="2.5"
        />
        <path
          d="M 38 64 L 90 64"
          stroke={finalPrimaryColor}
          strokeWidth="2.5"
        />
        <path
          d="M 38 74 L 70 74"
          stroke={finalPrimaryColor}
          strokeWidth="2.5"
          opacity="0.7"
        />
        <path
          d="M 38 84 L 80 84"
          stroke={finalPrimaryColor}
          strokeWidth="2.5"
          opacity="0.5"
        />
      </g>

      <g transform="translate(68, 74)">
        <ellipse
          cx="16"
          cy="16"
          rx="20"
          ry="12"
          stroke={finalAccentColor}
          strokeWidth="2.5"
          fill="white"
        />
        <circle cx="16" cy="16" r="6" fill={finalAccentColor} opacity="0.9" />
        <circle
          cx="18"
          cy="14"
          r="2"
          fill="white"
          opacity={isActive ? 1 : 0.4}
        />
      </g>

      {showStatus && (
        <g>
          {isActive && (
            <circle
              cx="96"
              cy="36"
              r="8"
              fill={finalPrimaryColor}
              opacity="0.3"
              className="animate-ping"
            />
          )}
          <circle
            cx="96"
            cy="36"
            r="5"
            fill={isActive ? finalPrimaryColor : "#d1d5db"}
            stroke="white"
            strokeWidth="2"
          />
        </g>
      )}

      {isActive && (
        <path
          d="M 18 24 L 24 30 L 34 18"
          stroke={finalPrimaryColor}
          strokeWidth="2.5"
          opacity="0.8"
        />
      )}
    </svg>
  );
}
