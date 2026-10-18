// Content for the public website. Prices, fees and centers must match
// apps/admin-web/lib/catalog.ts (the server charges those) and
// apps/mobile-app/src/lib/catalog.ts.

export type ServiceMode = "DRIVE_IN" | "HOME" | "PICKUP";
export type WashType = "EXTERIOR" | "INTERIOR" | "FULL_DETAIL" | "ENGINE_BAY";

export const CONTACT_EMAIL = "skywashservice@gmail.com";
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.skywash.app";
export const STAFF_LOGIN_URL = "https://skywash-admin-web.vercel.app/login";

export const PACKAGES: {
  id: WashType;
  name: string;
  price: number;
  duration: string;
  description: string;
  featured?: boolean;
}[] = [
  {
    id: "EXTERIOR",
    name: "Exterior Wash",
    price: 5_000,
    duration: "45 min",
    description: "A full hand wash for the outside of your car, finished with a streak-free dry.",
  },
  {
    id: "INTERIOR",
    name: "Interior Clean",
    price: 7_000,
    duration: "1 hr",
    description: "Vacuum, wipe-down and glass clean for the whole cabin, boot included.",
  },
  {
    id: "FULL_DETAIL",
    name: "Full Detail",
    price: 25_000,
    duration: "2.5 hrs",
    description: "Our complete inside-and-out treatment with clay bar and a hand-applied wax.",
    featured: true,
  },
  {
    id: "ENGINE_BAY",
    name: "Engine Bay",
    price: 10_000,
    duration: "40 min",
    description: "Safe degrease and dress of the engine bay, with sensitive parts covered.",
  },
];

export const MODES: { id: ServiceMode; label: string; fee: number }[] = [
  { id: "DRIVE_IN", label: "Drive in", fee: 0 },
  { id: "HOME", label: "Home service", fee: 3_000 },
  { id: "PICKUP", label: "Pickup & return", fee: 5_000 },
];

export const MODE_LABELS: Record<ServiceMode, string> = {
  HOME: "Home service",
  PICKUP: "Center · pickup & return",
  DRIVE_IN: "Center · drive in",
};

export const CENTERS = [
  { id: "lekki", name: "Skywash Lekki", area: "Lekki Phase 1, Lagos", hours: "8am–7pm" },
  { id: "ikeja", name: "Skywash Ikeja", area: "Ikeja GRA, Lagos", hours: "8am–7pm" },
  { id: "victoria-island", name: "Skywash Victoria Island", area: "Victoria Island, Lagos", hours: "8am–7pm" },
];

export function centerName(id: string | null) {
  return CENTERS.find((c) => c.id === id)?.name ?? "Skywash center";
}

export function packageName(id: WashType) {
  return PACKAGES.find((p) => p.id === id)?.name ?? id;
}

/** "₦25,000" */
export function formatNaira(amount: number) {
  return `₦${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Do I need an account?",
    a: "No. You book with your name and phone number, and you get a booking code. Use that code here or in the app to check your booking.",
  },
  {
    q: "What if I lose my booking code?",
    a: `Codes you book on your phone are saved in the app under My booking. Otherwise, email us at ${CONTACT_EMAIL} with the name and phone number you booked with, and we'll send it again.`,
  },
  {
    q: "What do you need for a home wash?",
    a: "A space around the car to work in. Our team brings its own water and power, so you don't need a hose or an outlet.",
  },
  {
    q: "How does pickup & return work?",
    a: "A driver collects your car from the address you give, washes it at the nearest center, and brings it back to the same address. Add gate codes or key instructions when you book.",
  },
  {
    q: "When do I pay?",
    a: "After the wash is done, by cash, card or bank transfer. The price you see when you book is the price you pay.",
  },
  {
    q: "Can I cancel or change a booking?",
    a: `Yes. Email us at ${CONTACT_EMAIL} with your booking code, ideally at least two hours before your slot. You pay nothing until the wash is done, so cancelling costs nothing.`,
  },
];
