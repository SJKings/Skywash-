// Service catalog from the design (PKGS / CENTERS in design/Skywash App.dc.html).
// Prices (whole Naira) must match apps/admin-web/lib/catalog.ts — the server recomputes the
// total on every booking, so these are for display only.
import type { ServiceMode, VehicleType, WashType } from './api';

export interface Package {
  id: WashType;
  name: string;
  short: string;
  price: number;
  duration: string;
  rating: string;
  reviews: string;
  description: string;
  included: string[];
}

export const PACKAGES: Package[] = [
  {
    id: 'EXTERIOR',
    name: 'Exterior Wash',
    short: 'Exterior',
    price: 5_000,
    duration: '45 min',
    rating: '4.8',
    reviews: '412',
    description: 'A full hand wash for the outside of your car, finished with a streak-free dry.',
    included: [
      'Foam pre-wash and hand wash',
      'Wheels, rims and tyre shine',
      'Exterior windows and mirrors',
      'Microfibre hand dry',
    ],
  },
  {
    id: 'INTERIOR',
    name: 'Interior Clean',
    short: 'Interior',
    price: 7_000,
    duration: '1 hr',
    rating: '4.7',
    reviews: '286',
    description: 'Vacuum, wipe-down and glass clean for the whole cabin, boot included.',
    included: [
      'Vacuum seats, mats and boot',
      'Dashboard and console wipe-down',
      'Interior glass',
      'Odour neutraliser',
    ],
  },
  {
    id: 'FULL_DETAIL',
    name: 'Full Detail',
    short: 'Full detail',
    price: 25_000,
    duration: '2.5 hrs',
    rating: '4.9',
    reviews: '365',
    description: 'Our complete inside-and-out treatment with clay bar and a hand-applied wax.',
    included: [
      'Everything in Exterior and Interior',
      'Clay bar decontamination',
      'Hand wax and polish',
      'Seat conditioning',
    ],
  },
  {
    id: 'ENGINE_BAY',
    name: 'Engine Bay',
    short: 'Engine bay',
    price: 10_000,
    duration: '40 min',
    rating: '4.6',
    reviews: '98',
    description: 'Safe degrease and dress of the engine bay, with sensitive parts covered.',
    included: [
      'Electrical parts covered',
      'Degrease and low-pressure rinse',
      'Plastics and hoses dressed',
      'Final dry and inspection',
    ],
  },
];

export function getPackage(id: WashType) {
  return PACKAGES.find((p) => p.id === id)!;
}

export const CENTERS = [
  { id: 'lekki', name: 'Skywash Lekki', address: 'Lekki Phase 1, Lagos', hours: '8am–7pm' },
  { id: 'ikeja', name: 'Skywash Ikeja', address: 'Ikeja GRA, Lagos', hours: '8am–7pm' },
  { id: 'victoria-island', name: 'Skywash Victoria Island', address: 'Victoria Island, Lagos', hours: '8am–7pm' },
] as const;

export function getCenter(id: string | null | undefined) {
  return CENTERS.find((c) => c.id === id);
}

export const SERVICE_FEES: Record<ServiceMode, number> = { HOME: 3_000, PICKUP: 5_000, DRIVE_IN: 0 };

/** "₦25,000" (manual grouping: Hermes number formatting varies). */
export function formatNaira(amount: number) {
  return `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export const MODE_LABELS: Record<ServiceMode, string> = {
  HOME: 'Home service',
  PICKUP: 'Center · pickup & return',
  DRIVE_IN: 'Center · drive in',
};

export const FEE_LABELS: Record<ServiceMode, string> = {
  HOME: 'Home service fee',
  PICKUP: 'Pickup & return',
  DRIVE_IN: 'Center drop-off',
};

export const VEHICLES: { id: VehicleType; label: string }[] = [
  { id: 'SEDAN', label: 'Sedan' },
  { id: 'SUV', label: 'SUV' },
  { id: 'HATCHBACK', label: 'Hatchback' },
  { id: 'TRUCK', label: 'Truck' },
];

/** Bookable start times, Lagos time. Centers close at 7pm; the last slot leaves room for a 2.5 hr Full Detail. */
export const TIME_SLOTS = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30'];

/** How many days ahead customers can book (today + 5). */
export const BOOKING_DAYS = 6;
