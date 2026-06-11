import { apiClient } from "@/lib/axios";

export interface SystemConfig {
  blockchainEnabled: boolean;
}

export async function fetchSystemConfig(): Promise<SystemConfig> {
  try {
    // Attempt to fetch from real backend
    const { data } = await apiClient.get<SystemConfig>("/system/config");
    return data;
  } catch {
    // Fallback if endpoint doesn't exist yet
    return {
      blockchainEnabled: process.env.NEXT_PUBLIC_BLOCKCHAIN_ENABLED === "true",
    };
  }
}
