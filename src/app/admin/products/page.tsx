import { requireAdmin } from "@/lib/db/auth";
import { createAdminSupabase } from "@/lib/supabase/server";
import { money } from "@/lib/commerce";
import { PageHead, Panel } from "../ui";
import ProductEditor from "./ProductEditor";
import type { CategoryRow, ProductImageRow, ProductRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export type AdminProduct = ProductRow & {
  product_images: Pick<ProductImageRow, "id" | "storage_path" | "alt" | "position">[] | null;
};

export default async function AdminProducts() {
  await requireAdmin();
  const db = createAdminSupabase();

  const [productsRes, categoriesRes] = await Promise.all([
    db
      .from("products")
      .select("*, product_images(id, storage_path, alt, position)")
      .order("position"),
    db.from("categories").select("*").order("position"),
  ]);

  if (productsRes.error) throw new Error(productsRes.error.message);
  if (categoriesRes.error) throw new Error(categoriesRes.error.message);

  const products = (productsRes.data ?? []) as unknown as AdminProduct[];
  const categories = (categoriesRes.data ?? []) as unknown as CategoryRow[];

  const live = products.filter((p) => p.is_active).length;
  const low = products.filter((p) => p.is_active && p.stock <= 3).length;
  const worth = products
    .filter((p) => p.is_active)
    .reduce((n, p) => n + p.price * p.stock, 0);

  return (
    <>
      <PageHead eyebrow="Products" title="Everything the shop makes">
        <p className="text-sm text-cream/50">
          {live} listed · {low} low on stock · {money(worth)} on the shelves
        </p>
      </PageHead>

      <Panel className="mb-6">
        <p className="text-[13px] leading-[1.7] text-cream/55">
          A piece with no photograph falls back to its drawn silhouette, chosen
          by <span className="text-cream/80">art kind</span>. Prices are whole
          Egyptian pounds. Stock is taken when an order is approved and returned
          if it is cancelled — so edit it here only to correct a count, not to
          fulfil an order.
        </p>
      </Panel>

      <ProductEditor products={products} categories={categories} />
    </>
  );
}
