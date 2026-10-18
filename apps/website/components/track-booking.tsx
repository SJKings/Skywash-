"use client";

import { Check, CircleAlert, LoaderCircle, Search, Ticket } from "lucide-react";
import { useState } from "react";
import { centerName, formatNaira, MODE_LABELS, packageName, type ServiceMode, type WashType } from "@/lib/site";

type Status = "PENDING" | "APPROVED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface PublicBooking {
  code: string;
  status: Status;
  washType: WashType;
  serviceMode: ServiceMode;
  address: string | null;
  centerId: string | null;
  bookingDate: string;
  totalPrice: number;
}

const STATUS: Record<Status, { label: string; bg: string; color: string }> = {
  PENDING: { label: "Received", bg: "#E0F2FE", color: "#0369A1" },
  APPROVED: { label: "Confirmed", bg: "#E2E8F0", color: "#334155" },
  IN_PROGRESS: { label: "In progress", bg: "#FEF3C7", color: "#92400E" },
  COMPLETED: { label: "Completed", bg: "#DCFCE7", color: "#166534" },
  CANCELLED: { label: "Cancelled", bg: "#FEE2E2", color: "#991B1B" },
};

const STEP: Partial<Record<Status, number>> = { PENDING: 0, APPROVED: 1, IN_PROGRESS: 2, COMPLETED: 3 };

function stepLabels(mode: ServiceMode) {
  return [
    "Booking received",
    "Confirmed by our team",
    mode === "PICKUP" ? "Picked up · washing" : mode === "HOME" ? "Team on site · washing" : "Washing",
    mode === "PICKUP" ? "Returned" : "Done",
  ];
}

/** "SW-4FQ2" from "sw 4fq2", "4FQ2"… (same rules as the app and server). */
function normalizeCode(input: string) {
  const code = input.trim().toUpperCase().replace(/\s+/g, "");
  if (!code) return "";
  return code.startsWith("SW-") ? code : `SW-${code.replace(/^SW-?/, "")}`;
}

