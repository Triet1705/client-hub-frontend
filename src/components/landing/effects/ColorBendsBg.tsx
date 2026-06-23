"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

export function ColorBendsBg() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0A0A0A]">
      {/* Primary sweeping orange bend */}
      <motion.div
        animate={{
          x: ["-10%", "10%", "-5%", "-10%"],
          y: ["10%", "-10%", "5%", "10%"],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-[100%] bg-orange-500/20 blur-[140px] mix-blend-screen"
      />

      {/* Secondary sweeping purple/fuchsia bend */}
      <motion.div
        animate={{
          x: ["10%", "-10%", "5%", "10%"],
          y: ["-10%", "10%", "-5%", "-10%"],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[80%] rounded-[100%] bg-fuchsia-600/20 blur-[160px] mix-blend-screen"
      />
      
      {/* Tertiary deep slate/blue base */}
      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[60%] rounded-full bg-slate-700/10 blur-[150px]"
      />
    </div>
  );
}
