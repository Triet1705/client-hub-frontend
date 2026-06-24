import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function AlertGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
        <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Triangle */}
      <motion.path
        d="M50 15 L85 80 L15 80 Z"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${gradientId}-glow)`}
        initial={{ strokeDasharray: 250, strokeDashoffset: 250 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
      />
      
      {/* Exclamation Mark */}
      <motion.path
        d="M50 40 L50 60 M50 72 L50 73"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </svg>
  );
}
