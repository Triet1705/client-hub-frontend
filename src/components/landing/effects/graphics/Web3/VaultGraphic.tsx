import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function VaultGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.g animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="20" y="20" width="60" height="60" rx="8" fill={`url(#${gradientId})`} opacity="0.2" />
        <rect x="20" y="20" width="60" height="60" rx="8" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
        <circle cx="50" cy="50" r="15" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
        <circle cx="50" cy="50" r="20" fill="none" stroke={`url(#${gradientId})`} strokeWidth="1" strokeDasharray="4 4" />
        <rect x="47" y="40" width="6" height="10" rx="2" fill={`url(#${gradientId})`} opacity="0.8" />
        <circle cx="50" cy="50" r="4" fill={`url(#${gradientId})`} opacity="0.8" />
        <line x1="25" y1="25" x2="35" y2="35" stroke={`url(#${gradientId})`} strokeWidth="2" opacity="0.5" />
        <line x1="75" y1="25" x2="65" y2="35" stroke={`url(#${gradientId})`} strokeWidth="2" opacity="0.5" />
        <line x1="25" y1="75" x2="35" y2="65" stroke={`url(#${gradientId})`} strokeWidth="2" opacity="0.5" />
        <line x1="75" y1="75" x2="65" y2="65" stroke={`url(#${gradientId})`} strokeWidth="2" opacity="0.5" />
      </motion.g>
    </svg>
  );
}
