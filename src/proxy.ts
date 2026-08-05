import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/register", "/recovery", "/"];

const protectedRoutePrefixes = [
  "/admin",
  "/communication",
  "/dashboard",
  "/projects",
  "/profile",
  "/settings",
  "/tasks",
  "/invoices",
];

function matchesRoutePrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const sessionHint = request.cookies.get("session_hint")?.value;
  const hasRecoverableSession = Boolean(accessToken || refreshToken || sessionHint);

  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutePrefixes.some((prefix) =>
    matchesRoutePrefix(pathname, prefix),
  );
  let userRole = null;
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      userRole = payload.role;
    } catch {
      // Ignore
    }
  }

  if (accessToken && userRole && isPublicRoute && pathname !== "/") {
    const defaultRoute = userRole === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  if (!hasRecoverableSession && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (accessToken && isProtectedRoute && userRole === "ADMIN" && !pathname.startsWith("/admin")) {
    // Keep platform admins inside the admin route namespace and layout.
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (accessToken && userRole && pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
