// Deactivates the three Percale Sheet Set colorways — the only bedroom
// pieces still on drawn art. Their sole source photos (Bedroom/Percale Flat
// Sheet Set Luxury Egyptian Cotton/*.png) all frame the sheets sitting in
// their retail box, and that box is printed with a third-party supplier's
// branding ("nadra COLLECTION") — not usable on the storefront. No clean,
// unbranded shot exists for these three, so they're retired rather than
// left showing a competitor's packaging.
//
// Soft-hide (is_active = false), not delete: seven other Bedroom linens
// stay active, so this doesn't empty the room, and it's a one-click undo
// in /admin/products once real photography exists.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SLUGS = ["percale-sheet-beige", "percale-sheet-brown", "percale-sheet-yellow-beige"];

async function main() {
  const { data, error } = await db
    .from("products")
    .update({ is_active: false, is_featured: false })
    .in("slug", SLUGS)
    .select("slug, name");
  if (error) throw new Error(error.message);
  console.log("deactivated:", data);

  const { count } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  console.log("active products remaining:", count);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
