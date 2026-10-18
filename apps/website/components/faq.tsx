"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { FAQS } from "@/lib/site";

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="flex min-w-0 flex-[2_1_min(100%,480px)] flex-col border-t border-slate-300">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="border-b border-slate-300">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 py-[22px] text-left text-lg font-bold text-slate-900"
            >
              {f.q}
              {isOpen ? <Minus size={20} className="shrink-0 text-sky-600" aria-hidden /> : <Plus size={20} className="shrink-0 text-sky-600" aria-hidden />}
            </button>
            {isOpen && <p className="max-w-[680px] pb-[22px] text-base leading-relaxed text-slate-600 text-pretty">{f.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
