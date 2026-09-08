"use client";

import Image from "next/image";
import Link from "next/link";
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
  const { addToCart } = useStore();
  const photo = product.images[0];

  return (
    <div className="group flex flex-col gap-[13px]">
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg bg-sand">
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
          onClick={() => addToCart(product.slug, 1)}
          className="absolute right-3 bottom-3 left-3 rounded-lg bg-forest/90 p-3 text-[11px] tracking-[.18em] text-cream uppercase transition-[opacity,transform,background] duration-[400ms] ease-km hover:bg-forest active:scale-[.97] sm:translate-y-2.5 sm:opacity-0 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:focus-visible:translate-y-0 sm:focus-visible:opacity-100"
        >
          Add to bag
        </button>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/shop/${product.slug}`}
            className={`line-clamp-2 font-serif leading-[1.25] text-forest transition-colors duration-300 hover:text-brass ${
              compact ? "text-[18px]" : "text-[19px]"
            }`}
          >
            {product.name}
          </Link>
          <p className="mt-1 truncate text-[11px] tracking-[.08em] text-moss uppercase">
            {product.categoryName}
          </p>
        </div>
        <p className="shrink-0 text-sm whitespace-nowrap text-olive">
          {money(product.price)}
        </p>
      </div>
    </div>
  );
}
