import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import Reveal from "@/components/Reveal";
import SceneArt from "@/components/SceneArt";

export const metadata: Metadata = {
  title: "The story",
  description:
    "KARMAURA pairs the Sanskrit idea of karma with the aura a home gives back: warmth, calm, belonging.",
};

const PILLARS = [
  {
    kicker: "Essence",
    body: "Good energy, good home.",
    serif: true,
  },
  {
    kicker: "Promise",
    body: "Home that feels like you.",
    serif: true,
  },
  {
    kicker: "Heritage",
    body: "An earthy, artisan feeling with a quiet Egyptian and Arabian soul — simple forms, honest materials, space to breathe.",
    serif: false,
  },
];

const STEPS = [
  {
    n: "01",
    title: "Sourced",
    body: "Clay from the Nile Delta, wool from Fayoum, reed cut and dried by hand.",
  },
  {
    n: "02",
    title: "Made",
    body: "Thrown, woven or turned in workshops of three to eight people. Nothing is moulded.",
  },
  {
    n: "03",
    title: "Finished",
    body: "Oiled, waxed, checked twice — then wrapped in kraft with the emblem embossed.",
  },
  {
    n: "04",
    title: "Mended",
    body: "Send anything back and we repair it. A chip is a history, not a fault.",
  },
];

export default function StoryPage() {
  return (
    <div className="min-h-full bg-forest">
      <section
        className="km-gutter max-w-[900px]"
        style={{
          paddingBlock: "clamp(44px,7cqw,120px) clamp(30px,4cqw,60px)",
        }}
      >
        <Reveal delay={0}>
          <p className="km-eyebrow mb-[18px] text-gold-bright">The story</p>
        </Reveal>
        <Reveal delay={70}>
          <h1 className="font-serif text-[clamp(34px,8cqw,78px)] leading-[1.04] text-cream italic">
            Karma, returned as aura
          </h1>
        </Reveal>
        <Reveal
          delay={160}
          mode="rule"
          className="km-rule w-[min(240px,54%)]"
          style={{ marginBlock: "clamp(24px,3.4cqw,40px)" }}
        />
        <Reveal delay={220}>
          <p className="max-w-[56ch] text-[clamp(16px,2cqw,20px)] leading-[1.66] text-cream/80">
            KARMAURA pairs the Sanskrit idea of karma — the energy you send out
            returns to you — with the aura a home gives back: warmth, calm,
            belonging.
          </p>
        </Reveal>
      </section>

      <section
        className="km-gutter"
        style={{ paddingBottom: "clamp(40px,6cqw,90px)" }}
      >
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] border-t border-gold/20"
          style={{
            gap: "clamp(20px,3cqw,44px)",
            paddingTop: "clamp(26px,3.4cqw,44px)",
          }}
        >
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.kicker} delay={i * 100}>
              <p className="mb-3 text-[11px] tracking-[.24em] text-gold-bright uppercase">
                {pillar.kicker}
              </p>
              {pillar.serif ? (
                <p className="font-serif text-[clamp(21px,2.6cqw,28px)] leading-[1.3] text-cream italic">
                  {pillar.body}
                </p>
              ) : (
                <p className="text-[15px] leading-[1.66] text-cream/78">
                  {pillar.body}
                </p>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative h-[clamp(280px,42vh,480px)] overflow-hidden bg-forest-deep">
        <SceneArt scene="atelier" className="size-full" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg,rgba(43,66,32,.35),rgba(43,66,32,0) 45%,rgba(43,66,32,.5))",
          }}
        />
      </section>

      <section
        className="km-gutter bg-cream text-forest"
        style={{ paddingBlock: "clamp(44px,7cqw,110px)" }}
      >
        <Reveal delay={0}>
          <h2
            className="max-w-[20ch] font-serif text-[clamp(26px,4.6cqw,48px)] leading-[1.1]"
            style={{ marginBottom: "clamp(28px,3.6cqw,48px)" }}
          >
            How a piece comes to be
          </h2>
        </Reveal>
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))]"
          style={{ gap: "clamp(22px,3cqw,44px)" }}
        >
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <p className="mb-2.5 font-serif text-[34px] text-gold">{step.n}</p>
              <p className="mb-2 text-[13px] tracking-[.14em] uppercase">
                {step.title}
              </p>
              <p className="text-sm leading-[1.66] text-olive">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        className="km-gutter bg-forest-deep"
        style={{ paddingBlock: "clamp(44px,6cqw,90px)" }}
      >
        <Reveal delay={0}>
          <div className="flex flex-wrap items-center justify-between gap-8">
            <p className="max-w-[26ch] font-serif text-[clamp(22px,3.4cqw,34px)] leading-[1.2] text-cream italic">
              Everything begins with a pair of hands.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="km-btn km-btn-dark">
                See the collection
              </Link>
              <Link href="/visit" className="km-arrow text-cream">
                Visit the atelier <ArrowRight size={16} weight="light" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
