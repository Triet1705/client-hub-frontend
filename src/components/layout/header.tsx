"use client";

import * as React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NetworkStatusBadge } from "../shared/network-status-badge";
import { NotificationBellIcon } from "@/components/icons";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-[#020617]/80 px-8 backdrop-blur-md">
      <div className="flex-1" />

      <div className="flex items-center gap-5">
        <div className="hidden md:block">
          <NetworkStatusBadge className="py-1.5 px-3 bg-slate-900/50 shadow-none border-slate-800" />
        </div>

        <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

        <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          <NotificationBellIcon className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#020617]"></span>
        </button>

        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
        />
      </div>
    </header>
  );
}
