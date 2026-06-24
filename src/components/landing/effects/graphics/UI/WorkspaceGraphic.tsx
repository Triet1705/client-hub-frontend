import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function WorkspaceGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.rect x="15" y="15" width="70" height="70" rx="8" fill={`url(#${gradientId})`} opacity="0.2" animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      <rect x="15" y="15" width="70" height="70" rx="8" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
      <motion.rect x="25" y="25" width="45" height="25" rx="4" fill={`url(#${gradientId})`} opacity="0.6" animate={{ y: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
      <rect x="25" y="55" width="20" height="20" rx="4" fill={`url(#${gradientId})`} opacity="0.4" />
      <rect x="50" y="55" width="20" height="20" rx="4" fill={`url(#${gradientId})`} opacity="0.4" />
    </svg>
  );
}
