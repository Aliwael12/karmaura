// Applies supabase/migrations/0005_seed_bedroom_and_mugs.sql through the JS
// client rather than psql — this machine has neither a local psql binary nor
// a running Docker daemon right now. The data here is kept in lockstep with
// that SQL file; if you can run `supabase db push` instead, do that and skip
// this script.
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

const CATEGORY = {
  slug: "bedroom",
  name: "Bedroom linens",
  short_name: "Bedroom",
  blurb:
    "Egyptian cotton, woven in the Delta and cut for the bed that holds the whole day's exhale.",
  art_kind: "throw",
  position: 5,
};

const MAKER = "The Mahalla weavers, Gharbia";
const BED_DIM_PERCALE =
  "Available in Single XL and Twin — flat sheet with a matching pillowcase.";
const BED_DIM_PLAIN =
  "Available in Double and Queen — flat sheet with a matching pillowcase.";
const BED_DIM_SATEEN =
  "Available in Double and Queen — fitted sheet, deep elastic pocket.";
const BED_CARE_PLAIN = "Machine wash cool, tumble dry low. Iron warm for a crisp line.";
const BED_CARE_SATEEN =
  "Machine wash cool on a gentle cycle to protect the print. Tumble dry low.";

const BEDROOM_PRODUCTS = [
  {
    slug: "percale-sheet-beige",
    name: "Percale Sheet Set — Beige",
    price: 5400,
    blurb:
      "A crisp percale flat sheet in warm beige, woven light enough to stay cool through the night.",
    material: "100% Egyptian cotton, percale weave — light, crisp, cool to the touch.",
    dimensions: BED_DIM_PERCALE,
    care: BED_CARE_PLAIN,
    lead_time: "Dispatched within 5 working days",
    stock: 8,
    position: 15,
    photo: null,
  },
  {
    slug: "percale-sheet-brown",
    name: "Percale Sheet Set — Brown",
    price: 5400,
    blurb:
      "The same crisp percale in a deeper toffee brown — light enough to stay cool, substantial enough to last.",
    material: "100% Egyptian cotton, percale weave — light, crisp, cool to the touch.",
    dimensions: BED_DIM_PERCALE,
    care: BED_CARE_PLAIN,
    lead_time: "Dispatched within 5 working days",
    stock: 5,
    position: 16,
    photo: null,
  },
  {
    slug: "percale-sheet-yellow-beige",
    name: "Percale Sheet Set — Yellow Beige",
    price: 5400,
    blurb:
      "A soft, sun-warmed yellow beige percale, woven light enough to stay cool through the night.",
    material: "100% Egyptian cotton, percale weave — light, crisp, cool to the touch.",
    dimensions: BED_DIM_PERCALE,
    care: BED_CARE_PLAIN,
    lead_time: "Dispatched within 5 working days",
    stock: 7,
    position: 17,
    photo: null,
  },
  {
    slug: "plain-sheet-beige",
    name: "Plain Flat Sheet — Beige",
    price: 3600,
    blurb:
      "A plain-weave flat sheet in quiet beige — no pattern, no shine, just soft, honest cotton.",
    material: "100% Egyptian cotton, plain weave — soft, matte, no shine.",
    dimensions: BED_DIM_PLAIN,
    care: BED_CARE_PLAIN,
    lead_time: "Dispatched within 5 working days",
    stock: 12,
    position: 18,
    photo: "Bedroom/Plain Flat Sheet 100_ Egyptian Cotton/Beige (Sizes_ Double, Queen).png",
  },
  {
    slug: "plain-sheet-brown",
    name: "Plain Flat Sheet — Brown",
    price: 3600,
    blurb:
      "The same plain weave, warmed to a soft cocoa brown — matte, soft, entirely unfussy.",
    material: "100% Egyptian cotton, plain weave — soft, matte, no shine.",
    dimensions: BED_DIM_PLAIN,
    care: BED_CARE_PLAIN,
    lead_time: "Dispatched within 5 working days",
    stock: 9,
    position: 19,
    photo: "Bedroom/Plain Flat Sheet 100_ Egyptian Cotton/Brown (Sizes_ Double, Queen).png",
  },
  {
    slug: "plain-sheet-yellow-beige",
    name: "Plain Flat Sheet — Yellow Beige",
    price: 3600,
    blurb: "A plain-weave sheet in pale sand yellow — soft, matte, the colour of early light.",
    material: "100% Egyptian cotton, plain weave — soft, matte, no shine.",
    dimensions: BED_DIM_PLAIN,
    care: BED_CARE_PLAIN,
    lead_time: "Dispatched within 5 working days",
    stock: 10,
    position: 20,
    photo: "Bedroom/Plain Flat Sheet 100_ Egyptian Cotton/Yellow Beige (Sizes_ Double, Queen).png",
  },
  {
    slug: "sateen-fitted-candy-taft",
    name: "Sateen Fitted Sheet — Candy Taft",
    price: 4200,
    blurb:
      "A sateen fitted sheet in warm cream, its surface printed with a faint tone-on-tone pattern that only shows in raking light.",
    material: "100% Egyptian cotton sateen, printed pattern — a soft lustre from a four-thread weave.",
    dimensions: BED_DIM_SATEEN,
    care: BED_CARE_SATEEN,
    lead_time: "Made to order — 10 days",
    stock: 6,
    position: 21,
    photo:
      "Bedroom/Sateen Fitted Sheet Set Printed 100_ Egyptian Cotton/Candy Taft (sizes_ Double, Queen).png",
  },
  {
    slug: "sateen-fitted-fiori-rosa",
    name: "Sateen Fitted Sheet — Fiori Rosa",
    price: 4200,
    blurb:
      "A sateen fitted sheet scattered with soft pink florals on white — fiori rosa, pink flowers, printed in a watercolour hand.",
    material: "100% Egyptian cotton sateen, printed pattern — a soft lustre from a four-thread weave.",
    dimensions: BED_DIM_SATEEN,
    care: BED_CARE_SATEEN,
    lead_time: "Made to order — 10 days",
    stock: 8,
    position: 22,
    photo:
      "Bedroom/Sateen Fitted Sheet Set Printed 100_ Egyptian Cotton/Fiori Rosa (sizes_ Double, Queen).png",
  },
  {
    slug: "sateen-fitted-giordano-bianco",
    name: "Sateen Fitted Sheet — Giordano Bianco",
    price: 4200,
    blurb:
      "A sateen fitted sheet in soft grey-white, its pattern a quiet damask that reads as texture more than print.",
    material: "100% Egyptian cotton sateen, printed pattern — a soft lustre from a four-thread weave.",
    dimensions: BED_DIM_SATEEN,
    care: BED_CARE_SATEEN,
    lead_time: "Made to order — 10 days",
    stock: 7,
    position: 23,
    photo:
      "Bedroom/Sateen Fitted Sheet Set Printed 100_ Egyptian Cotton/Giordano Bianco (sizes_ Double, Queen).png",
  },
  {
    slug: "sateen-fitted-moon-flower",
    name: "Sateen Fitted Sheet — Moon Flower",
    price: 4200,
    blurb:
      "A sateen fitted sheet in pale beige, printed with a hushed floral that fades in and out like moonlight.",
    material: "100% Egyptian cotton sateen, printed pattern — a soft lustre from a four-thread weave.",
    dimensions: BED_DIM_SATEEN,
    care: BED_CARE_SATEEN,
    lead_time: "Made to order — 10 days",
    stock: 5,
    position: 24,
    photo:
      "Bedroom/Sateen Fitted Sheet Set Printed 100_ Egyptian Cotton/Moon Flower (sizes_ Double, Queen).png",
  },
];

