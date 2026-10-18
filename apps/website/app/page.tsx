import { ArrowRight, Car, Clock, House, Info, MapPin, Smartphone, Truck, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { Faq } from "@/components/faq";
import { Prices } from "@/components/prices";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TrackBooking } from "@/components/track-booking";
import { CENTERS, formatNaira, MODES, PLAY_STORE_URL } from "@/lib/site";

const fee = (id: string) => MODES.find((m) => m.id === id)!.fee;

const WAYS: { icon: LucideIcon; title: string; fee: string; body: string; note: string }[] = [
  {
    icon: House,
    title: "Home service",
    fee: `+${formatNaira(fee("HOME"))}`,
    body: "Our team comes to your home or office with water and power. Your car never moves.",
    note: "You enter the address and any directions.",
  },
  {
    icon: Truck,
    title: "Pickup & return",
    fee: `+${formatNaira(fee("PICKUP"))}`,
    body: "We collect your car, wash it at the nearest center, and bring it back to the same address.",
    note: "Good for when you need the car back clean, not waiting.",
  },
  {
    icon: Car,
    title: "Drive in",
    fee: "No extra fee",
    body: "Bring your car to one of our centers at the time you picked. We start as soon as you arrive.",
    note: "Choose your center when you book.",
  },
];

const STEPS = [
  { n: "01", title: "Pick a service", body: "Exterior, interior, full detail or engine bay." },
  { n: "02", title: "Choose where", body: "At home, or at a center with pickup or drive-in." },
  { n: "03", title: "Pick a time", body: "Choose a day and an open slot that suits you." },
  { n: "04", title: "Get your code", body: "Save it. It's how you track your booking." },
];

const SHOTS = [
  { src: "/screens/phone-1.png", alt: "Skywash app home screen", cap: "Browse services and prices" },
  { src: "/screens/phone-2.png", alt: "Choosing home service or a car center", cap: "Home or center" },
  { src: "/screens/phone-3.png", alt: "Entering the pickup address", cap: "Tell us where the car is" },
  { src: "/screens/phone-4.png", alt: "Tracking a booking by its code", cap: "Track it with your code" },
];

function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`text-[13px] font-bold uppercase tracking-[.12em] ${dark ? "text-sky-300" : "text-sky-600"}`}>
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[clamp(34px,4.4vw,52px)] font-extrabold leading-[1.04] tracking-[-.02em] text-balance">
      {children}
    </h2>
  );
}

/**
 * Phone renders (1080×1920, transparent) laid out like the store screenshots,
 * with the phone starting part-way down; crop to the phone. `offset` is how far
 * down to start, as a share of the image width (CSS margin percentages use the width).
 */
