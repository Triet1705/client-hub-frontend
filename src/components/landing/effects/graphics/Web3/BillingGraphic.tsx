import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function BillingGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.g animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <ellipse cx="50" cy="70" rx="30" ry="12" fill={`url(#${gradientId})`} opacity="0.2" />
        <ellipse cx="50" cy="70" rx="30" ry="12" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
        <path d="M20 70 L20 85 C20 91.6 33.4 97 50 97 C66.6 97 80 91.6 80 85 L80 70" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
        
        <ellipse cx="50" cy="55" rx="30" ry="12" fill={`url(#${gradientId})`} opacity="0.4" />
        <ellipse cx="50" cy="55" rx="30" ry="12" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
        <path d="M20 55 L20 70 C20 76.6 33.4 82 50 82 C66.6 82 80 76.6 80 70 L80 55" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
        
        <ellipse cx="50" cy="40" rx="30" ry="12" fill={`url(#${gradientId})`} opacity="0.8" />
        <ellipse cx="50" cy="40" rx="30" ry="12" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
      </motion.g>
    </svg>
  );
}
