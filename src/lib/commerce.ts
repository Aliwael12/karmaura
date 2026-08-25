import type { Product } from "@/lib/catalogue-types";

/** Everything is priced in Egyptian pounds — the atelier bills in EGP. */
const EGP = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

/** free delivery from this subtotal up — the source design's tunable prop.
    Mirrors the defaults in supabase/migrations/0003_seed.sql and
    lib/db/settings.ts; the database is the real source of truth for these
    two once /admin/settings is wired into checkout math. */
export const FREE_DELIVERY_FROM = 12_500;
export const FLAT_DELIVERY = 900;

export function money(n: number): string {
  return EGP.format(n);
}

export type CartMap = Record<string, number>;

export type CartLine = {
  slug: string;
  name: string;
  categoryName: string;
  price: number;
  qty: number;
  /** "2 × EGP 9,000" */
  qtyLabel: string;
  /** "EGP 18,000" */
  lineTotal: number;
};

/** Cart keys are product slugs — the same identifier checkout sends to the
    place_order function, so a line here and a line on the receipt always
    agree on what a piece is called. */
export function linesOf(cart: CartMap, products: Product[]): CartLine[] {
  return Object.keys(cart)
    .map((slug) => {
      const product = products.find((p) => p.slug === slug);
      if (!product) return null;
      const qty = cart[slug];
      return {
        slug,
        name: product.name,
        categoryName: product.categoryName,
        price: product.price,
        qty,
        qtyLabel: qty + " × " + money(product.price),
        lineTotal: product.price * qty,
      };
    })
    .filter((l): l is CartLine => l !== null);
}

export function subtotalOf(cart: CartMap, products: Product[]): number {
  return linesOf(cart, products).reduce((sum, l) => sum + l.lineTotal, 0);
}

export function shippingOf(subtotal: number): number {
  if (subtotal === 0 || subtotal >= FREE_DELIVERY_FROM) return 0;
  return FLAT_DELIVERY;
}

export function countOf(cart: CartMap): number {
  return Object.values(cart).reduce((sum, q) => sum + q, 0);
}

/** "Your bag is empty" · "One piece, waiting" · "4 pieces, waiting" */
export function bagHeading(count: number): string {
  if (count === 0) return "Your bag is empty";
  if (count === 1) return "One piece, waiting";
  return count + " pieces, waiting";
}

export function shippingLabel(shipping: number): string {
  return shipping === 0 ? "Complimentary" : money(shipping);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
