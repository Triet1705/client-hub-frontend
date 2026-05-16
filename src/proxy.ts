import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/register", "/recovery", "/"];

const protectedRoutePrefixes = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/invoices",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access_token")?.value;

  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutePrefixes.some((prefix) =>
    pathname.startsWith(prefix),
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

  if (accessToken && isPublicRoute && pathname !== "/") {
    const defaultRoute = userRole === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(defaultRoute, request.url));
  }

  if (!accessToken && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (accessToken && isProtectedRoute && userRole === "ADMIN" && !pathname.startsWith("/admin")) {
    // If admin tries to access user dashboard, redirect to admin portal
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Also protect /admin route for non-admins
  if (accessToken && pathname.startsWith("/admin") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
