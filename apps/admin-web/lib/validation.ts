import { z } from "zod";
import { CENTER_IDS } from "@/lib/catalog";
import {
  BookingStatus,
  ServiceMode,
  VehicleType,
  WashType,
} from "@/lib/generated/prisma/enums";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

/** Body of POST /api/bookings, sent by the mobile app. */
export const createBookingSchema = z
  .object({
    customerName: z.string().trim().min(1).max(80),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+()\-.\s]{7,20}$/, "Invalid phone number"),
    carModel: optionalText(60),
    vehicleType: z.enum(VehicleType),
    licensePlate: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9 -]{1,12}$/, "Invalid license plate"),
    washType: z.enum(WashType),
    serviceMode: z.enum(ServiceMode),
    address: optionalText(200),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    notes: optionalText(500),
    centerId: z.enum(CENTER_IDS).optional(),
    bookingDate: z.iso
      .datetime({ offset: true })
      .transform((v) => new Date(v))
      .refine((d) => d.getTime() > Date.now() - HOUR, "Booking date is in the past")
      .refine((d) => d.getTime() < Date.now() + 30 * DAY, "Booking date is too far ahead"),
  })
  .strict()
  .superRefine((b, ctx) => {
    if (b.serviceMode === "DRIVE_IN") {
      if (!b.centerId) {
        ctx.addIssue({ code: "custom", path: ["centerId"], message: "Choose a center for drive-in" });
      }
    } else if (!b.address || b.address.length < 4) {
      ctx.addIssue({ code: "custom", path: ["address"], message: "Address is required" });
    }
  })
  .transform((b) =>
    // Drop fields that don't apply to the chosen mode.
    b.serviceMode === "DRIVE_IN"
      ? { ...b, address: null, latitude: undefined, longitude: undefined }
      : { ...b, centerId: undefined },
  );

export type CreateBookingInput = z.output<typeof createBookingSchema>;

/** Body of PATCH /api/bookings/[id], sent by the admin dashboard. */
export const updateBookingSchema = z.object({ status: z.enum(BookingStatus) }).strict();

/** Allowed status changes: new → approved → in progress → completed, cancel any time before completion. */
export const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["APPROVED", "CANCELLED"],
  APPROVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const ACTIVE_STATUSES: BookingStatus[] = ["PENDING", "APPROVED", "IN_PROGRESS"];
