/**
 * The shapes the storefront renders, shared between the server-only reader
 * (lib/db/catalogue.ts) and the browser-side reader (lib/catalogue-client.ts)
 * that client components — the cart drawer, the repair form's picker — use
 * to resolve a slug to a name, price and photo without a page reload.
 *
 * Deliberately no Supabase import here: this file has to be safe to pull
 * into client bundles.
 */

export type ArtKind =
  | "vessel"
  | "bowl"
  | "carafe"
  | "planter"
  | "throw"
  | "cushion"
  | "runner"
  | "platter"
  | "cups"
  | "board"
  | "disc"
  | "mirror"
  | "basket"
  | "tray"
  | "hamper";

export type Category = {
  id: string;
  slug: string;
  name: string;
  short: string;
  blurb: string;
  art: ArtKind;
};

export type ProductImage = { url: string; alt: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  blurb: string;
  material: string;
  dim: string;
  care: string;
  maker: string;
  leadTime: string;
  art: ArtKind;
  stock: number;
  isFeatured: boolean;
  images: ProductImage[];
};

export type SortKey = "featured" | "low" | "high";

export const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  low: "Price up",
  high: "Price down",
};

/** Storage paths are stored bare; the public URL is derived at read time. */
export function imageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!base) return path;
  if (path.startsWith("http")) return path;
  return `${base}/storage/v1/object/public/product-images/${path}`;
}
