// State for the 4-step booking flow, shared by the screens under src/app/book.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { NewBooking, PublicBooking, ServiceMode, VehicleType, WashType } from './api';
import { getPackage, SERVICE_FEES } from './catalog';
import { addDays, pacificIso, todayKey } from './time';

export type Place = 'HOME' | 'CENTER';
export type CenterTransport = 'PICKUP' | 'DRIVE_IN';

export interface BookingDraft {
  washType: WashType;
  place: Place | null;
  transport: CenterTransport | null;
  address: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  centerId: string | null;
  dayOffset: number;
  time: string | null;
  vehicleType: VehicleType;
  licensePlate: string;
  customerName: string;
  phone: string;
}

const emptyDraft = (washType: WashType): BookingDraft => ({
  washType,
  place: null,
  transport: null,
  address: '',
  notes: '',
  centerId: null,
  dayOffset: 0,
  time: null,
  vehicleType: 'SEDAN',
  licensePlate: '',
  customerName: '',
  phone: '',
});

/** HOME, PICKUP or DRIVE_IN once the customer has chosen; null before. */
export function serviceModeOf(d: BookingDraft): ServiceMode | null {
  if (d.place === 'HOME') return 'HOME';
  if (d.place === 'CENTER') return d.transport;
  return null;
}

// Mirrors the server's validation in apps/admin-web/lib/validation.ts.
const PHONE = /^[0-9+()\-.\s]{7,20}$/;
const PLATE = /^[A-Z0-9 -]{1,12}$/;

export const stepValid = {
  type: (d: BookingDraft) => serviceModeOf(d) !== null,
  location: (d: BookingDraft) =>
    serviceModeOf(d) === 'DRIVE_IN' ? d.centerId !== null : d.address.trim().length > 3,
  schedule: (d: BookingDraft) =>
    d.time !== null &&
    d.customerName.trim().length > 0 &&
    PHONE.test(d.phone.trim()) &&
    PLATE.test(d.licensePlate.trim().toUpperCase()),
};

export function bookingDay(d: BookingDraft) {
  return addDays(todayKey(), d.dayOffset);
}

export function draftTotal(d: BookingDraft) {
  const mode = serviceModeOf(d);
  return getPackage(d.washType).price + (mode ? SERVICE_FEES[mode] : 0);
}

/** The API payload for a completed draft. */
export function toNewBooking(d: BookingDraft): NewBooking {
  const mode = serviceModeOf(d)!;
  const atCustomer = mode !== 'DRIVE_IN';
  return {
    customerName: d.customerName.trim(),
    phone: d.phone.trim(),
    vehicleType: d.vehicleType,
    licensePlate: d.licensePlate.trim().toUpperCase(),
    washType: d.washType,
    serviceMode: mode,
    address: atCustomer ? d.address.trim() : undefined,
    latitude: atCustomer ? d.latitude : undefined,
    longitude: atCustomer ? d.longitude : undefined,
    notes: atCustomer && d.notes.trim() ? d.notes.trim() : undefined,
    centerId: atCustomer ? undefined : (d.centerId ?? undefined),
    bookingDate: pacificIso(bookingDay(d), d.time!),
  };
}

interface BookingFlow {
  draft: BookingDraft;
  update: (patch: Partial<BookingDraft>) => void;
  /** Starts a fresh booking for a package. */
  start: (washType: WashType) => void;
  /** The booking just created, for the confirmation screen. */
  confirmed: PublicBooking | null;
  setConfirmed: (b: PublicBooking | null) => void;
}

const BookingFlowContext = createContext<BookingFlow | null>(null);

export function BookingFlowProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(() => emptyDraft('FULL_DETAIL'));
  const [confirmed, setConfirmed] = useState<PublicBooking | null>(null);

  const update = useCallback((patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const start = useCallback((washType: WashType) => setDraft(emptyDraft(washType)), []);

  const value = useMemo(
    () => ({ draft, update, start, confirmed, setConfirmed }),
    [draft, update, start, confirmed],
  );
  return <BookingFlowContext.Provider value={value}>{children}</BookingFlowContext.Provider>;
}

export function useBookingFlow() {
  const ctx = useContext(BookingFlowContext);
  if (!ctx) throw new Error('useBookingFlow must be used inside BookingFlowProvider');
  return ctx;
}
