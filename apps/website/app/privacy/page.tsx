import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy · Skywash",
  description: "How Skywash collects, uses and protects your information.",
};

const CONTACT = CONTACT_EMAIL;
const EFFECTIVE = "October 21, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

// Linked from the mobile app, the Google Play listing and the site footer.
export default function PrivacyPolicyPage() {
  return (
    <>
    <SiteHeader />
    <main className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-5 py-10 sm:py-14">
      <header className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-extrabold leading-tight text-slate-900">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Effective {EFFECTIVE}</p>
        </div>
        <p className="text-[15px] leading-relaxed text-slate-600">
          Skywash (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides car wash services in Lagos, Nigeria: at our centers,
          at your home, or by collecting and returning your car. This policy explains what information the Skywash
          mobile app and websites collect, how we use it, and the choices you have.
        </p>
      </header>

      <div className="flex flex-col gap-8 rounded-[20px] bg-white p-6 sm:p-8">
        <Section title="No accounts">
          <p>
            You don&apos;t need to create an account or sign in to use Skywash. When you book, you receive a
            booking code (for example SW-4FQ2). Anyone who has that code can see the booking&apos;s status, service,
            date and time, location and price, but not your name or phone number. Keep your code private.
          </p>
        </Section>

        <Section title="Information we collect">
          <p>When you make a booking, we collect only what we need to do the job:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-slate-800">Contact details:</strong> your name and phone number, so our team
              can reach you about the booking.
            </li>
            <li>
              <strong className="text-slate-800">Vehicle details:</strong> vehicle type and license plate, so we
              wash the right car.
            </li>
            <li>
              <strong className="text-slate-800">Location:</strong> for home service or pickup, the address you
              enter and any directions you add (such as a gate code). If you tap &ldquo;Use my current
              location&rdquo;, the app asks for permission and uses your device&apos;s location once to fill in the
              address; those coordinates are saved with the booking. We never track your location in the
              background. For drive-in bookings we only record which center you chose.
            </li>
            <li>
              <strong className="text-slate-800">Booking details:</strong> the service, date and time, price and
              status of your booking.
            </li>
          </ul>
          <p>
            The app also stores the booking codes you create on your own phone, so you can find them again. They
            stay on your device and are removed if you uninstall the app.
          </p>
          <p>
            We do not collect payment information in the app (you pay on completion, by cash, card or bank transfer), and we
            do not use advertising, analytics or tracking tools.
          </p>
        </Section>

        <Section title="How we use your information">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To schedule, carry out and complete your car wash.</li>
            <li>To contact you about your booking, for example if we&apos;re running late.</li>
            <li>To show you your booking status when you enter your booking code.</li>
            <li>To keep business records and meet our legal obligations.</li>
          </ul>
          <p>We do not sell your personal information or share it for advertising.</p>
        </Section>

        <Section title="Who we share it with">
          <p>
            Your information is seen by Skywash staff who handle bookings. It is stored with service providers
            that host our systems: Vercel (our website and app server) and Prisma (our database). They process it
            only on our behalf. We may also disclose information if the law requires it.
          </p>
          <p>
            These providers store data on servers that may be outside Nigeria. Where your information is
            transferred abroad, we rely on providers that apply appropriate safeguards to protect it, as required
            by the Nigeria Data Protection Act 2023.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            We keep booking records for as long as needed to provide the service and for our business and legal
            records. You can ask us to delete your information at any time (see below).
          </p>
        </Section>

        <Section title="Security">
          <p>
            Information travels between the app and our servers over encrypted connections (HTTPS). Only
            authorized Skywash staff can see customer contact details.
          </p>
        </Section>

        <Section title="Your choices and rights">
          <p>
            You can ask us to show you, correct or delete the information we hold about your bookings. Email us
            at{" "}
            <a className="font-semibold text-sky-700 hover:text-sky-500" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>{" "}
            with your booking code. You can also turn off location access for the app in your phone&apos;s settings
            and type your address instead.
          </p>
          <p>
            Under the Nigeria Data Protection Act 2023 you have the right to be informed about how we use your
            information, to access it, to have it corrected or deleted, to object to or restrict its use, and to
            receive a copy of it. We process your information to perform the service you book with us. If you
            believe we have not handled your information properly, you can complain to the Nigeria Data
            Protection Commission (NDPC), though we would appreciate the chance to resolve it with you first.
          </p>
        </Section>

        <Section title="Children">
          <p>
            Skywash is not intended for children under 13, and we do not knowingly collect information from
            them.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we change this policy, we will post the new version on this page with a new effective date.
          </p>
        </Section>

        <Section title="Contact us">
          <p>
            Skywash
            <br />
            Lagos, Nigeria
            <br />
            Email:{" "}
            <a className="font-semibold text-sky-700 hover:text-sky-500" href={`mailto:${CONTACT}`}>
              {CONTACT}
            </a>
          </p>
        </Section>
      </div>
    </main>
    <SiteFooter />
    </>
  );
}
