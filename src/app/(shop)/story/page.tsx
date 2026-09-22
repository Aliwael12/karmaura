import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "The story",
  description:
    "KARMAURA pairs the Sanskrit idea of karma with the aura a home gives back: warmth, calm, belonging.",
};

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
            KARMAURA combines the idea of karma with the welcoming aura of a
            home that feels uniquely yours. The collection is designed to
            cultivate warmth, calm, and positive energy in every corner.
          </p>
        </Reveal>
      </section>

      <section
        className="km-gutter"
        style={{ paddingBottom: "clamp(44px,6cqw,90px)" }}
      >
        <Reveal delay={0}>
          <div
            className="flex flex-wrap items-center justify-between gap-8 border-t border-gold/20"
            style={{ paddingTop: "clamp(26px,3.4cqw,44px)" }}
          >
            <p className="font-serif text-[clamp(21px,2.6cqw,28px)] leading-[1.3] text-cream italic">
              Good energy, good home.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="km-btn km-btn-dark">
                See the collection
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
