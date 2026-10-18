import { NextResponse, type NextRequest } from "next/server";

// CORS for /api/*.
//
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

export const config = {
  matcher: "/api/:path*",
};
