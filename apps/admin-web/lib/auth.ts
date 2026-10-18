import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

// Staff authentication for the admin dashboard.
//
// Two ways in, both checked against ADMIN_PASSWORD:
//   - the `skywash_admin` HttpOnly cookie set by POST /api/auth/session (dashboard)
//   - an `Authorization: Bearer <ADMIN_PASSWORD>` header (scripts, curl)
//
// Fails closed: with no ADMIN_PASSWORD configured, nobody is an admin.

export const ADMIN_COOKIE = "skywash_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

function adminPassword() {
  return process.env.ADMIN_PASSWORD || null;
}

function safeEqual(a: string, b: string) {
  // Hash first so lengths always match and timing doesn't leak the length.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Cookie value derived from the password, so changing ADMIN_PASSWORD signs everyone out. */
export function adminSessionToken() {
  const password = adminPassword();
  if (!password) return null;
  return createHmac("sha256", password).update("skywash-admin-session:v1").digest("base64url");
}

export function isValidAdminPassword(candidate: string) {
  const password = adminPassword();
  return password !== null && safeEqual(candidate, password);
}

/** True when the request comes from the same origin as this server (or has no Origin header). */
function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return origin === null || origin === request.nextUrl.origin;
}

/** True when the request carries a valid admin session cookie. */
export function hasAdminSession(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  const token = adminSessionToken();
  return Boolean(cookie && token && safeEqual(cookie, token));
}

export function isAdminRequest(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return isValidAdminPassword(authorization.slice("Bearer ".length));
  }

  if (!hasAdminSession(request)) return false;

  // Cookie auth is only accepted from the dashboard itself (CSRF guard).
  return request.method === "GET" || isSameOrigin(request);
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
