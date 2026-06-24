"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface CurvedLoopTextProps {
  text: string;
  repeat?: number;
  duration?: number;
  className?: string;
}

export function CurvedLoopText({
  text,
  repeat = 10,
  duration = 20,
  className = "",
}: CurvedLoopTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const repeatedText = Array(repeat).fill(text).join(" • ");

  if (shouldReduceMotion) {
    return (
      <div className={`overflow-hidden whitespace-nowrap ${className}`}>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
          {repeatedText}
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden whitespace-nowrap flex ${className}`}>
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex gap-4 min-w-max"
      >
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest pl-4">
          {repeatedText}
        </p>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest pl-4">
          {repeatedText}
        </p>
      </motion.div>
    </div>
  );
}
