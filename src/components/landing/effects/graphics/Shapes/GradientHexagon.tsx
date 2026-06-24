import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function GradientHexagon({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.path
        d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      />
      <path
        d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
        fill={`url(#${gradientId})`}
        opacity="0.15"
      />
      <path
        d="M50 30 L65 40 L65 60 L50 70 L35 60 L35 40 Z"
        fill={`url(#${gradientId})`}
        opacity="0.8"
      />
    </svg>
  );
}
