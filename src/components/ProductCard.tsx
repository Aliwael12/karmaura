"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "@phosphor-icons/react/ssr";
import { useStore } from "@/context/store";
import { money } from "@/lib/commerce";
import type { Product } from "@/lib/catalogue-types";
import ObjectArt from "./ObjectArt";

type Props = {
  product: Product;
  /** the collection grid runs a touch smaller than the home page's */
  compact?: boolean;
};

export default function ProductCard({ product, compact = false }: Props) {
  const { addToCart, toggleSaved, isSaved, hydrated } = useStore();
  const saved = hydrated && isSaved(product.slug);
  const photo = product.images[0];

  return (
    <div className="group flex flex-col gap-[13px]">
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg bg-sand">
        <Link
          href={`/shop/${product.slug}`}
          aria-label={product.name}
          className="relative block size-full"
        >
          {photo ? (
            <Image
              src={photo.url}
              alt={photo.alt || product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-[1.2s] ease-km group-hover:scale-[1.04]"
            />
          ) : (
            <ObjectArt
              kind={product.art}
              tone="light"
              className="size-full transition-transform duration-[1.2s] ease-km group-hover:scale-[1.04]"
            />
          )}
        </Link>

        <button
          type="button"
          onClick={() => toggleSaved(product.slug)}
          aria-label={saved ? `Unsave ${product.name}` : `Save ${product.name}`}
          aria-pressed={saved}
          className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-cream-light/85 text-forest opacity-0 transition-[opacity,background,color] duration-300 group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-forest hover:text-cream focus-visible:opacity-100 aria-pressed:opacity-100"
        >
          <Heart size={17} weight={saved ? "fill" : "light"} />
        </button>

        <button
          type="button"
          onClick={() => addToCart(product.slug, 1)}
          className="absolute right-3 bottom-3 left-3 translate-y-2.5 rounded-lg bg-forest/90 p-3 text-[11px] tracking-[.18em] text-cream uppercase opacity-0 transition-[opacity,transform,background] duration-[400ms] ease-km group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-forest focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          Add to bag
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div>
          <Link
            href={`/shop/${product.slug}`}
            className={`font-serif leading-[1.25] text-forest transition-colors duration-300 hover:text-brass ${
              compact ? "text-[18px]" : "text-[19px]"
            }`}
          >
            {product.name}
          </Link>
          <p className="mt-1 text-[11px] tracking-[.08em] text-moss uppercase">
            {product.categoryName}
          </p>
        </div>
        <p className="text-sm whitespace-nowrap text-olive">
          {money(product.price)}
        </p>
      </div>
    </div>
  );
}
