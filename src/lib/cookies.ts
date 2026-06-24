import Cookies from "js-cookie";

export const COOKIE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  TENANT_ID: "tenant_id",
} as const;

function buildCookieOptions(persistSession = false): Cookies.CookieAttributes {
  return {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(persistSession && { expires: 7 }),
  };
}

export function setTenantIdCookie(
  tenantId: string,
  persistSession = false,
) {
  Cookies.set(COOKIE_KEYS.TENANT_ID, tenantId, buildCookieOptions(persistSession));
}

export function setAuthCookies(
  accessToken: string,
  _refreshToken: string | null | undefined,
  tenantId: string,
  persistSession = false,
) {
  const options = buildCookieOptions(persistSession);

  Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, options);
  setTenantIdCookie(tenantId, persistSession);
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
  // Refresh tokens are stored by the backend as HttpOnly cookies.
  return Cookies.get(COOKIE_KEYS.REFRESH_TOKEN);
}

export function getTenantId() {
  return Cookies.get(COOKIE_KEYS.TENANT_ID);
}
