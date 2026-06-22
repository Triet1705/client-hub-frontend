"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { GradientText } from "../effects/GradientText";
import Link from "next/link";

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-white/5 bg-[#020617]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Client <GradientText variant="emerald">Hub</GradientText>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#proof" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Tech Stack
            </Link>
            <div className="flex items-center gap-4 ml-4">
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link 
                href="#early-access" 
                className="text-sm font-medium px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Get Early Access
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-panel border-t border-white/5"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col gap-4">
            <Link href="#features" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white" onClick={() => setIsOpen(false)}>
              Features
            </Link>
            <Link href="#proof" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white" onClick={() => setIsOpen(false)}>
              Tech Stack
            </Link>
            <div className="border-t border-white/5 pt-4 flex flex-col gap-4 px-3">
              <Link href="/login" className="text-base font-medium text-slate-300 hover:text-white" onClick={() => setIsOpen(false)}>
                Sign In
              </Link>
              <Link 
                href="#early-access" 
                className="text-center text-sm font-medium px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                onClick={() => setIsOpen(false)}
              >
                Get Early Access
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
