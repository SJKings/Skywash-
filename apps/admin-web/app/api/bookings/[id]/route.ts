import type { NextRequest } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { normalizeBookingCode } from "@/lib/booking-code";
import { toPublicBooking } from "@/lib/bookings";
import { prisma } from "@/lib/prisma";
import { STATUS_TRANSITIONS, updateBookingSchema } from "@/lib/validation";

/**
 * GET /api/bookings/[code] — public, used by the mobile app's "My booking" screen.
 * Accepts the booking code in any case, with or without the "SW-" prefix.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  const { id } = await ctx.params;
  const code = normalizeBookingCode(id);
  const booking = code ? await prisma.booking.findUnique({ where: { code } }) : null;
  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }
  return Response.json({ booking: toPublicBooking(booking) });
}

/**
 * PATCH /api/bookings/[id] — admin only. Body: { status }.
 * Only forward moves along the status flow (or cancellation) are allowed.
 */
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  if (!isAdminRequest(request)) return unauthorized();

  const { id } = await ctx.params;
  const parsed = updateBookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid update", issues: parsed.error.issues }, { status: 400 });
  }

  const current = await prisma.booking.findUnique({ where: { id }, select: { status: true } });
  if (!current) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  const next = parsed.data.status;
  if (!STATUS_TRANSITIONS[current.status].includes(next)) {
    return Response.json(
      { error: `Cannot change status from ${current.status} to ${next}` },
      { status: 409 },
    );
  }

  // Guard on the status we checked so two staff clicking at once can't skip a step.
  const { count } = await prisma.booking.updateMany({
    where: { id, status: current.status },
    data: { status: next },
  });
  if (count === 0) {
    return Response.json({ error: "Booking was updated by someone else, reload and retry" }, { status: 409 });
  }

  const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
  return Response.json({ booking });
}
