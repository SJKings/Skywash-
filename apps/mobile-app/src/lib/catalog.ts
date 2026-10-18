// Service catalog from the design (PKGS / CENTERS in design/Skywash App.dc.html).
// Prices must match apps/admin-web/lib/catalog.ts — the server recomputes the
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
    price: 25,
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
    price: 35,
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
    price: 89,
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
    price: 45,
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
  { id: 'mission-bay', name: 'Skywash Mission Bay', address: '1200 Garnet Ave, San Diego', distance: '1.2 mi', hours: '7am–8pm' },
  { id: 'north-park', name: 'Skywash North Park', address: '3015 University Ave, San Diego', distance: '2.8 mi', hours: '7am–7pm' },
  { id: 'chula-vista', name: 'Skywash Chula Vista', address: '455 Broadway, Chula Vista', distance: '7.4 mi', hours: '8am–6pm' },
] as const;

export function getCenter(id: string | null | undefined) {
  return CENTERS.find((c) => c.id === id);
}

export const SERVICE_FEES: Record<ServiceMode, number> = { HOME: 10, PICKUP: 15, DRIVE_IN: 0 };

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

/** Bookable start times, Lagos time. */
export const TIME_SLOTS = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00'];

/** How many days ahead customers can book (today + 5). */
export const BOOKING_DAYS = 6;
