import { createClient } from "@/lib/supabase/client";
import { imageUrl, type ArtKind, type Product } from "@/lib/catalogue-types";

/**
 * The one place a client component reaches for product data — the cart
 * drawer resolving a slug to a thumbnail, the repair form's picker. Pages
 * already get their products server-rendered as props; this is only for the
 * pieces of UI that live outside that render, in the store's local cart and
 * saved-item state.
 *
 * Fetched once when the store mounts and kept in memory for the session —
 * the catalogue is small and does not change under a shopper's feet.
 */
export async function fetchCatalogueProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, categories(slug, name), product_images(storage_path, alt, position)",
    )
    .eq("is_active", true)
    .order("position");

  if (error) {
    console.error("Could not load the catalogue:", error.message);
    return [];
  }

  type Row = {
    id: string;
    slug: string;
    name: string;
    price: number;
    blurb: string;
    material: string;
    dimensions: string;
    care: string;
    maker: string;
    lead_time: string;
    art_kind: string;
    stock: number;
    is_featured: boolean;
    categories: { slug: string; name: string } | null;
    product_images: { storage_path: string; alt: string; position: number }[] | null;
  };

  return ((data ?? []) as unknown as Row[]).map((row) => ({
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
    images: (row.product_images ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ url: imageUrl(i.storage_path), alt: i.alt })),
  }));
}
