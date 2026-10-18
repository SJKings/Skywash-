import type { NextRequest } from "next/server";
import { isAdminRequest, unauthorized } from "@/lib/auth";
import { createBooking, toPublicBooking } from "@/lib/bookings";
import { Prisma } from "@/lib/generated/prisma/client";
import { BookingStatus, ServiceMode } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { ACTIVE_STATUSES, createBookingSchema } from "@/lib/validation";

const isBookingStatus = (s: string): s is BookingStatus =>
  (Object.values(BookingStatus) as string[]).includes(s);
const isServiceMode = (s: string): s is ServiceMode =>
  (Object.values(ServiceMode) as string[]).includes(s);

/**
 * POST /api/bookings — public, called by the mobile app.
 * Returns 201 with the booking code the customer uses to track it.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid booking", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const booking = await createBooking(parsed.data);
  return Response.json({ booking: toPublicBooking(booking) }, { status: 201 });
}

/**
 * GET /api/bookings — admin only.
 *   ?status=active (default) | all | PENDING,APPROVED,…
 *   ?mode=HOME | PICKUP | DRIVE_IN
 *   ?q=  matches code, customer name or plate
 * Newest first.
 */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();

  const params = request.nextUrl.searchParams;
  const where: Prisma.BookingWhereInput = {};

  const status = params.get("status") ?? "active";
  if (status === "active") {
    where.status = { in: ACTIVE_STATUSES };
  } else if (status !== "all") {
    const statuses = status.split(",");
    if (!statuses.every(isBookingStatus)) {
      return Response.json({ error: "Invalid status filter" }, { status: 400 });
    }
    where.status = { in: statuses };
  }

  const mode = params.get("mode");
  if (mode) {
    if (!isServiceMode(mode)) {
      return Response.json({ error: "Invalid mode filter" }, { status: 400 });
    }
    where.serviceMode = mode;
  }

  const q = params.get("q")?.trim();
  if (q) {
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { licensePlate: { contains: q, mode: "insensitive" } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return Response.json({ bookings });
}
