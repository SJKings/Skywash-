import { ArrowRight, ArrowUpRight, Phone } from "lucide-react";
import { formatNaira, PACKAGES } from "@/lib/catalog";
import { canCancel, formatWhen, MODE_LABELS, nextAction } from "@/lib/format";
import type { BookingStatus } from "@/lib/generated/prisma/enums";
import { bookingLocation, vehicleLabel } from "./bookings-table";
import { ModeIcon } from "./mode-icon";
import { StatusPill } from "./status-pill";
import type { BookingJson } from "./types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-500">{label}</span>
      {children}
    </div>
  );
}

export function BookingDetail({
  booking: b,
  now,
  busy,
  onChangeStatus,
}: {
  booking: BookingJson;
  now: Date;
  busy: boolean;
  onChangeStatus: (status: BookingStatus) => void;
}) {
  const mode = MODE_LABELS[b.serviceMode];
  const next = nextAction(b.status, b.serviceMode);
  const location = bookingLocation(b);
  const hasMap = b.serviceMode !== "DRIVE_IN" && Boolean(b.address);

  return (
    <aside className="flex w-full flex-col md:sticky md:top-5 md:w-auto md:min-w-[300px] md:flex-[0_1_380px] gap-[18px] rounded-[18px] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-500">Booking</span>
          <span className="text-[26px] font-extrabold tracking-[.06em]">{b.code}</span>
        </div>
        <StatusPill status={b.status} large />
      </div>

      <div className="flex items-center gap-2.5 rounded-[14px] bg-sky-50 p-3 text-sm font-semibold text-sky-700">
        <ModeIcon mode={b.serviceMode} size={18} />
        {mode.long}
      </div>

      <div className="flex flex-col gap-3.5 text-sm">
        <Field label={mode.whereLabel}>
          <span className="font-semibold leading-[1.4]">{location}</span>
          {hasMap && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address!)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-[5px] text-[13px] font-semibold text-sky-700 hover:text-sky-500"
            >
              Open in Maps <ArrowUpRight size={14} aria-hidden />
            </a>
          )}
        </Field>

        {b.notes && (
          <Field label="Directions">
            <span className="leading-[1.4]">{b.notes}</span>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <Field label="When">
            <span className="font-semibold">{formatWhen(b.bookingDate, now)}</span>
          </Field>
          <Field label="Service">
            <span className="font-semibold">{PACKAGES[b.washType].name}</span>
          </Field>
          <Field label="Vehicle">
            <span className="font-semibold">
              {vehicleLabel(b)} · {b.licensePlate}
            </span>
          </Field>
          <Field label="Total">
            <span className="font-bold text-sky-700">{formatNaira(b.totalPrice)}</span>
          </Field>
        </div>

        <div className="h-px bg-slate-200" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">{b.customerName}</span>
            <span className="text-slate-500">{b.phone}</span>
          </div>
          <a
            href={`tel:${b.phone.replace(/[^0-9+]/g, "")}`}
            aria-label={`Call ${b.customerName}`}
            className="flex size-10 items-center justify-center rounded-full bg-sky-50 text-sky-700 hover:text-sky-500"
          >
            <Phone size={17} aria-hidden />
          </a>
        </div>
      </div>

      {(next || canCancel(b.status)) && (
        <div className="flex flex-col gap-2">
          {next && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onChangeStatus(next.status)}
              className="flex h-12 cursor-pointer items-center justify-between rounded-[14px] bg-sky-500 px-4 text-left text-[15px] font-bold text-white hover:bg-sky-600 disabled:cursor-wait disabled:opacity-60"
            >
              {next.label}
              <ArrowRight size={18} aria-hidden />
            </button>
          )}
          {canCancel(b.status) && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Cancel booking ${b.code}? This can't be undone.`)) {
                  onChangeStatus("CANCELLED");
                }
              }}
              className="h-11 cursor-pointer rounded-[14px] border-[1.5px] border-slate-200 bg-white px-4 text-left text-sm font-semibold text-red-800 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
            >
              Cancel booking
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
