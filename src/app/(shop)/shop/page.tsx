import type { Metadata } from "next";
import Link from "next/link";
import { ArrowsDownUp } from "@phosphor-icons/react/ssr";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { countAllProducts, getCategories, getProducts } from "@/lib/db/catalogue";
import { SORT_LABELS, type SortKey } from "@/lib/catalogue-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The collection",
  description:
    "Everything we make — ceramics, textiles, bedroom linens, tableware, brass and reed, in small runs.",
};

const NEXT_SORT: Record<SortKey, SortKey> = {
  featured: "low",
  low: "high",
  high: "featured",
};

type Search = { room?: string; sort?: string };

function readSort(value?: string): SortKey {
  return value === "low" || value === "high" ? value : "featured";
}

function hrefFor(room: string, sort: SortKey) {
  const params = new URLSearchParams();
  if (room !== "all") params.set("room", room);
  if (sort !== "featured") params.set("sort", sort);
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const sort = readSort(params.sort);

  const categories = await getCategories();
  const activeCategory = categories.find((c) => c.slug === params.room);
  const room = activeCategory?.slug ?? "all";

  const [list, total] = await Promise.all([
    getProducts({ categorySlug: activeCategory?.slug, sort }),
    countAllProducts(),
  ]);

  const heading = activeCategory ? activeCategory.name : "Everything we make";
  const standfirst = activeCategory
    ? activeCategory.blurb
    : "Everything is made in small runs. When a piece sells out we make it again — it takes about six weeks.";

  return (
    <div
      className="km-gutter min-h-full bg-cream-light text-forest"
      style={{
        paddingBlock: "clamp(30px,4.6cqw,64px) clamp(60px,8cqw,110px)",
      }}
    >
      <Reveal delay={0}>
        <p className="km-eyebrow mb-3.5 text-moss">The collection</p>
      </Reveal>
      <Reveal delay={60}>
        <h1 className="max-w-[18ch] font-serif text-[clamp(32px,7cqw,68px)] leading-[1.04]">
          {heading}
        </h1>
      </Reveal>
      <Reveal delay={130}>
        <p className="mt-[18px] max-w-[44ch] text-[15px] leading-[1.66] text-olive">
          {standfirst}
        </p>
      </Reveal>

      <Reveal delay={180}>
        <div
          className="flex flex-wrap items-center gap-2 border-b border-[rgba(95,106,66,.2)]"
          style={{
            marginBlock: "clamp(28px,3.6cqw,44px) clamp(20px,2.6cqw,30px)",
            paddingBottom: "clamp(20px,2.6cqw,30px)",
          }}
        >
          <Chip href={hrefFor("all", sort)} active={room === "all"}>
            All
          </Chip>
          {categories.map((category) => (
            <Chip
              key={category.slug}
              href={hrefFor(category.slug, sort)}
              active={room === category.slug}
            >
              {category.short}
            </Chip>
          ))}

          <span className="flex-[1_1_40px]" />

          <Link
            href={hrefFor(room, NEXT_SORT[sort])}
            scroll={false}
            className="flex items-center gap-2 rounded-lg border border-[rgba(95,106,66,.28)] px-3.5 py-[9px] text-[11px] tracking-[.12em] text-olive uppercase transition-[border-color,background] duration-300 hover:border-gold hover:bg-gold/10"
          >
            <ArrowsDownUp size={15} weight="light" />
            {SORT_LABELS[sort]}
          </Link>
        </div>
      </Reveal>

      <div
        className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,222px),1fr))]"
        style={{ gap: "clamp(14px,2cqw,28px)" }}
      >
        {list.map((product, i) => (
          <Reveal key={product.id} delay={Math.min(i, 5) * 60}>
            <ProductCard product={product} compact />
          </Reveal>
        ))}
      </div>

      {list.length === 0 && (
        <p className="py-20 text-center font-serif text-2xl text-moss italic">
          Nothing in this room yet
        </p>
      )}

      <p className="mt-[clamp(40px,6cqw,80px)] max-w-[52ch] text-[13px] leading-[1.7] text-moss">
        Showing {list.length} of {total} pieces. Everything is made to order in
        the atelier — nothing here is warehoused.
      </p>
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`rounded-lg border px-4 py-[9px] text-[11px] tracking-[.12em] whitespace-nowrap uppercase transition-[background,color,border-color] duration-300 ${
        active
          ? "border-gold bg-gold text-cream-light"
          : "border-[rgba(95,106,66,.26)] bg-transparent text-olive hover:border-gold hover:bg-gold/10"
      }`}
    >
      {children}
    </Link>
  );
}
