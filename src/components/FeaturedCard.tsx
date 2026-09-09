"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/ssr";
import { useStore } from "@/context/store";
import { money } from "@/lib/commerce";
import type { Product } from "@/lib/catalogue-types";
import ObjectArt from "./ObjectArt";

/**
 * The "Quietly new" rail's card — deliberately smaller and quieter than
 * ProductCard: a pill tag instead of a caption line, one circular quick-add
 * button instead of a full-width bar, name and price on a single row. This
 * is its own component rather than a ProductCard variant because ProductCard
 * is shared with /shop and "sits well with", where the denser, more
 * explicit card is the right call — this rail is a different context.
 */
export default function FeaturedCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const photo = product.images[0];

  return (
    <div className="flex w-[232px] shrink-0 snap-center flex-col gap-3">
      <div
        className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-sand"
        style={{ boxShadow: "0 24px 44px -28px rgba(0,0,0,.8)" }}
      >
        <Link
          href={`/shop/${product.slug}`}
          aria-label={product.name}
          className="relative block size-full transition-transform duration-[160ms] ease-km active:scale-[.97]"
        >
          {photo ? (
            <Image
              src={photo.url}
              alt={photo.alt || product.name}
              fill
              sizes="232px"
              className="object-cover"
            />
          ) : (
            <ObjectArt kind={product.art} tone="light" className="size-full" />
          )}
        </Link>

        <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-full bg-forest-deep/70 px-2.5 py-1.5 text-[9px] tracking-[.16em] text-cream-light uppercase backdrop-blur-sm">
          {product.categoryName}
        </span>

        <button
          type="button"
          onClick={() => addToCart(product.slug, 1)}
          aria-label={`Add ${product.name} to bag`}
          className="absolute right-2.5 bottom-2.5 grid size-9 place-items-center rounded-full bg-cream-light text-forest-deep shadow-[0_8px_18px_-8px_rgba(0,0,0,.7)] transition-transform duration-[160ms] ease-km active:scale-90"
        >
          <Plus size={16} weight="light" />
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <Link
          href={`/shop/${product.slug}`}
          className="truncate font-serif text-[18px] text-cream transition-colors duration-300 hover:text-gold-bright"
        >
          {product.name}
        </Link>
        <p className="shrink-0 text-xs text-gold-bright">{money(product.price)}</p>
      </div>
    </div>
  );
}
