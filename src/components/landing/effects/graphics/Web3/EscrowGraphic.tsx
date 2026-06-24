import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function EscrowGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.g animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M50 10 L85 25 L85 50 C85 75 50 90 50 90 C50 90 15 75 15 50 L15 25 Z" fill={`url(#${gradientId})`} opacity="0.2" />
        <path d="M50 10 L85 25 L85 50 C85 75 50 90 50 90 C50 90 15 75 15 50 L15 25 Z" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinejoin="round" />
        <rect x="40" y="45" width="20" height="20" rx="4" fill={`url(#${gradientId})`} opacity="0.8" />
        <path d="M44 45 L44 35 C44 30 56 30 56 35 L56 45" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}
