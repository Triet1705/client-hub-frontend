import { apiClient } from "@/lib/axios";
import type {
  LoginRequest,
  RefreshTokenRequest,
  JwtResponse,
} from "../types/auth.types";

const AUTH_BASE = "/auth";

/**
 * POST /api/auth/login
 * Authenticate user and receive JWT tokens.
 * @param payload - email & password
 * @param tenantId - workspace / tenant identifier sent via X-Tenant-ID header
 */
export async function login(
  payload: LoginRequest,
  tenantId: string,
): Promise<JwtResponse> {
  const { data } = await apiClient.post<JwtResponse>(
    `${AUTH_BASE}/login`,
    payload,
    {
      headers: {
        "X-Tenant-ID": tenantId,
      },
    },
  );
  return data;
}

/**
 * POST /api/auth/refresh-token
 * Exchange a valid refresh token for a new access + refresh token pair.
 */
export async function refreshToken(
  payload: RefreshTokenRequest,
): Promise<JwtResponse> {
  const { data } = await apiClient.post<JwtResponse>(
    `${AUTH_BASE}/refresh-token`,
    payload,
  );
  return data;
}

/**
 * POST /api/auth/logout
 * Revoke the refresh token server-side.
 */
export async function logout(refreshTokenStr: string): Promise<void> {
  await apiClient.post(`${AUTH_BASE}/logout`, {
    refreshToken: refreshTokenStr,
  });
}
