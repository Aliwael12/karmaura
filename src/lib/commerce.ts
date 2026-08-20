import { PRODUCTS, type CategorySlug } from "./products";

/** Everything is priced in Egyptian pounds — the atelier bills in EGP. */
const EGP = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

/** free delivery from this subtotal up — the source design's tunable prop */
export const FREE_DELIVERY_FROM = 12_500;
export const FLAT_DELIVERY = 900;

export function money(n: number): string {
  return EGP.format(n);
}

export type CartMap = Record<string, number>;

export type CartLine = {
  id: string;
  name: string;
  category: CategorySlug;
  price: number;
  qty: number;
  /** "2 × EGP 9,000" */
  qtyLabel: string;
  /** "EGP 18,000" */
  lineTotal: number;
};

export function linesOf(cart: CartMap): CartLine[] {
  return Object.keys(cart)
    .map((id) => {
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return null;
      const qty = cart[id];
      return {
        id,
        name: product.name,
        category: product.category,
        price: product.price,
        qty,
        qtyLabel: qty + " × " + money(product.price),
        lineTotal: product.price * qty,
      };
    })
    .filter((l): l is CartLine => l !== null);
}

export function subtotalOf(cart: CartMap): number {
  return linesOf(cart).reduce((sum, l) => sum + l.lineTotal, 0);
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
