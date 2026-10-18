import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  adminSessionToken,
  isValidAdminPassword,
} from "@/lib/auth";

const loginSchema = z.object({ password: z.string().min(1) });

/** POST /api/auth/session — staff sign-in. Body: { password }. Sets the admin cookie. */
export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  const token = adminSessionToken();
  if (!parsed.success || !token || !isValidAdminPassword(parsed.data.password)) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    [
      `${ADMIN_COOKIE}=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Strict",
      `Max-Age=${ADMIN_COOKIE_MAX_AGE}`,
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; "),
  );
  return response;
}

/** DELETE /api/auth/session — sign out. */
export async function DELETE() {
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
  );
  return response;
}
