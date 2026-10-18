// Display helpers for the admin dashboard (safe to import from client components).
import { BUSINESS_TIME_ZONE } from "@/lib/catalog";
import type { BookingStatus, ServiceMode } from "@/lib/generated/prisma/enums";

/** "YYYY-MM-DD" of the given instant in the business time zone. */
export function businessDayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** The instant of a wall-clock time ("09:30") on a business day ("2026-10-20"). */
export function businessDateTime(dayKey: string, time: string) {
  // Read the zone's UTC offset at roughly that moment, e.g. "GMT-07:00".
  const probe = new Date(`${dayKey}T${time}:00Z`);
  const offset =
    new Intl.DateTimeFormat("en-US", { timeZone: BUSINESS_TIME_ZONE, timeZoneName: "longOffset" })
      .formatToParts(probe)
      .find((p) => p.type === "timeZoneName")
      ?.value.replace("GMT", "") || "+00:00";
  return new Date(`${dayKey}T${time}:00${offset}`);
}

export function shiftDayKey(key: string, days: number) {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "Today · 9:30 AM", "Tomorrow · 2:00 PM", "Oct 24 · 8:00 AM". */
export function formatWhen(iso: string, now = new Date()) {
  const date = new Date(iso);
  const key = businessDayKey(date);
  const today = businessDayKey(now);
  const day =
    key === today
      ? "Today"
      : key === shiftDayKey(today, 1)
        ? "Tomorrow"
        : key === shiftDayKey(today, -1)
          ? "Yesterday"
          : date.toLocaleDateString("en-US", { timeZone: BUSINESS_TIME_ZONE, month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  });
  return `${day} · ${time}`;
}

/** "Sunday, October 18, 2026" */
export function formatLongDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const STATUS_STYLES: Record<BookingStatus, { label: string; bg: string; color: string }> = {
  PENDING: { label: "New", bg: "#E0F2FE", color: "#0369A1" },
  APPROVED: { label: "Confirmed", bg: "#E2E8F0", color: "#334155" },
  IN_PROGRESS: { label: "In progress", bg: "#FEF3C7", color: "#92400E" },
  COMPLETED: { label: "Completed", bg: "#DCFCE7", color: "#166534" },
  CANCELLED: { label: "Cancelled", bg: "#FEE2E2", color: "#991B1B" },
};

export const MODE_LABELS: Record<ServiceMode, { short: string; long: string; whereLabel: string }> = {
  HOME: {
    short: "Home",
    long: "Home service · team travels to customer",
    whereLabel: "Service address",
  },
  PICKUP: {
    short: "Pickup",
    long: "Center service · we pick up and return",
    whereLabel: "Pickup & return address",
  },
  DRIVE_IN: {
    short: "Drive-in",
    long: "Center service · customer drives in",
    whereLabel: "Drive-in center",
  },
};

const STATUS_FLOW: BookingStatus[] = ["PENDING", "APPROVED", "IN_PROGRESS", "COMPLETED"];

/** The next step in the status flow and the button label staff see for it, or null at the end. */
export function nextAction(status: BookingStatus, mode: ServiceMode) {
  const i = STATUS_FLOW.indexOf(status);
  if (i < 0 || i >= STATUS_FLOW.length - 1) return null;

  const labels: Partial<Record<BookingStatus, string>> = {
    PENDING: "Confirm booking",
    APPROVED:
      mode === "PICKUP"
        ? "Car picked up · start wash"
        : mode === "HOME"
          ? "Team on site · start wash"
          : "Car arrived · start wash",
    IN_PROGRESS: mode === "PICKUP" ? "Car returned · complete" : "Mark completed",
  };
  return { status: STATUS_FLOW[i + 1], label: labels[status]! };
}

export function canCancel(status: BookingStatus) {
  return status !== "COMPLETED" && status !== "CANCELLED";
}
