// Demo data matching the design prototypes. Safe to re-run (upserts by code).
// Run with: npm run db:seed
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { bookingTotal } from "../lib/catalog";
import { businessDateTime, businessDayKey, shiftDayKey } from "../lib/format";
import { PrismaClient, type Prisma } from "../lib/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

/** Today (or N days from now) at the given 24h time, San Diego time. */
function at(daysFromNow: number, time: string) {
  return businessDateTime(shiftDayKey(businessDayKey(new Date()), daysFromNow), time);
}

// The six sample bookings from design/Skywash Dashboard.dc.html.
const bookings: Omit<Prisma.BookingCreateInput, "totalPrice">[] = [
  {
    code: "SW-4FQ2",
    customerName: "Maya Chen",
    phone: "(619) 555-0142",
    vehicleType: "SUV",
    licensePlate: "8KXR214",
    washType: "FULL_DETAIL",
    serviceMode: "HOME",
    address: "2241 Felspar St, San Diego, CA",
    notes: "Gate code 4412. Park in driveway.",
    bookingDate: at(0, "09:30"),
    status: "APPROVED",
  },
  {
    code: "SW-H7MP",
    customerName: "Daniel Ortiz",
    phone: "(619) 555-0178",
    vehicleType: "SEDAN",
    licensePlate: "7ABC902",
    washType: "EXTERIOR",
    serviceMode: "PICKUP",
    address: "780 Front St, Apt 12, San Diego",
    notes: "Keys with the concierge",
    bookingDate: at(0, "11:00"),
    status: "PENDING",
  },
  {
    code: "SW-2RTN",
    customerName: "Priya Patel",
    phone: "(858) 555-0190",
    vehicleType: "HATCHBACK",
    licensePlate: "6LMN331",
    washType: "INTERIOR",
    serviceMode: "DRIVE_IN",
    centerId: "north-park",
    bookingDate: at(0, "12:30"),
    status: "IN_PROGRESS",
  },
  {
    code: "SW-9KDW",
    customerName: "Sam Brooks",
    phone: "(619) 555-0111",
    vehicleType: "TRUCK",
    carModel: "Ford F-150",
    licensePlate: "9TRK118",
    washType: "ENGINE_BAY",
    serviceMode: "HOME",
    address: "4120 Park Blvd, San Diego",
    bookingDate: at(1, "08:00"),
    status: "PENDING",
  },
  {
    code: "SW-C3VX",
    customerName: "Lena Fischer",
    phone: "(858) 555-0164",
    vehicleType: "SEDAN",
    licensePlate: "8QWE557",
    washType: "FULL_DETAIL",
    serviceMode: "PICKUP",
    address: "1550 Hotel Circle N, San Diego",
    notes: "Call on arrival",
    bookingDate: at(1, "14:00"),
    status: "PENDING",
  },
  {
    code: "SW-7BYA",
    customerName: "Marcus Reid",
    phone: "(619) 555-0133",
    vehicleType: "SUV",
    licensePlate: "5JKL440",
    washType: "EXTERIOR",
    serviceMode: "DRIVE_IN",
    centerId: "chula-vista",
    bookingDate: at(-1, "15:30"),
    status: "COMPLETED",
  },
];

async function main() {
  for (const b of bookings) {
    const data = { ...b, totalPrice: bookingTotal(b.washType, b.serviceMode) };
    await prisma.booking.upsert({ where: { code: b.code }, create: data, update: data });
  }
  console.log(`Seeded ${bookings.length} bookings`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
