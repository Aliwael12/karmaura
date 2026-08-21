import type { Metadata } from "next";
import { MapPin, Clock, Phone } from "@phosphor-icons/react/ssr";
import ContactForm from "@/components/ContactForm";
import RepairForm from "@/components/RepairForm";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Visit & contact",
  description:
    "The atelier in Zamalek, the shops that carry us, and how to reach the people who make the work.",
};

const STOCKISTS = [
  {
    city: "Cairo",
    shops: [
      { name: "Nomad Home", where: "Zamalek — 12 Sharia Taha Hussein" },
      { name: "Beit el Sennari", where: "Sayyida Zeinab — inside the courtyard" },
    ],
  },
  {
    city: "Alexandria",
    shops: [{ name: "Souk el Bahr", where: "Stanley — 40 Sharia el Geish" }],
  },
  {
    city: "Beirut",
    shops: [{ name: "Maison Rahal", where: "Mar Mikhael — 8 Rue d'Arménie" }],
  },
  {
    city: "London",
    shops: [{ name: "Quiet Goods", where: "Hackney — 214 Well Street" }],
  },
];

export default function VisitPage() {
  return (
    <div className="min-h-full bg-cream text-forest">
      <section
        className="km-gutter max-w-[820px]"
        style={{
          paddingBlock: "clamp(40px,6cqw,100px) clamp(26px,3.4cqw,48px)",
        }}
      >
        <Reveal delay={0}>
          <p className="km-eyebrow mb-4 text-moss">Visit &amp; contact</p>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="font-serif text-[clamp(32px,7cqw,68px)] leading-[1.04]">
            Where to find us
          </h1>
        </Reveal>
      </section>

      <section
        className="km-gutter"
        style={{ paddingBottom: "clamp(50px,7cqw,100px)" }}
      >
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start"
          style={{ gap: "clamp(26px,4cqw,60px)" }}
        >
          <Reveal delay={0} className="flex flex-col gap-5">
            <div className="rounded-lg border border-[rgba(95,106,66,.2)] bg-cream-light p-[22px]">
              <p className="mb-2.5 text-[11px] tracking-[.2em] text-moss uppercase">
                The atelier
              </p>
              <ul className="flex flex-col gap-3 text-[15px] leading-[1.66] text-olive">
                <li className="flex gap-3">
                  <MapPin size={19} weight="light" className="mt-0.5 shrink-0 text-gold" />
                  14 Sharia Bahgat Ali, Zamalek, Cairo
                </li>
                <li className="flex gap-3">
                  <Clock size={19} weight="light" className="mt-0.5 shrink-0 text-gold" />
                  Thursday to Saturday, 11 — 7. By appointment otherwise.
                </li>
                <li className="flex gap-3">
                  <Phone size={19} weight="light" className="mt-0.5 shrink-0 text-gold" />
                  +20 2 2735 1180 · hello@karmaura.example
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-[rgba(95,106,66,.2)] bg-cream-light p-[22px]">
              <p className="mb-4 text-[11px] tracking-[.2em] text-moss uppercase">
                Shops that carry us
              </p>
              <div className="flex flex-col gap-5">
                {STOCKISTS.map((place) => (
                  <div key={place.city}>
                    <p className="mb-2 font-serif text-lg text-forest">
                      {place.city}
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {place.shops.map((shop) => (
                        <li
                          key={shop.name}
                          className="flex flex-wrap items-baseline gap-x-2 text-sm text-olive"
                        >
                          <span className="text-forest">{shop.name}</span>
                          <span className="text-moss">— {shop.where}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <section
        id="repairs"
        className="km-gutter scroll-mt-24 bg-forest"
        style={{ paddingBlock: "clamp(44px,6cqw,100px)" }}
      >
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start"
          style={{ gap: "clamp(26px,4cqw,60px)" }}
        >
          <Reveal delay={0}>
            <p className="km-eyebrow mb-4 text-gold-bright">Repairs</p>
            <h2 className="mb-5 font-serif text-[clamp(26px,4.4cqw,44px)] leading-[1.1] text-cream">
              A chip is a history, not a fault
            </h2>
            <p className="mb-4 max-w-[46ch] text-[15px] leading-[1.68] text-cream/75">
              We mend anything we have made, for as long as we exist. Send it
              back and we will re-throw a lid, re-knot a fringe, re-oil a frame
              or fill a chip with brass — whichever the piece asks for.
            </p>
            <p className="max-w-[46ch] text-[15px] leading-[1.68] text-cream/75">
              Repairs are free in the first two years and charged at cost after
              that. Postage to the atelier is yours; the journey home is ours.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <RepairForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