function PhoneShot({ src, alt, aspect, offset, priority }: { src: string; alt: string; aspect: string; offset: string; priority?: boolean }) {
  return (
    <div className="overflow-hidden" style={{ aspectRatio: aspect }}>
      <Image src={src} alt={alt} width={1080} height={1920} priority={priority} className="block h-auto w-full" style={{ marginTop: offset }} />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col">
        {/* Hero */}
        <section id="top" className="overflow-hidden bg-sky-100">
          <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-[clamp(24px,5vw,48px)] px-5 pt-[clamp(40px,8vw,72px)]">
            <div className="flex flex-col gap-7 pb-[clamp(8px,6vw,72px)]">
              <span className="flex items-center gap-2 self-start rounded-[20px] bg-white px-3.5 py-[7px] text-[13px] font-semibold text-sky-700">
                <MapPin size={14} aria-hidden />
                Now washing across Lagos
              </span>
              <h1 className="text-[clamp(40px,6.4vw,80px)] font-extrabold leading-[.98] tracking-[-.025em] text-balance">
                Book a car wash in <span className="text-sky-600">under a minute.</span>
              </h1>
              <p className="max-w-[500px] text-[19px] leading-normal text-slate-700 text-pretty">
                We wash at your home, or at one of our centers. Pick a service and a time, and you get a booking code.
                No account, no password.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={PLAY_STORE_URL}
                  className="flex h-14 items-center gap-2.5 rounded-[14px] bg-sky-500 px-6 text-base font-bold text-white shadow-[0_10px_24px_rgba(14,165,233,.3)] hover:bg-sky-600"
                >
                  <Smartphone size={20} aria-hidden />
                  Download for Android
                </a>
                <a href="#services" className="flex h-14 items-center gap-2.5 rounded-[14px] bg-white px-6 text-base font-semibold text-slate-900 hover:text-sky-600">
                  See prices
                  <ArrowRight size={18} aria-hidden />
                </a>
              </div>
              <div className="flex flex-wrap gap-7 text-sm text-slate-700">
                {[
                  { icon: House, label: "Home service" },
                  { icon: Truck, label: "Pickup & return" },
                  { icon: Car, label: "Drive in" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-2">
                    <Icon size={16} className="text-sky-600" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-[min(100%,420px)]">
                <PhoneShot src="/screens/phone-1.png" alt="Skywash app home screen" aspect="1080/1450" offset="-40.7%" priority />
              </div>
            </div>
          </div>
        </section>

        {/* Three ways */}
        <section id="ways" className="px-5 py-[clamp(64px,10vw,104px)]">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-12">
            <div className="flex max-w-[680px] flex-col gap-3.5">
              <Eyebrow>Three ways to wash</Eyebrow>
              <SectionTitle>At your home, or at our center.</SectionTitle>
              <p className="text-lg leading-relaxed text-slate-600 text-pretty">
                Choose where the wash happens when you book. Prices for each service stay the same; only the delivery
                option changes.
              </p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
              {WAYS.map((w) => (
                <div key={w.title} className="flex flex-col gap-[18px] rounded-3xl border border-slate-200 bg-white p-7">
                  <div className="flex items-start justify-between">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                      <w.icon size={24} aria-hidden />
                    </span>
                    <span className="rounded-[20px] bg-sky-50 px-3 py-1.5 text-sm font-bold text-sky-700">{w.fee}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[22px] font-extrabold">{w.title}</span>
                    <span className="text-base leading-relaxed text-slate-600 text-pretty">{w.body}</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <Info size={15} className="shrink-0 text-sky-600" aria-hidden />
                    {w.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-slate-900 px-5 py-[clamp(64px,10vw,104px)] text-white">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-14">
            <div className="flex max-w-[640px] flex-col gap-3.5">
              <Eyebrow dark>How it works</Eyebrow>
              <SectionTitle>Four steps. Then we take it from there.</SectionTitle>
            </div>
            <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] border-t border-slate-700">
              {STEPS.map((s) => (
                <li key={s.n} className="flex flex-col gap-3.5 pt-7 pr-6 pb-2">
                  <span className="text-[15px] font-bold text-sky-400">{s.n}</span>
                  <span className="text-[22px] font-extrabold">{s.title}</span>
                  <span className="text-base leading-relaxed text-slate-300 text-pretty">{s.body}</span>
                </li>
              ))}
            </ol>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-5">
              {SHOTS.map((s) => (
                <figure key={s.src} className="flex flex-col gap-3">
                  <div className="overflow-hidden rounded-[20px] bg-sky-100">
                    <PhoneShot src={s.src} alt={s.alt} aspect="1080/1250" offset="-40.7%" />
                  </div>
                  <figcaption className="text-sm text-slate-400">{s.cap}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Services & prices */}
        <section id="services" className="px-5 py-[clamp(64px,10vw,104px)]">
          <div className="mx-auto max-w-[1200px]">
            <Prices />
          </div>
        </section>

        {/* Track */}
        <section id="track" className="bg-sky-100 px-5 py-[clamp(64px,10vw,104px)]">
          <div className="mx-auto max-w-[1200px]">
            <TrackBooking />
          </div>
        </section>

        {/* Centers */}
        <section id="centers" className="px-5 py-[clamp(64px,10vw,104px)]">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
            <div className="flex max-w-[640px] flex-col gap-3.5">
              <Eyebrow>Our centers</Eyebrow>
              <SectionTitle>Drive in, or we bring it here.</SectionTitle>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-5">
              {CENTERS.map((c) => (
                <div key={c.id} className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  <div
                    className="flex h-[200px] items-center justify-center bg-[#DCE8F0] text-sky-500"
                    style={{
                      backgroundImage: "linear-gradient(#CFDDE8 1px,transparent 1px),linear-gradient(90deg,#CFDDE8 1px,transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  >
                    <MapPin size={34} aria-hidden />
                  </div>
                  <div className="flex flex-col gap-2.5 p-6">
                    <span className="text-[21px] font-extrabold">{c.name}</span>
                    <span className="flex items-center gap-2 text-[15px] text-slate-600">
                      <MapPin size={16} aria-hidden />
                      {c.area}
                    </span>
                    <span className="flex items-center gap-2 text-[15px] text-slate-600">
                      <Clock size={16} aria-hidden />
                      Open {c.hours}, every day
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-5 pb-[clamp(64px,10vw,104px)]">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-12">
            <div className="flex flex-[1_1_300px] flex-col gap-3.5">
              <Eyebrow>FAQ</Eyebrow>
              <SectionTitle>Questions, answered.</SectionTitle>
            </div>
            <Faq />
          </div>
        </section>

        {/* Download */}
        <section id="download" className="px-5 pb-[clamp(64px,10vw,104px)]">
          <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-end overflow-hidden rounded-[32px] bg-sky-500">
            <div className="flex flex-col gap-[22px] self-center px-[clamp(24px,5vw,48px)] py-[clamp(36px,6vw,64px)] text-white">
              <Image src="/app-icon.png" alt="Skywash app icon" width={72} height={72} className="rounded-[18px] shadow-[0_8px_24px_rgba(15,23,42,.18)] ring-2 ring-white/40" />
              <h2 className="text-[clamp(36px,4.6vw,56px)] font-extrabold leading-none tracking-[-.02em] text-balance">
                Your next wash is a minute away.
              </h2>
              <p className="text-lg leading-normal text-sky-50">Book in the app, pay after the wash.</p>
              <a href={PLAY_STORE_URL} className="flex self-start" aria-label="Get it on Google Play">
                {/* Google's official badge, served by Google as their brand guidelines ask. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  className="-mx-1.5 -my-3 block h-[84px]"
                />
              </a>
            </div>
            <div className="flex justify-center px-6 pt-10">
              <div className="w-[min(100%,360px)]">
                <PhoneShot src="/screens/phone-4.png" alt="Tracking a booking by its code" aspect="1080/1200" offset="-40.7%" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
