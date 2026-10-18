// Service catalog. Prices are whole Naira (NGN).
// The server is the source of truth for pricing: totals are always computed here.
import type { ServiceMode, WashType } from "@/lib/generated/prisma/enums";

export const PACKAGES: Record<WashType, { name: string; price: number; duration: string }> = {
  EXTERIOR: { name: "Exterior Wash", price: 5_000, duration: "45 min" },
  INTERIOR: { name: "Interior Clean", price: 7_000, duration: "1 hr" },
  FULL_DETAIL: { name: "Full Detail", price: 25_000, duration: "2.5 hrs" },
  ENGINE_BAY: { name: "Engine Bay", price: 10_000, duration: "40 min" },
};

export const SERVICE_FEES: Record<ServiceMode, number> = {
  HOME: 3_000,
  PICKUP: 5_000,
  DRIVE_IN: 0,
};

export const CENTERS = [
  { id: "lekki", name: "Skywash Lekki", address: "Lekki Phase 1, Lagos", hours: "8am–7pm" },
  { id: "ikeja", name: "Skywash Ikeja", address: "Ikeja GRA, Lagos", hours: "8am–7pm" },
  { id: "victoria-island", name: "Skywash Victoria Island", address: "Victoria Island, Lagos", hours: "8am–7pm" },
] as const;

export type CenterId = (typeof CENTERS)[number]["id"];

export const CENTER_IDS = CENTERS.map((c) => c.id) as [CenterId, ...CenterId[]];

export function bookingTotal(washType: WashType, serviceMode: ServiceMode) {
  return PACKAGES[washType].price + SERVICE_FEES[serviceMode];
}

/** All centers are in Lagos; appointment times are shown in this zone (WAT, UTC+1, no DST). */
export const BUSINESS_TIME_ZONE = "Africa/Lagos";

/** "₦25,000" */
export function formatNaira(amount: number) {
  return `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function centerName(centerId: string | null) {
  return CENTERS.find((c) => c.id === centerId)?.name ?? "Unknown center";
}
