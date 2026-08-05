"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";
import { web3Config } from "@/lib/web3-config";
import { ThemeProvider, useTheme } from "@/providers/theme-provider";
import { NavigationProgressProvider } from "@/providers/navigation-progress-provider";
import { RealtimeProvider } from "@/features/realtime/context/realtime-provider";
import { RealtimeCacheSync } from "@/features/realtime/components/realtime-cache-sync";
import "@rainbow-me/rainbowkit/styles.css";

function ThemeAwareProviders({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const rainbowTheme =
    theme === "dark"
      ? darkTheme({
          accentColor: "var(--action-primary)",
          accentColorForeground: "var(--action-primary-foreground)",
          borderRadius: "medium",
          overlayBlur: "small",
        })
      : lightTheme({
          accentColor: "var(--action-primary)",
          accentColorForeground: "var(--action-primary-foreground)",
          borderRadius: "medium",
          overlayBlur: "small",
        });

  return (
    <RealtimeProvider>
      <RealtimeCacheSync />
      <RainbowKitProvider theme={rainbowTheme} initialChain={80002}>
        <NavigationProgressProvider>{children}</NavigationProgressProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
            },
          }}
        />
      </RainbowKitProvider>
    </RealtimeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={web3Config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemeAwareProviders>{children}</ThemeAwareProviders>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
