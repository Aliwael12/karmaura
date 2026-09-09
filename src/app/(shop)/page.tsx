import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/ssr";
import FeaturedCard from "@/components/FeaturedCard";
import HeroArt from "@/components/HeroArt";
import Marquee from "@/components/Marquee";
import ObjectArt from "@/components/ObjectArt";
import Reveal from "@/components/Reveal";
import SceneArt from "@/components/SceneArt";
import {
  getCategories,
  getCategoryCounts,
  getCategoryCoverImages,
  getFeaturedProducts,
} from "@/lib/db/catalogue";

export const dynamic = "force-dynamic";

/* the headline arrives a word at a time — each span carries its own beat */
const HEADLINE = ["The", "warmth", "of", "simple", "things."];

const VALUES = [
  {
    title: "Made by hand",
    body: "Small workshops in Cairo and the Delta. No two pieces are identical.",
  },
  {
    title: "Honest materials",
    body: "Clay, wool, linen, reed and brass — finished with oil and wax, nothing more.",
  },
  {
    title: "Made to last",
    body: "Repaired, not replaced — we mend anything we have made, for as long as we exist.",
  },
];

export default async function HomePage() {
  const [categories, counts, covers, featured] = await Promise.all([
    getCategories(),
    getCategoryCounts(),
    getCategoryCoverImages(),
    getFeaturedProducts(4),
  ]);

  const stockedCategories = categories.filter(
    (category) => (counts[category.slug] ?? 0) > 0,
  );

  return (
    <>
      {/* ── hero ─────────────────────────────────────────────────── */}
      <section
        className="km-gutter relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,330px),1fr))] items-center overflow-hidden"
        style={{
          gap: "clamp(26px,4cqw,64px)",
          paddingBlock: "clamp(34px,5cqw,82px) clamp(58px,7cqw,104px)",
          background:
            "radial-gradient(100% 80% at 6% 12%,#4b7439 0%,#3d5c2b 52%,#314e24 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute animate-aura rounded-full"
          style={{
            top: "clamp(-30px,-4cqw,0px)",
            left: "clamp(-40px,4cqw,90px)",
            width: "clamp(200px,34cqw,420px)",
            height: "clamp(200px,34cqw,420px)",
            background:
              "radial-gradient(circle,rgba(198,161,91,.22) 0%,rgba(172,157,98,0) 66%)",
          }}
        />

        <div className="relative order-1 max-w-[640px]">
          <Reveal delay={0}>
            <p className="km-eyebrow mb-[22px] text-gold-bright">
              Karmaura · Home
            </p>
          </Reveal>

          <h1 className="font-serif text-[clamp(38px,10.5cqw,86px)] leading-[1.02] tracking-[-.015em] text-cream italic">
            {HEADLINE.map((word, i) => (
              <span key={word} className="contents">
                {i > 0 && " "}
                <span className="km-word" style={{ "--i": i } as CSSProperties}>
                  {word}
                </span>
              </span>
            ))}
          </h1>

          <Reveal
            delay={380}
            mode="rule"
            className="km-rule w-[min(220px,50%)]"
            style={{ marginBlock: "clamp(20px,3cqw,34px)" }}
          />
          <Reveal delay={440}>
            <p className="max-w-[46ch] text-[clamp(15px,1.7cqw,18px)] leading-[1.62] text-cream/80">
              Objects for the calm home — hand-thrown clay, undyed linen, woven
              reed. Made slowly, in small runs, by people we know.
            </p>
          </Reveal>
          <Reveal delay={520}>
            <div
              className="flex flex-wrap items-center gap-6"
              style={{ marginTop: "clamp(18px,3.4cqw,40px)" }}
            >
              <Link href="/shop" className="km-btn km-btn-dark">
                Explore the collection
              </Link>
              <Link
                href="/story"
                className="km-arrow border-b-[rgba(239,223,195,.3)] text-cream/80 hover:border-b-gold-bright hover:text-cream"
              >
                Read our story <ArrowRight size={16} weight="light" />
              </Link>
            </div>
          </Reveal>
          {/* repeats what the body copy already said — worth the line on a
              wide screen, one scroll too many on a phone */}
          <Reveal delay={620} className="hidden sm:block">
            <p
              className="text-[11px] tracking-[.22em] text-cream/50 uppercase"
              style={{ marginTop: "clamp(22px,3cqw,32px)" }}
            >
              Small runs · Cairo &amp; the Delta · Mended for life
            </p>
          </Reveal>
        </div>

        <HeroArt />

        {/* a quiet hint that the page goes on */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[.3em] text-cream/45 uppercase">
            Scroll
          </span>
          <span className="block h-9 w-px animate-cue bg-gold-bright/70" />
        </div>
      </section>

      {/* ── what things are made of ──────────────────────────────── */}
      <Marquee tone="light" />

      {/* ── three promises ───────────────────────────────────────── */}
      <section
        className="km-gutter bg-forest"
        style={{ paddingBlock: "clamp(44px,6cqw,90px)" }}
      >
        <ol
          className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))]"
          style={{ gap: "clamp(20px,3.4cqw,52px)" }}
        >
          {VALUES.map((value, i) => (
            <Reveal
              key={value.title}
              as="li"
              delay={i * 90}
              className="border-t border-gold/25 pt-5"
            >
              <p className="mb-4 font-serif text-sm tracking-[.2em] text-gold-bright/60">
                0{i + 1}
              </p>
              <p className="mb-2 font-serif text-2xl text-gold-bright">
                {value.title}
              </p>
              <p className="text-sm leading-[1.6] text-cream/65">{value.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ── quietly new ──────────────────────────────────────────── */}
      <section
        className="overflow-hidden bg-forest-deep"
        style={{ paddingBlock: "clamp(44px,6.4cqw,88px)" }}
      >
        <div
          className="km-gutter flex flex-wrap items-end justify-between gap-6"
          style={{ marginBottom: "clamp(22px,3cqw,36px)" }}
        >
          <Reveal delay={0}>
            <p className="km-eyebrow mb-3 text-gold-bright">This season</p>
            <h2 className="font-serif text-[clamp(27px,4.8cqw,48px)] leading-[1.08] text-cream">
              Quietly new
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <Link
              href="/shop"
              className="km-arrow border-b-[rgba(239,223,195,.3)] text-cream/80 hover:border-b-gold-bright hover:text-cream"
            >
              All objects <ArrowRight size={16} weight="light" />
            </Link>
          </Reveal>
        </div>
        <div
          className="km-gutter flex snap-x snap-mandatory overflow-x-auto pb-2"
          style={{ gap: "clamp(12px,1.8cqw,22px)" }}
        >
          {featured.map((product, i) => (
            <Reveal key={product.id} delay={i * 70} className="shrink-0">
              <FeaturedCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── the story ────────────────────────────────────────────── */}
      <section
        className="km-gutter bg-cream text-forest"
        style={{ paddingBlock: "clamp(48px,7cqw,100px)" }}
      >
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-center"
          style={{ gap: "clamp(26px,4cqw,64px)" }}
        >
          <Reveal delay={0} className="order-1 sm:order-2">
            <p className="km-eyebrow mb-4 text-moss">The making</p>
            <h2 className="mb-5 font-serif text-[clamp(27px,4.6cqw,46px)] leading-[1.12]">
              Clay, linen, reed,
              <br />
              <em>and time.</em>
            </h2>
            <p className="mb-[26px] max-w-[42ch] text-[15px] leading-[1.68] text-olive">
              Every piece leaves a small workshop with a name attached to it.
              We keep the runs short so the hand stays visible in the work.
            </p>
            <Link href="/story" className="km-arrow text-forest">
              Read the story <ArrowRight size={16} weight="light" />
            </Link>
          </Reveal>
          <Reveal delay={120} className="order-2 sm:order-1">
            {/* no real workshop photograph exists yet — the drawn interior,
                not a fabricated one */}
            <div className="relative aspect-16/11 overflow-hidden rounded-2xl bg-forest-deep">
              <div className="km-view-parallax absolute inset-[-8%]">
                <SceneArt scene="interior" className="size-full" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── shop by material ─────────────────────────────────────── */}
      <section
        className="km-gutter bg-cream-light text-forest"
        style={{ paddingBlock: "clamp(48px,7cqw,100px)" }}
      >
        <Reveal delay={0}>
          <p className="km-eyebrow mb-4 text-moss">Rooms and rituals</p>
        </Reveal>
        <Reveal delay={60}>
          <h2
            className="font-serif text-[clamp(27px,4.8cqw,48px)] leading-[1.08]"
            style={{ marginBottom: "clamp(22px,3cqw,34px)" }}
          >
            Shop by material
          </h2>
        </Reveal>
        <div className="flex flex-col gap-2.5">
          {stockedCategories.map((category, i) => {
            const cover = covers[category.slug];
            return (
              <Reveal key={category.slug} delay={i * 70}>
                <Link
                  href={`/shop?room=${category.slug}`}
                  className="group flex items-center gap-3.5 rounded-2xl border border-[rgba(43,66,32,.1)] bg-white p-3 transition-transform duration-[400ms] ease-km hover:translate-x-1 active:scale-[.99]"
                >
                  <span className="relative size-[54px] shrink-0 overflow-hidden rounded-xl bg-sand">
                    {cover ? (
                      <Image
                        src={cover.url}
                        alt={cover.alt || category.name}
                        fill
                        sizes="54px"
                        className="object-cover"
                      />
                    ) : (
                      <ObjectArt
                        kind={category.art}
                        tone="light"
                        className="size-full"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-[19px] text-forest">
                      {category.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] tracking-[.1em] text-moss uppercase">
                      {counts[category.slug] ?? 0} pieces
                    </span>
                  </span>
                  <ArrowUpRight
                    size={17}
                    weight="light"
                    className="shrink-0 text-gold"
                  />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── a quiet word ─────────────────────────────────────────── */}
      <section
        className="km-gutter relative overflow-hidden bg-forest-deep"
        style={{ paddingBlock: "clamp(48px,7cqw,88px)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-14 size-[220px] rounded-full"
          style={{
            background:
              "radial-gradient(circle,rgba(198,161,91,.22),rgba(198,161,91,0) 70%)",
          }}
        />
        <Reveal delay={0}>
          <p className="max-w-[24ch] font-serif text-[clamp(22px,3.6cqw,30px)] leading-[1.35] text-cream italic">
            &ldquo;Nothing here is too precious to use. That was the whole
            point.&rdquo;
          </p>
        </Reveal>
      </section>

      {/* ── the closing line, and the way in ─────────────────────── */}
      <section
        className="km-gutter overflow-hidden bg-sand text-center text-forest"
        style={{ paddingBlock: "clamp(52px,8cqw,120px)" }}
      >
        <Reveal delay={0}>
          <Image
            src="/brand/emblem.png"
            alt=""
            width={340}
            height={380}
            className="mx-auto mb-[26px] h-14 w-auto opacity-90"
          />
        </Reveal>
        <Reveal delay={90}>
          <p className="mx-auto max-w-[22ch] font-serif text-[clamp(26px,5.4cqw,54px)] leading-[1.16] italic">
            Home, without the noise.
          </p>
        </Reveal>
        <Reveal
          delay={200}
          mode="rule"
          className="mx-auto h-px w-[min(200px,60%)]"
          style={{
            marginTop: "clamp(26px,3.6cqw,42px)",
            background:
              "linear-gradient(90deg,rgba(172,157,98,0),#6B5F33,rgba(172,157,98,0))",
          }}
        />
        <Reveal delay={300}>
          <Link
            href="/shop"
            className="km-btn km-btn-light"
            style={{ marginTop: "clamp(26px,3.6cqw,40px)" }}
          >
            Explore the collection
          </Link>
        </Reveal>
      </section>
    </>
  );
}
