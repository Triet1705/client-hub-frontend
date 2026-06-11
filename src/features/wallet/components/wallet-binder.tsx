"use client";

import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { bindWalletAddress } from "@/features/users/api/user.api";

export function WalletBinder() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useAuthStore();
  const lastBoundAddress = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && isConnected && address) {
      if (lastBoundAddress.current !== address) {
        lastBoundAddress.current = address;
        
        bindWalletAddress(address)
          .then(() => {
            console.log("[WalletBinder] Bound address to user:", address);
          })
          .catch((err) => {
            console.error("[WalletBinder] Failed to bind address:", err);
            // Revert so we can try again later if needed
            lastBoundAddress.current = null;
          });
      }
    }
  }, [isAuthenticated, isConnected, address]);

  return null;
}
