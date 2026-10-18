import { generateBookingCode } from "@/lib/booking-code";
import { bookingTotal } from "@/lib/catalog";
import { Prisma, type Booking } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateBookingInput } from "@/lib/validation";

/** Creates a booking with a fresh unique code, retrying on the rare code collision. */
export async function createBooking(input: CreateBookingInput) {
  const data = { ...input, totalPrice: bookingTotal(input.washType, input.serviceMode) };

  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.booking.create({ data: { ...data, code: generateBookingCode() } });
    } catch (error) {
      const codeTaken =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!codeTaken || attempt >= 4) throw error;
    }
  }
}

/** What a customer sees when tracking a booking by code — no contact details or notes. */
export function toPublicBooking(b: Booking) {
  return {
    code: b.code,
    status: b.status,
    washType: b.washType,
    serviceMode: b.serviceMode,
    address: b.address,
    centerId: b.centerId,
    vehicleType: b.vehicleType,
    bookingDate: b.bookingDate,
    totalPrice: b.totalPrice,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}
