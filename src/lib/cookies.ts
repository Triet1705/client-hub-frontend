import Cookies from "js-cookie";

export const COOKIE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  TENANT_ID: "tenant_id",
  SESSION_HINT: "session_hint",
  PERSIST_SESSION: "persist_session",
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
  persistSession?: boolean,
) {
  const shouldPersist = persistSession ?? isSessionPersistent();
  const options = buildCookieOptions(shouldPersist);

  Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, options);
  setTenantIdCookie(tenantId, shouldPersist);
  Cookies.set(COOKIE_KEYS.SESSION_HINT, "1", buildCookieOptions(shouldPersist));
  if (shouldPersist) {
    Cookies.set(COOKIE_KEYS.PERSIST_SESSION, "1", buildCookieOptions(true));
  } else {
    Cookies.remove(COOKIE_KEYS.PERSIST_SESSION, { path: "/" });
  }
}

export function clearAuthCookies() {
  Cookies.remove(COOKIE_KEYS.ACCESS_TOKEN, { path: "/" });
  Cookies.remove(COOKIE_KEYS.REFRESH_TOKEN, { path: "/" });
  Cookies.remove(COOKIE_KEYS.TENANT_ID, { path: "/" });
  Cookies.remove(COOKIE_KEYS.SESSION_HINT, { path: "/" });
  Cookies.remove(COOKIE_KEYS.PERSIST_SESSION, { path: "/" });
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

export function isSessionPersistent() {
  return Cookies.get(COOKIE_KEYS.PERSIST_SESSION) === "1";
}
