import { NextResponse, type NextRequest } from "next/server";
import { hasAdminSession } from "@/lib/auth";

// Two jobs:
//   1. Dashboard pages: send visitors without an admin session to /login.
//      (The API routes check auth themselves; this is only for page UX.)
//   2. CORS for /api/*.
//
// CORS:
// The native iOS/Android app is not subject to CORS (it sends no Origin header),
// so this only matters for browser clients: Expo web during development and any
// future web front end. Allowed origins come from CORS_ALLOWED_ORIGINS
// (comma-separated). Credentials are never allowed cross-origin, so the admin
// cookie can only be used by the dashboard itself.

const DEV_ORIGINS = ["http://localhost:8081", "http://127.0.0.1:8081"];

const allowedOrigins = new Set(
  [
    ...(process.env.CORS_ALLOWED_ORIGINS ?? "").split(","),
    ...(process.env.NODE_ENV === "production" ? [] : DEV_ORIGINS),
  ]
    .map((o) => o.trim())
    .filter(Boolean),
);

const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "600",
};

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return guardPage(request);
  }

  const origin = request.headers.get("origin");
  const isAllowedOrigin = origin !== null && allowedOrigins.has(origin);

  if (request.method === "OPTIONS") {
    const headers = new Headers({ Vary: "Origin" });
    if (isAllowedOrigin) {
      headers.set("Access-Control-Allow-Origin", origin);
      Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
    }
    return new NextResponse(null, { status: 204, headers });
  }

  const response = NextResponse.next();
  response.headers.append("Vary", "Origin");
  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  return response;
}

// Pages anyone can open without signing in.
const PUBLIC_PAGES = new Set(["/privacy"]);

function guardPage(request: NextRequest) {
  if (PUBLIC_PAGES.has(request.nextUrl.pathname)) return NextResponse.next();
  const signedIn = hasAdminSession(request);
  const onLogin = request.nextUrl.pathname === "/login";
  if (!signedIn && !onLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (signedIn && onLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next.js internals and static files in /public.
  matcher: ["/api/:path*", "/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|ico|webmanifest)$).*)"],
};
