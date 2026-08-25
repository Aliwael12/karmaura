// Hides the fifteen original placeholder pieces (drawn silhouettes, no real
// photography) from the storefront, and re-picks the four featured pieces
// from the newly-photographed catalogue.
//
// Soft-hide (is_active = false) rather than delete: four of the six rooms
// — ceramics, textiles, wall, storage — currently hold ONLY these fifteen
// pieces, so deleting them would leave those rooms with nothing at all and
// the change would not be a one-click undo. Deactivating is both: flip
// "Listed in the shop" back on in /admin/products, per piece or all at
// once, whenever real photography exists for those rooms too.
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

const PLACEHOLDER_SLUGS = [
  "amara", "sahel", "nour", "wadi", "layla", "sabaa", "dune", "zahra",
  "halim", "anbar", "aura", "barq", "qasab", "reed", "souk",
];

// Best fits for the home page's featured strip, chosen from the pieces that
// now have real photography — one striking option from each strong room,
// so the section reads as a spread rather than four near-duplicate mugs.
const NEW_FEATURED_SLUGS = [
  "sgraffito-lotus-mug",     // the most elaborate, most on-brand technique
  "indigo-iridescent-mug",   // the most eye-catching glaze
  "sateen-fitted-fiori-rosa", // pulls in the new Bedroom room
  "olive-ridge-mug",         // a distinct silhouette, not just another round mug
];

async function main() {
  const { data: deactivated, error: deactErr } = await db
    .from("products")
    .update({ is_active: false, is_featured: false })
    .in("slug", PLACEHOLDER_SLUGS)
    .select("slug");
  if (deactErr) throw new Error("deactivate failed: " + deactErr.message);
  console.log(`deactivated ${deactivated.length} placeholder pieces`);

  const { data: unfeatured, error: unfeatErr } = await db
    .from("products")
    .update({ is_featured: false })
    .eq("is_featured", true)
    .select("slug");
  if (unfeatErr) throw new Error("clear featured failed: " + unfeatErr.message);
  console.log(`cleared is_featured on ${unfeatured.length} remaining pieces`);

  const { data: featured, error: featErr } = await db
    .from("products")
    .update({ is_featured: true })
    .in("slug", NEW_FEATURED_SLUGS)
    .select("slug, name");
  if (featErr) throw new Error("set featured failed: " + featErr.message);
  console.log("now featured:");
  for (const p of featured) console.log("  ", p.slug, "|", p.name);

  const { count: active } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  console.log("active products remaining:", active);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
