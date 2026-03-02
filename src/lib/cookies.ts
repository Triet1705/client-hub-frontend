import Cookies from "js-cookie";

export const COOKIE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  TENANT_ID: "tenant_id",
} as const;

export function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  tenantId: string,
  persistSession = false,
) {
  const options: Cookies.CookieAttributes = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(persistSession && { expires: 7 }), // 7 days; omit → session cookie
  };

  Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, options);
  Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, refreshToken, options);
  Cookies.set(COOKIE_KEYS.TENANT_ID, tenantId, options);
}

export function clearAuthCookies() {
  Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN);
  Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN);
  Cookies.remove(COOKIE_KEYS.TENANT_ID);
}

export function getAuthToken() {
  return Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken() {
  return Cookies.get(COOKIE_KEYS.REFRESH_TOKEN);
}

export function getTenantId() {
  return Cookies.get(COOKIE_KEYS.TENANT_ID);
}
