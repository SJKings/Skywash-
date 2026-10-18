// Demo data matching the design prototypes. Safe to re-run (upserts by code).
// Run with: npm run db:seed
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { bookingTotal } from "../lib/catalog";
import { PrismaClient, type Prisma } from "../lib/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL! }),
});

/** Today (or N days from now) at the given 24h time, server local time. */
function at(daysFromNow: number, time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(h, m, 0, 0);
  return d;
}

const bookings: Omit<Prisma.BookingCreateInput, "totalPrice">[] = [
  {
    code: "SW-4FQ2",
    customerName: "Maya Chen",
    phone: "(619) 555-0142",
    vehicleType: "SEDAN",
    carModel: "Toyota Camry",
    licensePlate: "8ABC123",
    washType: "FULL_DETAIL",
    serviceMode: "HOME",
    address: "2140 Garnet Ave, San Diego",
    notes: "Gate code 4471, car is in the driveway",
    bookingDate: at(0, "09:30"),
    status: "APPROVED",
  },
  {
    code: "SW-7KD9",
    customerName: "Jordan Ruiz",
    phone: "(858) 555-0199",
    vehicleType: "SUV",
    licensePlate: "7XYZ890",
    washType: "EXTERIOR",
    serviceMode: "PICKUP",
    address: "3900 Park Blvd, San Diego",
    bookingDate: at(0, "11:00"),
    status: "PENDING",
  },
  {
    code: "SW-M3TP",
    customerName: "Sam Patel",
    phone: "(619) 555-0117",
    vehicleType: "HATCHBACK",
    licensePlate: "6LMN456",
    washType: "INTERIOR",
    serviceMode: "DRIVE_IN",
    centerId: "north-park",
    bookingDate: at(0, "14:00"),
    status: "IN_PROGRESS",
  },
  {
    code: "SW-R8VW",
    customerName: "Alex Kim",
    phone: "(760) 555-0163",
    vehicleType: "TRUCK",
    carModel: "Ford F-150",
    licensePlate: "9TRK222",
    washType: "ENGINE_BAY",
    serviceMode: "DRIVE_IN",
    centerId: "mission-bay",
    bookingDate: at(1, "08:00"),
    status: "PENDING",
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
