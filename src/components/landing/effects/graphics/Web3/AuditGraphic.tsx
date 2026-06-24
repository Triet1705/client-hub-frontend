import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function AuditGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.g animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="25" y="15" width="50" height="70" rx="6" fill={`url(#${gradientId})`} opacity="0.2" />
        <rect x="25" y="15" width="50" height="70" rx="6" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
        <path d="M35 35 L65 35 M35 50 L65 50" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" />
        <circle cx="65" cy="65" r="15" fill="#020617" stroke={`url(#${gradientId})`} strokeWidth="3" />
        <path d="M75 75 L90 90" stroke={`url(#${gradientId})`} strokeWidth="4" strokeLinecap="round" />
        <path d="M58 65 L63 70 L72 60" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </svg>
  );
}
