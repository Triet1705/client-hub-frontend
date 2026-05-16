"use client";

import * as React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NetworkStatusBadge } from "../shared/network-status-badge";
import { NotificationBellIcon } from "@/components/icons";
import { NotificationPanel } from "@/features/notifications/components/notification-panel";
import { useUnreadCountQuery } from "@/features/notifications/hooks/use-notifications";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = React.useState(false);
  const { data: unreadData } = useUnreadCountQuery();
  const unreadCount = unreadData?.unreadCount || 0;
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-theme-border bg-surface-base/80 px-8 backdrop-blur-md">
      <div className="flex-1" />

      <div className="flex items-center gap-5">
        <ThemeToggle />

        <div className="hidden md:block">
          <NetworkStatusBadge className="py-1.5 px-3 bg-surface-elevated/50 shadow-none border-theme-border text-content-primary" />
        </div>

        <div className="h-6 w-px bg-theme-border hidden md:block"></div>

        <div className="relative flex items-center">
          <button 
            onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
            className="relative rounded-full p-2 text-content-secondary hover:bg-surface-elevated hover:text-content-primary transition-colors"
          >
            <NotificationBellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 ring-2 ring-[#020617] text-[10px] font-bold leading-none text-white">
                {unreadCount}
              </span>
            )}
          </button>
          
          <NotificationPanel 
            isOpen={isNotificationPanelOpen} 
            onClose={() => setIsNotificationPanelOpen(false)} 
          />
        </div>

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
