// Service catalog from the design handoff. Prices are whole US dollars.
// The server is the source of truth for pricing: totals are always computed here.
import type { ServiceMode, WashType } from "@/lib/generated/prisma/enums";

export const PACKAGES: Record<WashType, { name: string; price: number; duration: string }> = {
  EXTERIOR: { name: "Exterior Wash", price: 25, duration: "45 min" },
  INTERIOR: { name: "Interior Clean", price: 35, duration: "1 hr" },
  FULL_DETAIL: { name: "Full Detail", price: 89, duration: "2.5 hrs" },
  ENGINE_BAY: { name: "Engine Bay", price: 45, duration: "40 min" },
};

export const SERVICE_FEES: Record<ServiceMode, number> = {
  HOME: 10,
  PICKUP: 15,
  DRIVE_IN: 0,
};

export const CENTERS = [
  { id: "mission-bay", name: "Skywash Mission Bay", address: "1200 Garnet Ave, San Diego", hours: "7am–8pm" },
  { id: "north-park", name: "Skywash North Park", address: "3015 University Ave, San Diego", hours: "7am–7pm" },
  { id: "chula-vista", name: "Skywash Chula Vista", address: "455 Broadway, Chula Vista", hours: "8am–6pm" },
] as const;

export type CenterId = (typeof CENTERS)[number]["id"];

export const CENTER_IDS = CENTERS.map((c) => c.id) as [CenterId, ...CenterId[]];

export function bookingTotal(washType: WashType, serviceMode: ServiceMode) {
  return PACKAGES[washType].price + SERVICE_FEES[serviceMode];
}
