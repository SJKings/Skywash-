"use client";

import {
  Calendar,
  CircleAlert,
  CircleCheck,
  Droplets,
  Inbox,
  Loader,
  LogOut,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { businessDayKey, formatLongDate } from "@/lib/format";
import type { BookingStatus, ServiceMode } from "@/lib/generated/prisma/enums";
import { BookingDetail } from "./booking-detail";
import { BookingsTable } from "./bookings-table";
import type { BookingJson } from "./types";

// Stand-in for realtime updates: re-fetch while the tab is visible.
const POLL_MS = 5000;

type Tab = "ALL" | ServiceMode;

const TABS: { key: Tab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "HOME", label: "Home service" },
  { key: "PICKUP", label: "Pickup" },
  { key: "DRIVE_IN", label: "Drive-in" },
];

export function Dashboard() {
  const router = useRouter();
  const toLogin = useCallback(() => router.replace("/login"), [router]);
  const [bookings, setBookings] = useState<BookingJson[] | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [live, setLive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("ALL");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Polls that started before the latest status change may carry stale data.
  const lastMutation = useRef(0);

  const load = useCallback(async () => {
    const startedAt = Date.now();
    try {
      const res = await fetch("/api/bookings?status=all", { cache: "no-store" });
      if (res.status === 401) return toLogin();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body: { bookings: BookingJson[] } = await res.json();
      if (startedAt < lastMutation.current) return;
      setBookings(body.bookings);
      setNow(new Date());
      setLive(true);
    } catch {
      setLive(false);
    }
  }, [toLogin]);

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) void load();
    };
    tick();
    const timer = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [load]);

  const changeStatus = useCallback(
    async (id: string, status: BookingStatus) => {
      setBusyId(id);
      setError(null);
      try {
        const res = await fetch(`/api/bookings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.status === 401) return toLogin();
        const body = await res.json().catch(() => null);
        lastMutation.current = Date.now();
        if (!res.ok) {
          setError(body?.error ?? "Couldn't update the booking. Try again.");
          await load();
          return;
        }
        setBookings((prev) => prev?.map((b) => (b.id === id ? body.booking : b)) ?? null);
      } catch {
        setError("Couldn't reach the server. Check your connection and try again.");
      } finally {
        setBusyId(null);
      }
    },
    [load, toLogin],
  );

  const all = useMemo(() => bookings ?? [], [bookings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (b) =>
        (tab === "ALL" || b.serviceMode === tab) &&
        (!q || [b.code, b.customerName, b.licensePlate].join(" ").toLowerCase().includes(q)),
    );
  }, [all, tab, query]);

  const selected = all.find((b) => b.id === selectedId) ?? filtered[0] ?? null;

  const stats = useMemo(() => {
    const today = now ? businessDayKey(now) : null;
    const count = (pred: (b: BookingJson) => boolean) => all.filter(pred).length;
    return [
      { label: "New", icon: Inbox, value: count((b) => b.status === "PENDING") },
      {
        label: "Scheduled today",
        icon: Calendar,
        value: count(
          (b) => b.status !== "CANCELLED" && businessDayKey(new Date(b.bookingDate)) === today,
        ),
      },
      { label: "In progress", icon: Loader, value: count((b) => b.status === "IN_PROGRESS") },
      { label: "Completed", icon: CircleCheck, value: count((b) => b.status === "COMPLETED") },
    ];
  }, [all, now]);

  async function signOut() {
    await fetch("/api/auth/session", { method: "DELETE" }).catch(() => null);
    toLogin();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-[34px] items-center justify-center rounded-[10px] bg-sky-500 text-white">
            <Droplets size={17} aria-hidden />
          </div>
          <span className="text-lg font-extrabold">Skywash</span>
          <span className="hidden text-[15px] text-slate-400 sm:inline">Operations</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {live ? (
            <span className="flex items-center gap-2 rounded-[20px] bg-green-100 px-3 py-1.5 text-[13px] font-semibold text-green-800">
              <span className="size-2 rounded-full bg-green-600" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-2 rounded-[20px] bg-red-50 px-3 py-1.5 text-[13px] font-semibold text-red-800">
              <span className="size-2 rounded-full bg-red-800" />
              Reconnecting…
            </span>
          )}
          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out"
            className="flex cursor-pointer items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[13px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut size={15} aria-hidden />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-[22px] px-4 py-7 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] font-extrabold">Bookings</h1>
            <span className="text-sm text-slate-500">
              New bookings from the customer app appear here automatically.
            </span>
          </div>
          <span className="text-sm text-slate-500">{now && formatLongDate(now)}</span>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-[14px] bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            <CircleAlert size={18} aria-hidden />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss"
              className="cursor-pointer rounded-md p-1 hover:bg-red-100"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1.5 rounded-2xl bg-white px-[18px] py-4">
              <span className="flex items-center gap-1.5 text-[13px] text-slate-500">
                <s.icon size={15} className="text-sky-500" aria-hidden />
                {s.label}
              </span>
              <span className="text-[28px] font-extrabold">{bookings ? s.value : "–"}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-start gap-[18px]">
          <section className="min-w-0 flex-[1_1_640px] overflow-hidden rounded-[18px] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
              <div role="tablist" className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-[9px] px-3 py-[7px] text-[13px] font-semibold ${tab === t.key ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    {t.label}
                    <span className="text-[11px] text-slate-400">
                      {t.key === "ALL" ? all.length : all.filter((b) => b.serviceMode === t.key).length}
                    </span>
                  </button>
                ))}
              </div>
              <label className="flex h-[38px] min-w-[220px] items-center gap-2 rounded-[10px] border-[1.5px] border-slate-200 px-3 text-slate-400 focus-within:border-sky-500">
                <Search size={16} aria-hidden />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Code, name or plate"
                  aria-label="Search bookings"
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            {bookings === null ? (
              <div className="px-4 py-10 text-sm text-slate-500">Loading bookings…</div>
            ) : (
              <>
                {filtered.length > 0 && (
                  <BookingsTable
                    bookings={filtered}
                    selectedId={selected?.id ?? null}
                    onSelect={setSelectedId}
                    now={now ?? new Date()}
                  />
                )}
                {filtered.length === 0 && (
                  <div className="px-4 py-10 text-sm text-slate-500">
                    {all.length === 0 ? "No bookings yet." : "No bookings match this filter."}
                  </div>
                )}
              </>
            )}
          </section>

          {selected && (
            <BookingDetail
              key={selected.id}
              booking={selected}
              now={now ?? new Date()}
              busy={busyId === selected.id}
              onChangeStatus={(status) => changeStatus(selected.id, status)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
