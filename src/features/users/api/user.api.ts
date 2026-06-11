import { apiClient } from "@/lib/axios";

const USERS_BASE = "/v1/users";

/**
 * PUT /api/v1/users/me/wallet
 * Bind a wallet address to the current logged-in user.
 */
export async function bindWalletAddress(walletAddress: string): Promise<void> {
  await apiClient.put(`${USERS_BASE}/me/wallet`, { walletAddress });
}