/** "Today · 9:30 AM" in Lagos time. */
function formatWhen(iso: string) {
  const tz = "Africa/Lagos";
  const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: tz });
  const date = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  const day =
    dayKey(date) === dayKey(now)
      ? "Today"
      : dayKey(date) === dayKey(tomorrow)
        ? "Tomorrow"
        : date.toLocaleDateString("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" });
  const time = date.toLocaleTimeString("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; booking: PublicBooking }
  | { kind: "notFound" }
  | { kind: "error" };

export function TrackBooking() {
  const [input, setInput] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function find(e?: React.FormEvent) {
    e?.preventDefault();
    const code = normalizeCode(input);
    if (!code) return;
    setInput(code);
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(code)}`, { cache: "no-store" });
      if (res.status === 404) return setState({ kind: "notFound" });
      if (!res.ok) throw new Error(String(res.status));
      const { booking } = (await res.json()) as { booking: PublicBooking };
      setState({ kind: "found", booking });
    } catch {
      setState({ kind: "error" });
    }
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-14">
      <div className="flex flex-col gap-[22px]">
        <span className="text-[13px] font-bold uppercase tracking-[.12em] text-sky-600">No account needed</span>
        <h2 className="text-[clamp(34px,4.4vw,52px)] font-extrabold leading-[1.04] tracking-[-.02em] text-balance">
          Your booking code is all you need.
        </h2>
        <p className="text-lg leading-relaxed text-slate-700 text-pretty">
          Every booking gets a short code like SW-4FQ2. Enter it here or in the app to see the status, from received
          to done.
        </p>
        <form onSubmit={find} className="flex flex-wrap gap-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SW-XXXX"
            aria-label="Booking code"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className="h-[58px] min-w-0 flex-[1_1_180px] rounded-[14px] border-[1.5px] border-sky-200 bg-white px-[18px] text-lg font-bold uppercase tracking-[.08em] outline-none placeholder:text-slate-400 focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={state.kind === "loading"}
            className="flex h-[58px] cursor-pointer items-center gap-2 rounded-[14px] bg-slate-900 px-[26px] text-base font-bold text-white hover:bg-slate-700 disabled:cursor-wait disabled:opacity-70"
          >
            <Search size={18} aria-hidden />
            Track
          </button>
        </form>
      </div>

      <div
        aria-live="polite"
        className="flex min-h-[340px] flex-col gap-5 rounded-[28px] bg-white p-[clamp(20px,5vw,28px)] shadow-[0_24px_60px_rgba(2,132,199,.14)]"
      >
        {(state.kind === "idle" || state.kind === "loading") && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center text-slate-500">
            <span className="flex size-[60px] items-center justify-center rounded-full bg-sky-50 text-sky-600">
              {state.kind === "loading" ? <LoaderCircle size={26} className="animate-spin" aria-hidden /> : <Ticket size={26} aria-hidden />}
            </span>
            <span className="text-base">{state.kind === "loading" ? "Looking up your booking…" : "Your booking status will show here."}</span>
          </div>
        )}
        {state.kind === "notFound" && <ErrorBox text="No booking found for that code. Check it and try again." />}
        {state.kind === "error" && <ErrorBox text="We couldn't check right now. Please try again in a moment." />}
        {state.kind === "found" && <Result booking={state.booking} />}
      </div>
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div role="alert" className="flex items-center gap-2.5 rounded-[14px] bg-red-50 p-4 text-[15px] text-red-800">
      <CircleAlert size={18} aria-hidden />
      {text}
    </div>
  );
}

function Result({ booking: b }: { booking: PublicBooking }) {
  const s = STATUS[b.status];
  const current = STEP[b.status] ?? -1;
  const labels = stepLabels(b.serviceMode);
  const where = b.serviceMode === "DRIVE_IN" ? centerName(b.centerId) : (b.address ?? "");
  const whereLabel = b.serviceMode === "DRIVE_IN" ? "Center" : b.serviceMode === "PICKUP" ? "Pickup from" : "Address";

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-2xl font-extrabold tracking-[.06em]">{b.code}</span>
        <span className="rounded-[20px] px-3 py-1.5 text-[13px] font-bold" style={{ background: s.bg, color: s.color }}>
          {s.label}
        </span>
      </div>
      {b.status === "CANCELLED" ? (
        <p className="text-[15px] leading-relaxed text-slate-600">This booking was cancelled.</p>
      ) : (
        <ol className="flex flex-col">
          {labels.map((label, i) => {
            const done = i <= current;
            return (
              <li key={label} className="flex gap-3.5">
                <div className="flex w-[22px] flex-col items-center">
                  <span className={`flex size-[22px] shrink-0 items-center justify-center rounded-full text-white ${done ? "bg-sky-500" : "bg-slate-300"}`}>
                    <Check size={12} strokeWidth={3} aria-hidden />
                  </span>
                  {i < labels.length - 1 && <span className={`min-h-3.5 w-0.5 flex-1 ${i < current ? "bg-sky-500" : "bg-slate-200"}`} />}
                </div>
                <span className={`pb-4 text-[15px] ${done ? "text-slate-900" : "text-slate-400"} ${i === current ? "font-bold" : "font-medium"}`}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      <div className="h-px bg-slate-200" />
      <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-[15px]">
        <dt className="text-slate-500">Service</dt>
        <dd className="text-right font-semibold">{packageName(b.washType)}</dd>
        <dt className="text-slate-500">Type</dt>
        <dd className="text-right font-semibold">{MODE_LABELS[b.serviceMode]}</dd>
        <dt className="text-slate-500">When</dt>
        <dd className="text-right font-semibold">{formatWhen(b.bookingDate)}</dd>
        <dt className="text-slate-500">{whereLabel}</dt>
        <dd className="text-right font-semibold">{where}</dd>
        <dt className="text-slate-500">Total</dt>
        <dd className="text-right font-bold text-sky-700">{formatNaira(b.totalPrice)}</dd>
      </dl>
    </>
  );
}
