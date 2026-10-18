import { centerName, PACKAGES } from "@/lib/catalog";
import { formatWhen, MODE_LABELS } from "@/lib/format";
import { ModeIcon } from "./mode-icon";
import { StatusPill } from "./status-pill";
import type { BookingJson } from "./types";

const VEHICLE_LABELS = { SEDAN: "Sedan", SUV: "SUV", HATCHBACK: "Hatchback", TRUCK: "Truck" };

export function vehicleLabel(b: BookingJson) {
  return b.carModel ? `${VEHICLE_LABELS[b.vehicleType]} · ${b.carModel}` : VEHICLE_LABELS[b.vehicleType];
}

export function bookingLocation(b: BookingJson) {
  return b.serviceMode === "DRIVE_IN" ? centerName(b.centerId) : (b.address ?? "");
}

export function BookingsTable({
  bookings,
  selectedId,
  onSelect,
  now,
}: {
  bookings: BookingJson[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  now: Date;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[.04em] text-slate-500">
            <th className="px-4 py-3 font-semibold">Code</th>
            <th className="px-2 py-3 font-semibold">Customer</th>
            <th className="px-2 py-3 font-semibold">Service</th>
            <th className="px-2 py-3 font-semibold">Type</th>
            <th className="px-2 py-3 font-semibold">Location</th>
            <th className="px-2 py-3 font-semibold">When</th>
            <th className="py-3 pr-4 pl-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b.id}
              onClick={() => onSelect(b.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(b.id);
                }
              }}
              tabIndex={0}
              aria-selected={b.id === selectedId}
              className={`cursor-pointer border-t border-slate-100 ${b.id === selectedId ? "bg-sky-50" : "bg-white hover:bg-slate-50"}`}
            >
              <td className="whitespace-nowrap px-4 py-3.5 font-bold tracking-[.04em]">{b.code}</td>
              <td className="px-2 py-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">{b.customerName}</span>
                  <span className="text-xs text-slate-500">
                    {vehicleLabel(b)} · {b.licensePlate}
                  </span>
                </div>
              </td>
              <td className="px-2 py-3.5">{PACKAGES[b.washType].name}</td>
              <td className="px-2 py-3.5">
                <span className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-lg bg-sky-50 px-[9px] py-1 text-xs font-semibold text-sky-700">
                  <ModeIcon mode={b.serviceMode} size={13} />
                  {MODE_LABELS[b.serviceMode].short}
                </span>
              </td>
              <td className="max-w-[220px] px-2 py-3.5 text-slate-600">{bookingLocation(b)}</td>
              <td className="whitespace-nowrap px-2 py-3.5">{formatWhen(b.bookingDate, now)}</td>
              <td className="py-3.5 pr-4 pl-2">
                <StatusPill status={b.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
