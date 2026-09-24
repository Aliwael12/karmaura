// Swaps every bedroom and mug photo for the reshot, background-removed set
// (Bedroom/ and Coffee-Espresso Mugs/ at the project root). The mug files
// arrived numbered 1–17 rather than named, so each is matched to its product
// by eye against the photo it replaces.
//
// Per product: upload the new file, insert its image row, then remove the old
// rows and their storage objects — so a failure part-way never leaves a
// product without a photo. Percale stays retired: its source photos are
// unchanged and still show the supplier's branded box.
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PLAIN = "Bedroom/Plain Flat Sheet 100_ Egyptian Cotton";
const SATEEN = "Bedroom/Sateen Fitted Sheet Set Printed 100_ Egyptian Cotton";
const MUGS = "Coffee-Espresso Mugs";

const PHOTOS = {
  "plain-sheet-beige": `${PLAIN}/Beige (Sizes_ Double, Queen).png`,
  "plain-sheet-brown": `${PLAIN}/Brown (Sizes_ Double, Queen).png`,
  "plain-sheet-yellow-beige": `${PLAIN}/Yellow Beige (Sizes_ Double, Queen).png`,
  "sateen-fitted-candy-taft": `${SATEEN}/Candy Taft (sizes_ Double, Queen).png`,
  "sateen-fitted-fiori-rosa": `${SATEEN}/Fiori Rosa (sizes_ Double, Queen).png`,
  "sateen-fitted-giordano-bianco": `${SATEEN}/Giordano Bianco (sizes_ Double, Queen).png`,
  "sateen-fitted-moon-flower": `${SATEEN}/Moon Flower (sizes_ Double, Queen).png`,
  "dusty-rose-bubble-mug": `${MUGS}/1.png`,
  "forest-fade-mug": `${MUGS}/2.png`,
  "plum-lustre-mug": `${MUGS}/3.png`,
  "speckled-mauve-mug": `${MUGS}/4.png`,
  "indigo-iridescent-mug": `${MUGS}/5.png`,
  "speckled-umber-mug": `${MUGS}/6.png`,
  "boho-geometric-mug": `${MUGS}/7.png`,
  "scale-texture-espresso-cup": `${MUGS}/8.png`,
  "rose-bubble-ridge-mug": `${MUGS}/9.png`,
  "sgraffito-lotus-mug": `${MUGS}/10.png`,
  "sage-speckle-mug": `${MUGS}/11.png`,
  "olive-ridge-mug": `${MUGS}/12.png`,
  "blue-ombre-mug": `${MUGS}/13.png`,
  "reactive-amber-mug": `${MUGS}/14.png`,
  "copper-lustre-cup": `${MUGS}/15.png`,
  "teal-scale-mug": `${MUGS}/16.png`,
  "forest-bubble-mug": `${MUGS}/17.png`,
};

async function main() {
  const { data: products, error } = await db
    .from("products")
    .select("id, slug, name, product_images(id, storage_path)")
    .in("slug", Object.keys(PHOTOS));
  if (error) throw new Error(error.message);

  const missing = Object.keys(PHOTOS).filter((s) => !products.some((p) => p.slug === s));
  if (missing.length) throw new Error("products not found: " + missing.join(", "));

  for (const p of products) {
    const bytes = fs.readFileSync(PHOTOS[p.slug]);
    const path = `${p.id}/${Date.now()}-${p.slug}.png`;

    const { error: upErr } = await db.storage
      .from("product-images")
      .upload(path, bytes, { contentType: "image/png" });
    if (upErr) throw new Error(`upload failed for ${p.slug}: ${upErr.message}`);

    const { error: rowErr } = await db.from("product_images").insert({
      product_id: p.id,
      storage_path: path,
      alt: p.name,
      position: 0,
    });
    if (rowErr) throw new Error(`image row failed for ${p.slug}: ${rowErr.message}`);

    const old = p.product_images ?? [];
    if (old.length) {
      const { error: delErr } = await db
        .from("product_images")
        .delete()
        .in("id", old.map((i) => i.id));
      if (delErr) throw new Error(`old row delete failed for ${p.slug}: ${delErr.message}`);
      await db.storage.from("product-images").remove(old.map((i) => i.storage_path));
    }

    console.log(`  ${p.slug}: replaced ${old.length} photo(s)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
