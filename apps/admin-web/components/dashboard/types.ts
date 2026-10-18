import type { Booking } from "@/lib/generated/prisma/client";

/** A booking as it arrives over JSON from the API (dates are ISO strings). */
export type BookingJson = Omit<Booking, "bookingDate" | "createdAt" | "updatedAt"> & {
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
};
