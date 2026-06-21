import { apiClient } from "@/lib/axios";
import type { Role } from "@/features/auth/types/auth.types";

const USERS_BASE = "/users";

export interface UserProfile {
  headline: string | null;
  bio: string | null;
  skills: string[];
  portfolioUrl: string | null;
  publicProfile: boolean;
  showEmail: boolean;
  showWallet: boolean;
}

export interface UserPreferences {
  theme: "dark" | "light";
  currency: string;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  timezone: string;
  notifyComments: boolean;
  notifyTasks: boolean;
  notifyProjects: boolean;
  notifyInvoices: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  tenantId: string;
  active: boolean;
  walletAddress: string | null;
  createdAt: string;
  updatedAt: string | null;
  lastLoginAt: string | null;
  profile: UserProfile;
  preferences: UserPreferences;
}

export type UpdateUserProfilePayload = Partial<{
  fullName: string;
  headline: string;
  bio: string;
  skills: string[];
  portfolioUrl: string;
  publicProfile: boolean;
  showEmail: boolean;
  showWallet: boolean;
}>;

export type UpdateUserPreferencesPayload = Partial<UserPreferences>;

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>(`${USERS_BASE}/me`);
  return data;
}

export async function updateCurrentUserProfile(payload: UpdateUserProfilePayload): Promise<CurrentUser> {
  const { data } = await apiClient.patch<CurrentUser>(`${USERS_BASE}/me/profile`, payload);
  return data;
}

export async function updateCurrentUserPreferences(payload: UpdateUserPreferencesPayload): Promise<CurrentUser> {
  const { data } = await apiClient.put<CurrentUser>(`${USERS_BASE}/me/preferences`, payload);
  return data;
}

export async function changeCurrentUserPassword(payload: ChangePasswordPayload): Promise<void> {
  await apiClient.patch(`${USERS_BASE}/me/password`, payload);
}

/**
 * PUT /api/users/me/wallet
 * Bind a wallet address to the current logged-in user.
 */
export async function bindWalletAddress(walletAddress: string): Promise<void> {
  await apiClient.put(`${USERS_BASE}/me/wallet`, { walletAddress });
}
