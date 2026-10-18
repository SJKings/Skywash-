"use client";

import { ArrowRight, Armchair, Clock, Cog, Sparkles, SprayCan, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { formatNaira, MODES, PACKAGES, type ServiceMode, type WashType } from "@/lib/site";

const ICONS: Record<WashType, LucideIcon> = {
  EXTERIOR: SprayCan,
  INTERIOR: Armchair,
  FULL_DETAIL: Sparkles,
  ENGINE_BAY: Cog,
};

export function Prices() {
  const [mode, setMode] = useState<ServiceMode>("DRIVE_IN");
  const m = MODES.find((x) => x.id === mode)!;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[640px] flex-col gap-3.5">
          <span className="text-[13px] font-bold uppercase tracking-[.12em] text-sky-600">Services &amp; prices</span>
          <h2 className="text-[clamp(34px,4.4vw,52px)] font-extrabold leading-[1.04] tracking-[-.02em] text-balance">
            Clear prices, before you book.
          </h2>
        </div>
        <div role="tablist" aria-label="Where the wash happens" className="flex max-w-full flex-wrap gap-1 rounded-[14px] bg-slate-200 p-1">
          {MODES.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={x.id === mode}
              onClick={() => setMode(x.id)}
              className={`h-10 cursor-pointer rounded-[10px] px-4 text-sm font-semibold ${x.id === mode ? "bg-white text-slate-900" : "text-slate-600 hover:text-slate-900"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-5">
        {PACKAGES.map((p) => {
          const Icon = ICONS[p.id];
          const dark = p.featured;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col gap-5 rounded-3xl border p-[26px] ${dark ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}
            >
              {dark && (
                <span className="absolute top-[22px] right-[22px] rounded-[20px] bg-sky-500 px-2.5 py-[5px] text-xs font-bold text-white">
                  Complete care
                </span>
              )}
              <span className={`flex size-[52px] items-center justify-center rounded-full ${dark ? "bg-slate-800 text-sky-400" : "bg-sky-100 text-sky-600"}`}>
                <Icon size={22} aria-hidden />
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="text-[21px] font-extrabold">{p.name}</span>
                <span className={`flex items-center gap-1.5 text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  <Clock size={14} aria-hidden />
                  {p.duration}
                </span>
              </div>
              <span className={`flex-1 text-[15px] leading-relaxed text-pretty ${dark ? "text-slate-300" : "text-slate-600"}`}>
                {p.description}
              </span>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-[40px] font-extrabold tracking-[-.02em]">{formatNaira(p.price + m.fee)}</span>
                <span className={`text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  {m.fee ? `incl. ${formatNaira(m.fee)} ${m.label.toLowerCase()}` : "at the center"}
                </span>
              </div>
              <a
                href="#download"
                className={`flex h-12 items-center justify-center gap-2 rounded-xl text-[15px] font-bold ${dark ? "bg-sky-500 text-white hover:bg-sky-600" : "bg-sky-50 text-sky-700 hover:bg-sky-100"}`}
              >
                Book in the app
                <ArrowRight size={16} aria-hidden />
              </a>
            </div>
          );
        })}
      </div>
      <span className="text-sm text-slate-500">Same price for every vehicle type. Pay after the wash, at your door or at the center.</span>
    </div>
  );
}
