import Link from "next/link";
import { CONTACT_EMAIL, STAFF_LOGIN_URL } from "@/lib/site";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-8 px-6 py-10">
        <div className="flex flex-col gap-2.5">
          <Logo size="sm" />
          <span className="text-sm text-slate-500">Car washes at home and in center. Lagos, Nigeria.</span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-sm font-semibold text-sky-700 hover:text-sky-500">
            {CONTACT_EMAIL}
          </a>
        </div>
        <div className="flex flex-wrap gap-[clamp(32px,8vw,56px)] text-[15px]">
          <div className="flex flex-col gap-2.5">
            <span className="font-bold">Book</span>
            <Link href="/#services" className="text-slate-600 hover:text-sky-500">Services</Link>
            <Link href="/#track" className="text-slate-600 hover:text-sky-500">Track a booking</Link>
            <Link href="/#centers" className="text-slate-600 hover:text-sky-500">Centers</Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="font-bold">Company</span>
            <Link href="/#faq" className="text-slate-600 hover:text-sky-500">FAQ</Link>
            <Link href="/privacy" className="text-slate-600 hover:text-sky-500">Privacy policy</Link>
            <a href={STAFF_LOGIN_URL} className="text-slate-600 hover:text-sky-500">Staff login</a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] px-6 pb-8 text-[13px] text-slate-400">© 2026 Skywash</div>
    </footer>
  );
}