const MUG_MAKER = "Hoda & Sameh, Fustat";
const MUGS_DIR = "Coffee-Espresso Mugs";

const MUG_PRODUCTS = [
  {
    slug: "boho-geometric-mug",
    name: "Boho Geometric Mug",
    price: 950,
    blurb: "A teal chevron pattern carved through a dark glaze, so the brown clay body shows in every line.",
    material: "Stoneware, carved glaze, dark interior.",
    dimensions: "H 9 cm · Ø 8.5 cm · 330 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 10,
    position: 25,
    photo: `${MUGS_DIR}/Boho Ceramic Coffee Mug _ Teal Blue Geometric Pattern.png`,
  },
  {
    slug: "reactive-amber-mug",
    name: "Reactive Amber Mug",
    price: 850,
    blurb: "A warm amber glaze that breaks paler toward the foot, no two firings quite the same.",
    material: "Stoneware, reactive amber glaze.",
    dimensions: "H 9 cm · Ø 8.5 cm · 340 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 14,
    position: 26,
    photo: `${MUGS_DIR}/Ceramic Coffee Mug _ Brown Reactive Glaze.png`,
  },
  {
    slug: "copper-lustre-cup",
    name: "Copper Lustre Cup",
    price: 820,
    blurb: "A handleless cup left in plum stoneware below, an oil-slick band of copper lustre at the rim.",
    material: "Stoneware, lustre glaze band, unglazed terracotta foot.",
    dimensions: "H 8 cm · Ø 8 cm · 220 ml",
    care: "Hand wash, to protect the lustre.",
    lead_time: "Made to order — 2 weeks",
    stock: 6,
    position: 27,
    photo: `${MUGS_DIR}/Copy of 16.png`,
  },
  {
    slug: "forest-fade-mug",
    name: "Forest Fade Mug",
    price: 900,
    blurb: "Speckled sage at the rim, deepening to forest green at the foot — a full-handled mug for a proper cup.",
    material: "Stoneware, speckled glaze, colour-graded.",
    dimensions: "H 10 cm · Ø 8.5 cm · 350 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 9,
    position: 28,
    photo: `${MUGS_DIR}/Copy of 9.png`,
  },
  {
    slug: "blue-ombre-mug",
    name: "Blue Ombre Mug",
    price: 950,
    blurb: "A reactive glaze that runs from deep indigo at the rim to sea-foam at the foot, textured like breaking water.",
    material: "Stoneware, reactive ombre glaze.",
    dimensions: "H 9.5 cm · Ø 8.5 cm · 340 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 8,
    position: 29,
    photo: `${MUGS_DIR}/Handcrafted Blue Ombre Reactive Glaze Stoneware Mug.png`,
  },
  {
    slug: "speckled-umber-mug",
    name: "Speckled Umber Mug",
    price: 850,
    blurb: "An olive-umber glaze flecked dark throughout, the kind of mug that hides a tea stain on purpose.",
    material: "Stoneware, speckled glaze.",
    dimensions: "H 9 cm · Ø 8.5 cm · 330 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 15,
    position: 30,
    photo: `${MUGS_DIR}/Handcrafted Brown Speckled Stoneware Mug.png`,
  },
  {
    slug: "forest-bubble-mug",
    name: "Forest Bubble Mug",
    price: 980,
    blurb: "A deep forest glaze pooled thick over a double-bellied form, glossy enough to catch the window.",
    material: "Stoneware, glossy forest glaze.",
    dimensions: "H 9 cm · Ø 9 cm · 350 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 7,
    position: 31,
    photo: `${MUGS_DIR}/Handcrafted Forest Green Bubble Ceramic Mug.png`,
  },
  {
    slug: "plum-lustre-mug",
    name: "Plum Lustre Mug",
    price: 1100,
    blurb: "Rows of hand-carved scale, glazed plum and lustre at the rim, sand-toned stoneware showing through below.",
    material: "Stoneware, carved texture, lustre glaze.",
    dimensions: "H 8.5 cm · Ø 9 cm · 320 ml",
    care: "Hand wash, to protect the lustre.",
    lead_time: "Made to order — 2 weeks",
    stock: 5,
    position: 32,
    photo: `${MUGS_DIR}/Handcrafted Iridescent Luster Stoneware Mug.png`,
  },
  {
    slug: "scale-texture-espresso-cup",
    name: "Scale Texture Espresso Cup",
    price: 800,
    blurb: "A small cup for a short coffee, its surface carved in overlapping scale and glazed a quiet teal-grey.",
    material: "Stoneware, carved texture, matte glaze.",
    dimensions: "H 7 cm · Ø 7.5 cm · 180 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 9,
    position: 33,
    photo: `${MUGS_DIR}/Handcrafted Iridescent Stoneware Espresso Mug _ Scale Texture.png`,
  },
  {
    slug: "sgraffito-lotus-mug",
    name: "Sgraffito Lotus Mug",
    price: 1200,
    blurb: "Lotus and papyrus, carved by hand through a deep blue glaze in the sgraffito technique — an old form, redrawn.",
    material: "Stoneware, hand-carved sgraffito, cobalt glaze.",
    dimensions: "H 10 cm · Ø 9 cm · 360 ml",
    care: "Hand wash, to protect the carved detail.",
    lead_time: "Made to order — 2 weeks",
    stock: 4,
    position: 34,
    photo: `${MUGS_DIR}/Handcrafted Sgraffito Ceramic Mug.png`,
  },
  {
    slug: "teal-scale-mug",
    name: "Teal Scale Mug",
    price: 950,
    blurb: "Carved scale under a speckled teal glaze, the copper foot left bare where the hand last held it.",
    material: "Stoneware, carved texture, speckled glaze.",
    dimensions: "H 9.5 cm · Ø 8.5 cm · 340 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 8,
    position: 35,
    photo: `${MUGS_DIR}/Handcrafted Teal Speckled Stoneware Mug _ Scale Texture.png`,
  },
  {
    slug: "indigo-iridescent-mug",
    name: "Indigo Iridescent Mug",
    price: 1100,
    blurb: "An iridescent glaze that shifts from indigo to rose gold as the light moves across it.",
    material: "Stoneware, iridescent glaze.",
    dimensions: "H 9 cm · Ø 8.5 cm · 330 ml",
    care: "Hand wash, to protect the iridescent finish.",
    lead_time: "Made to order — 2 weeks",
    stock: 5,
    position: 36,
    photo: `${MUGS_DIR}/Handmade Blue Iridescent Stoneware Mug.png`,
  },
  {
    slug: "olive-ridge-mug",
    name: "Olive Ridge Mug",
    price: 1000,
    blurb: "Thrown in two stacked bulges, olive speckle giving way to cream — a mug with a waistline.",
    material: "Stoneware, speckled two-tone glaze.",
    dimensions: "H 9.5 cm · Ø 9 cm · 350 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 7,
    position: 37,
    photo: `${MUGS_DIR}/Handmade Green & Cream Glaze Speckled Stoneware Mug_.png`,
  },
  {
    slug: "dusty-rose-bubble-mug",
    name: "Dusty Rose Bubble Mug",
    price: 980,
    blurb: "A dusty rose glaze fading to plum at the foot, thrown with the same double-bellied bubble form.",
    material: "Stoneware, ombre glaze.",
    dimensions: "H 9 cm · Ø 9 cm · 350 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 9,
    position: 38,
    photo: `${MUGS_DIR}/Handmade Pink Bubble Glazed Stoneware Mug.png`,
  },
  {
    slug: "sage-speckle-mug",
    name: "Sage Speckle Mug",
    price: 850,
    blurb: "Sage green, speckled dark throughout, in a simple rounded form that sits well in the hand.",
    material: "Stoneware, speckled glaze.",
    dimensions: "H 9 cm · Ø 8.5 cm · 330 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 12,
    position: 39,
    photo: `${MUGS_DIR}/Speckled Green Glazed Stoneware Mug.png`,
  },
  {
    slug: "speckled-mauve-mug",
    name: "Speckled Mauve Mug",
    price: 900,
    blurb: "A mauve-pink glaze, speckled dark, deepening to a plum foot — quiet enough for every day.",
    material: "Stoneware, speckled glaze.",
    dimensions: "H 9 cm · Ø 8.5 cm · 340 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 10,
    position: 40,
    photo: `${MUGS_DIR}/Speckled Pink & Purple Glazed Stoneware Mug.png`,
  },
  {
    slug: "rose-bubble-ridge-mug",
    name: "Rose Bubble Ridge Mug",
    price: 980,
    blurb: "Bright rose, speckled white, thrown in the same stacked ridges as the Olive Ridge — a warmer twin.",
    material: "Stoneware, speckled glaze, ridged form.",
    dimensions: "H 9.5 cm · Ø 9 cm · 350 ml",
    care: "Dishwasher and microwave safe.",
    lead_time: "Dispatched within 5 working days",
    stock: 8,
    position: 41,
    photo: `${MUGS_DIR}/Speckled Pink Bubble Ceramic Mug.png`,
  },
];

