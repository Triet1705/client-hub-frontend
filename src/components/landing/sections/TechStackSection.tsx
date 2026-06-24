"use client";

import Image from "next/image";
import { NetworkPolygonAmoy } from "@web3icons/react";
import { CustomGraphic } from "../effects/CustomGraphics";

export function TechStackSection() {
  const technologies = [
    { 
      name: "Next.js", 
      icon: <Image src="/next.svg" alt="Next.js" width={100} height={30} className="invert opacity-40 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" /> 
    },
    { 
      name: "Supabase", 
      icon: <Image src="/supabase-logo-wordmark--dark.svg" alt="Supabase" width={120} height={30} className="opacity-40 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_15px_rgba(62,207,142,0.2)]" /> 
    },
    { 
      name: "PostgreSQL", 
      icon: (
        <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0 drop-shadow-[0_0_15px_rgba(51,103,145,0.2)]">
          <Image src="/postgresql-logo-svgrepo-com.svg" alt="PostgreSQL" width={32} height={32} />
          <span className="text-white font-display font-bold text-xl">PostgreSQL</span>
        </div>
      ) 
    },
    { 
      name: "Hardhat", 
      icon: (
        <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0 drop-shadow-[0_0_15px_rgba(255,240,82,0.2)]">
          <Image src="/Hardhat.svg" alt="Hardhat" width={32} height={32} />
          <span className="text-white font-display font-bold text-xl">Hardhat</span>
        </div>
      )
    },
    { 
      name: "Polygon Amoy", 
      icon: (
        <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0 drop-shadow-[0_0_15px_rgba(130,71,229,0.2)]">
          <NetworkPolygonAmoy variant="branded" size={32} />
          <span className="text-white font-display font-bold text-xl">Polygon</span>
        </div>
      )
    },
    { 
      name: "Spring Boot", 
      icon: (
        <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity duration-300 grayscale group-hover:grayscale-0 drop-shadow-[0_0_15px_rgba(109,179,63,0.2)]">
          <Image src="/spring-boot-svgrepo-com.svg" alt="Spring Boot" width={32} height={32} />
          <span className="text-white font-display font-bold text-xl">Spring Boot</span>
        </div>
      )
    },
    { 
      name: "Web3j", 
      icon: (
        <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          <CustomGraphic type="neonCube" color="indigo" size={32} />
          <span className="text-white font-display font-bold text-xl">Web3j</span>
        </div>
      )
    }
  ];

  // Duplicate for seamless loop
  const duplicatedTechnologies = [...technologies, ...technologies, ...technologies, ...technologies];

  return (
    <section id="proof" className="py-24 relative overflow-hidden bg-[#020617]">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-32 bg-indigo-500/5 blur-[80px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <h3 className="text-sm uppercase tracking-[0.2em] font-semibold text-slate-500 mb-8">
            POWERED BY ENTERPRISE-GRADE TECHNOLOGY
          </h3>
        </div>
      </div>

      <div className="w-full relative py-12 overflow-hidden border-y border-white/5 bg-white/[0.01]">
        {/* Fading edges */}
        <div className="absolute top-0 bottom-0 left-0 w-32 md:w-64 bg-gradient-to-r from-[#020617] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-32 md:w-64 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none" />
        
        {/* CSS-only Ticker */}
        <div className="flex gap-16 md:gap-24 whitespace-nowrap animate-[scroll_40s_linear_infinite] w-max hover:[animation-play-state:paused] items-center">
          {duplicatedTechnologies.map((tech, i) => (
             <div key={i} className="group flex items-center justify-center min-w-[120px] cursor-default transition-transform duration-500 hover:scale-110">
               {tech.icon}
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
