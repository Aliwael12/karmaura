import { requireAdmin } from "@/lib/db/auth";
import { createAdminSupabase } from "@/lib/supabase/server";
import { PageHead, Panel } from "../ui";
import CategoryEditor from "./CategoryEditor";
import type { CategoryRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export type AdminCategory = CategoryRow & { productCount: number };

export default async function AdminCategories() {
  await requireAdmin();
  const db = createAdminSupabase();

  const { data, error } = await db.from("categories").select("*").order("position");
  if (error) throw new Error(error.message);

  const categories = (data ?? []) as unknown as CategoryRow[];

  const counts = await Promise.all(
    categories.map(async (c) => {
      const { count } = await db
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", c.id);
      return count ?? 0;
    }),
  );

  const withCounts: AdminCategory[] = categories.map((c, i) => ({
    ...c,
    productCount: counts[i],
  }));

  const { count: orphans } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .is("category_id", null);

  return (
    <>
      <PageHead eyebrow="Rooms" title="How the collection is divided">
        <p className="text-sm text-cream/50">{categories.length} rooms</p>
      </PageHead>

      <Panel className="mb-6">
        <p className="text-[13px] leading-[1.7] text-cream/55">
          Rooms are what the shop calls categories — they drive the home page
          strip, the filter chips and the breadcrumb on every piece. Removing
          one does not delete its pieces; they simply lose their room and stop
          appearing under a filter until reassigned.
          {(orphans ?? 0) > 0 && (
            <span className="mt-2 block text-gold-bright">
              {orphans} piece{orphans === 1 ? " has" : "s have"} no room right now.
            </span>
          )}
        </p>
      </Panel>

      <CategoryEditor categories={withCounts} />
    </>
  );
}
