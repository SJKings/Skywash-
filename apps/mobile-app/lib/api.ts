// Client for the Skywash API served by apps/admin-web.
// Types mirror apps/admin-web/prisma/schema.prisma — keep them in sync.

export type WashType = 'EXTERIOR' | 'INTERIOR' | 'FULL_DETAIL' | 'ENGINE_BAY';
export type ServiceMode = 'HOME' | 'PICKUP' | 'DRIVE_IN';
export type VehicleType = 'SEDAN' | 'SUV' | 'HATCHBACK' | 'TRUCK';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface NewBooking {
  customerName: string;
  phone: string;
  carModel?: string;
  vehicleType: VehicleType;
  licensePlate: string;
  washType: WashType;
  serviceMode: ServiceMode;
  /** Required for HOME and PICKUP. */
  address?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  /** Required for DRIVE_IN: 'mission-bay' | 'north-park' | 'chula-vista'. */
  centerId?: string;
  /** ISO 8601 with offset, e.g. '2026-10-20T09:30:00-07:00'. */
  bookingDate: string;
}

/** Customer-facing view of a booking (no contact details). */
export interface PublicBooking {
  code: string;
  status: BookingStatus;
  washType: WashType;
  serviceMode: ServiceMode;
  address: string | null;
  centerId: string | null;
  vehicleType: VehicleType;
  bookingDate: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
  }
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? `Request failed (${res.status})`, body);
  }
  return body as T;
}

export async function createBooking(booking: NewBooking) {
  const { booking: created } = await request<{ booking: PublicBooking }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  });
  return created;
}

/** Looks up a booking by code ('SW-4FQ2', 'sw 4fq2' and '4FQ2' all work). Returns null if not found. */
export async function findBooking(code: string) {
  try {
    const { booking } = await request<{ booking: PublicBooking }>(
      `/api/bookings/${encodeURIComponent(code.trim())}`,
    );
    return booking;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
