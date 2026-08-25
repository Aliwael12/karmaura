import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";
import {
  imageUrl,
  type ArtKind,
  type Category,
  type Product,
  type SortKey,
} from "@/lib/catalogue-types";
import type { CategoryRow, ProductImageRow, ProductRow } from "@/lib/supabase/types";

export type { ArtKind, Category, Product, ProductImage, SortKey } from "@/lib/catalogue-types";
export { SORT_LABELS, imageUrl } from "@/lib/catalogue-types";

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    short: row.short_name,
    blurb: row.blurb,
    art: row.art_kind as ArtKind,
  };
}

type JoinedProduct = ProductRow & {
  categories: Pick<CategoryRow, "slug" | "name"> | null;
  product_images: Pick<ProductImageRow, "storage_path" | "alt" | "position">[] | null;
};

function toProduct(row: JoinedProduct): Product {
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((i) => ({ url: imageUrl(i.storage_path), alt: i.alt }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.categories?.slug ?? "",
    categoryName: row.categories?.name ?? "",
    price: row.price,
    blurb: row.blurb,
    material: row.material,
    dim: row.dimensions,
    care: row.care,
    maker: row.maker,
    leadTime: row.lead_time,
    art: row.art_kind as ArtKind,
    stock: row.stock,
    isFeatured: row.is_featured,
    images,
  };
}

const PRODUCT_SELECT =
  "*, categories(slug, name), product_images(storage_path, alt, position)";

/* ── reads ─────────────────────────────────────────────────────────────
   Every one of these throws on a database error rather than returning an
   empty list. A shop that renders "0 pieces" because the connection is down
   is worse than one that shows an error boundary. */

export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("position");

  if (error) throw new Error(`Could not load the rooms: ${error.message}`);
  return (data ?? []).map(toCategory);
}

/** How many active pieces sit in each room, keyed by category slug. */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("categories(slug)")
    .eq("is_active", true);

  if (error) throw new Error(`Could not count the rooms: ${error.message}`);

  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as unknown as { categories: { slug: string } | null }[]) {
    const slug = row.categories?.slug;
    if (!slug) continue;
    counts[slug] = (counts[slug] ?? 0) + 1;
  }
  return counts;
}

/** One representative photo per room, for the "Shop by material" tiles —
    the earliest-position product in that room that actually has a photo,
    so a room with real photography leads with it instead of the drawn
    silhouette every room falls back to otherwise. */
export async function getCategoryCoverImages(): Promise<
  Record<string, { url: string; alt: string }>
> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("categories(slug), product_images(storage_path, alt, position)")
    .eq("is_active", true)
    .order("position");

  if (error) throw new Error(`Could not load room photos: ${error.message}`);

  const covers: Record<string, { url: string; alt: string }> = {};
  for (const row of (data ?? []) as unknown as {
    categories: { slug: string } | null;
    product_images: Pick<ProductImageRow, "storage_path" | "alt" | "position">[] | null;
  }[]) {
    const slug = row.categories?.slug;
    if (!slug || covers[slug]) continue;
    const images = (row.product_images ?? []).slice().sort((a, b) => a.position - b.position);
    if (images[0]) covers[slug] = { url: imageUrl(images[0].storage_path), alt: images[0].alt };
  }
  return covers;
}

export async function countAllProducts(): Promise<number> {
  const supabase = await createServerSupabase();
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) throw new Error(`Could not count the collection: ${error.message}`);
  return count ?? 0;
}

export async function getProducts(options?: {
  categorySlug?: string;
  sort?: SortKey;
}): Promise<Product[]> {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true);

  if (options?.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .maybeSingle();
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }

  const sort = options?.sort ?? "featured";
  query =
    sort === "low"
      ? query.order("price", { ascending: true })
      : sort === "high"
        ? query.order("price", { ascending: false })
        : query.order("position", { ascending: true });

  const { data, error } = await query;
  if (error) throw new Error(`Could not load the collection: ${error.message}`);
  return (data as unknown as JoinedProduct[]).map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Could not load ${slug}: ${error.message}`);
  return data ? toProduct(data as unknown as JoinedProduct) : null;
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("position")
    .limit(limit);

  if (error) throw new Error(`Could not load this season: ${error.message}`);
  return (data as unknown as JoinedProduct[]).map(toProduct);
}

/** Same room first, then everything else — always three. */
export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .neq("id", product.id)
    .order("position")
    .limit(24);

  if (error) throw new Error(`Could not load related pieces: ${error.message}`);
  const all = (data as unknown as JoinedProduct[]).map(toProduct);
  const sameRoom = all.filter((p) => p.categorySlug === product.categorySlug);
  const rest = all.filter((p) => p.categorySlug !== product.categorySlug);
  return [...sameRoom, ...rest].slice(0, 3);
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("slug", slugs);

  if (error) throw new Error(`Could not load those pieces: ${error.message}`);
  return (data as unknown as JoinedProduct[]).map(toProduct);
}

export async function countProductsIn(categorySlug: string): Promise<number> {
  const supabase = await createServerSupabase();
  const { data: cat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();
  if (!cat) return 0;

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", cat.id)
    .eq("is_active", true);

  return count ?? 0;
}