async function main() {
  // ── the room ──────────────────────────────────────────────────────
  const { data: existingCat } = await db
    .from("categories")
    .select("id")
    .eq("slug", CATEGORY.slug)
    .maybeSingle();

  let bedroomId = existingCat?.id;
  if (!bedroomId) {
    const { data, error } = await db.from("categories").insert(CATEGORY).select("id").single();
    if (error) throw new Error("category insert failed: " + error.message);
    bedroomId = data.id;
    console.log("category created: bedroom");
  } else {
    console.log("category already exists: bedroom");
  }

  const { data: tableware, error: twErr } = await db
    .from("categories")
    .select("id")
    .eq("slug", "tableware")
    .single();
  if (twErr) throw new Error("could not find tableware category: " + twErr.message);

  // ── products ──────────────────────────────────────────────────────
  const allDefs = [
    ...BEDROOM_PRODUCTS.map((p) => ({ ...p, category_id: bedroomId, art_kind: "throw", maker: MAKER })),
    ...MUG_PRODUCTS.map((p) => ({ ...p, category_id: tableware.id, art_kind: "cups", maker: MUG_MAKER })),
  ];

  let created = 0;
  let skipped = 0;
  const productIds = {};

  for (const def of allDefs) {
    const { data: existing } = await db
      .from("products")
      .select("id")
      .eq("slug", def.slug)
      .maybeSingle();

    if (existing) {
      productIds[def.slug] = existing.id;
      skipped++;
      continue;
    }

    const { data, error } = await db
      .from("products")
      .insert({
        slug: def.slug,
        name: def.name,
        category_id: def.category_id,
        price: def.price,
        blurb: def.blurb,
        material: def.material,
        dimensions: def.dimensions,
        care: def.care,
        maker: def.maker,
        lead_time: def.lead_time,
        art_kind: def.art_kind,
        stock: def.stock,
        is_featured: false,
        position: def.position,
      })
      .select("id")
      .single();

    if (error) throw new Error(`product insert failed for ${def.slug}: ${error.message}`);
    productIds[def.slug] = data.id;
    created++;
  }
  console.log(`products: ${created} created, ${skipped} already existed`);

  // ── photography ───────────────────────────────────────────────────
  // Percale items have no clean, unbranded photo available yet — they are
  // left to fall back to the drawn silhouette on purpose.
  const withPhotos = allDefs.filter((d) => d.photo);
  let uploaded = 0;
  let uploadSkipped = 0;

  for (const def of withPhotos) {
    const productId = productIds[def.slug];

    const { count } = await db
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    if ((count ?? 0) > 0) {
      uploadSkipped++;
      continue;
    }

    const fs = await import("node:fs");
    const bytes = fs.readFileSync(def.photo);
    const path = `${productId}/${Date.now()}-${def.slug}.png`;

    const { error: upErr } = await db.storage
      .from("product-images")
      .upload(path, bytes, { contentType: "image/png" });
    if (upErr) throw new Error(`upload failed for ${def.slug}: ${upErr.message}`);

    const { error: rowErr } = await db.from("product_images").insert({
      product_id: productId,
      storage_path: path,
      alt: def.name,
      position: 0,
    });
    if (rowErr) throw new Error(`image row failed for ${def.slug}: ${rowErr.message}`);

    uploaded++;
    // gentle pacing — 27 uploads in a tight loop is plenty fast without it,
    // this just keeps the log readable to watch.
    console.log(`  uploaded ${def.slug}`);
  }

  console.log(`photos: ${uploaded} uploaded, ${uploadSkipped} already had one`);

  const noPhoto = allDefs.filter((d) => !d.photo).map((d) => d.slug);
  console.log("no photo (drawn fallback):", noPhoto.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
