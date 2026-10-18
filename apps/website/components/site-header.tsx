import { ArrowDown } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";

const NAV = [
  { href: "/#ways", label: "How we wash" },
  { href: "/#services", label: "Services" },
  { href: "/#track", label: "Track a booking" },
  { href: "/#centers", label: "Centers" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#F5F8FB]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
        <Link href="/#top" aria-label="Skywash home">
          <Logo />
        </Link>
        <nav
          aria-label="Main"
          className="order-3 flex min-w-0 flex-[1_1_360px] gap-6 overflow-x-auto whitespace-nowrap text-[15px] font-medium [scrollbar-width:none]"
        >
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-slate-700 hover:text-sky-500">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/#download"
          className="order-2 ml-auto flex h-[42px] items-center gap-2 rounded-xl bg-slate-900 px-[18px] text-[15px] font-semibold text-white hover:bg-slate-700"
        >
          Get the app
          <ArrowDown size={16} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
