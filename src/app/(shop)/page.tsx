import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import HeroArt from "@/components/HeroArt";
import ObjectArt from "@/components/ObjectArt";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import {
  getCategories,
  getCategoryCounts,
  getCategoryCoverImages,
  getFeaturedProducts,
} from "@/lib/db/catalogue";

export const dynamic = "force-dynamic";

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

  return (
    <>
      {/* ── hero ─────────────────────────────────────────────────── */}
      <section
        className="km-gutter relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,330px),1fr))] items-center overflow-hidden"
        style={{
          gap: "clamp(26px,4cqw,64px)",
          paddingBlock: "clamp(34px,5cqw,82px) clamp(44px,6cqw,96px)",
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
          <Reveal delay={90}>
            <h1 className="font-serif text-[clamp(38px,10.5cqw,86px)] leading-[1.02] tracking-[-.015em] text-cream italic">
              The warmth of simple things.
            </h1>
          </Reveal>
          <Reveal
            delay={200}
            mode="rule"
            className="km-rule w-[min(220px,50%)]"
            style={{ marginBlock: "clamp(20px,3cqw,34px)" }}
          />
          <Reveal delay={260}>
            <p className="max-w-[46ch] text-[clamp(15px,1.7cqw,18px)] leading-[1.62] text-cream/80">
              Objects for the calm home — hand-thrown clay, undyed linen, woven
              reed. Made slowly, in small runs, by people we know.
            </p>
          </Reveal>
          <Reveal delay={340}>
            <div
              className="flex flex-wrap gap-3"
              style={{ marginTop: "clamp(26px,3.4cqw,40px)" }}
            >
              <Link href="/shop" className="km-btn km-btn-dark">
                Explore the collection
              </Link>
              <Link href="/story" className="km-btn km-btn-quiet !px-[26px]">
                Read our story
              </Link>
            </div>
          </Reveal>
        </div>

        <HeroArt />
      </section>

      {/* ── three promises ───────────────────────────────────────── */}
      <section
        className="km-gutter border-y border-gold/20 bg-forest-deep"
        style={{ paddingBlock: "clamp(26px,3.4cqw,44px)" }}
      >
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))]"
          style={{ gap: "clamp(20px,3cqw,44px)" }}
        >
          {VALUES.map((value, i) => (
            <Reveal key={value.title} delay={i * 90}>
              <p className="mb-2 font-serif text-2xl text-gold-bright">
                {value.title}
              </p>
              <p className="text-sm leading-[1.6] text-cream/65">{value.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── shop by material ─────────────────────────────────────── */}
      <section
        className="km-gutter bg-cream text-forest"
        style={{ paddingBlock: "clamp(48px,7cqw,104px)" }}
      >
        <div
          className="flex flex-wrap items-end justify-between gap-6"
          style={{ marginBottom: "clamp(24px,3cqw,40px)" }}
        >
          <Reveal delay={0}>
            <p className="km-eyebrow mb-3 text-moss">Rooms and rituals</p>
            <h2 className="font-serif text-[clamp(28px,5cqw,52px)] leading-[1.08] text-forest">
              Shop by material
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <Link
              href="/shop"
              className="km-arrow border-b-[rgba(95,106,66,.3)] text-olive hover:border-b-gold"
            >
              All objects <ArrowRight size={16} weight="light" />
            </Link>
          </Reveal>
        </div>

        <div
          className="grid snap-x snap-mandatory grid-flow-col auto-cols-[minmax(212px,1fr)] overflow-x-auto pb-2"
          style={{ gap: "clamp(10px,1.4cqw,18px)" }}
        >
          {categories.map((category) => {
            const cover = covers[category.slug];
            return (
            <Reveal key={category.slug} delay={0} className="snap-start">
              <Link
                href={`/shop?room=${category.slug}`}
                className="group flex flex-col gap-3.5 text-left"
              >
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-sand">
                  {cover ? (
                    <Image
                      src={cover.url}
                      alt={cover.alt || category.name}
                      fill
                      sizes="212px"
                      className="object-cover transition-transform duration-[1.2s] ease-km group-hover:scale-[1.05]"
                    />
                  ) : (
                    <ObjectArt
                      kind={category.art}
                      tone="light"
                      className="size-full transition-transform duration-[1.2s] ease-km group-hover:scale-[1.05]"
                    />
                  )}
                </div>
                <div>
                  <p className="mb-[3px] font-serif text-[21px] text-forest transition-colors duration-300 group-hover:text-brass">
                    {category.name}
                  </p>
                  <p className="text-xs tracking-[.1em] text-moss uppercase">
                    {counts[category.slug] ?? 0} pieces
                  </p>
                </div>
              </Link>
            </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── quietly new ──────────────────────────────────────────── */}
      <section
        className="km-gutter bg-cream-light text-forest"
        style={{ paddingBlock: "clamp(48px,7cqw,104px)" }}
      >
        <Reveal delay={0}>
          <p className="km-eyebrow mb-3 text-moss">This season</p>
        </Reveal>
        <Reveal delay={60}>
          <h2
            className="font-serif text-[clamp(28px,5cqw,52px)] leading-[1.08]"
            style={{ marginBottom: "clamp(26px,3.4cqw,44px)" }}
          >
            Quietly new
          </h2>
        </Reveal>
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,232px),1fr))]"
          style={{ gap: "clamp(14px,2cqw,28px)" }}
        >
          {featured.map((product, i) => (
            <Reveal key={product.id} delay={i * 70}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── the story ────────────────────────────────────────────── */}
      <section
        className="km-gutter bg-forest"
        style={{ paddingBlock: "clamp(48px,7cqw,110px)" }}
      >
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-center"
          style={{ gap: "clamp(26px,4cqw,64px)" }}
        >
          <Reveal delay={0}>
            <div className="relative aspect-5/4 overflow-hidden rounded-lg bg-forest-deep">
              <Image
                src="/brand/kraft.png"
                alt="Kraft packaging with the embossed emblem"
                width={1200}
                height={830}
                className="size-full animate-slow object-cover opacity-95 mix-blend-lighten"
              />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="km-eyebrow mb-4 text-gold-bright">The story</p>
            <h2 className="mb-5 font-serif text-[clamp(26px,4.4cqw,46px)] leading-[1.12] text-cream">
              Karma, returned as aura
            </h2>
            <p className="mb-4 max-w-[48ch] text-[15px] leading-[1.68] text-cream/75">
              The energy you send out returns to you — and a home returns it as
              warmth, calm, belonging. We make the objects that hold that
              return: simple forms, honest materials, space to breathe.
            </p>
            <p className="mb-[26px] font-serif text-xl text-gold-bright italic">
              Essence — good energy, good home.
            </p>
            <Link href="/story" className="km-arrow text-cream">
              Read the story <ArrowRight size={16} weight="light" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── the closing line ─────────────────────────────────────── */}
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
      </section>
    </>
  );
}
