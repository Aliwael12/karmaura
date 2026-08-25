-- ═══════════════════════════════════════════════════════════════════════
-- Seed — the Bedroom room, and seventeen mugs added to Tableware.
--
-- Idempotent like 0003: every insert is guarded so re-running this after
-- edits made in the admin will not duplicate or overwrite them.
-- ═══════════════════════════════════════════════════════════════════════

insert into categories (slug, name, short_name, blurb, art_kind, position) values
  ('bedroom', 'Bedroom linens', 'Bedroom',
   'Egyptian cotton, woven in the Delta and cut for the bed that holds the whole day''s exhale.',
   'throw', 5)
on conflict (slug) do nothing;

-- ── bedroom linens ───────────────────────────────────────────────────
-- Three colourways of each line, sold as one piece each (no size/variant
-- model yet — the sizes on offer are noted in "dimensions" instead).

insert into products (slug, name, category_id, price, blurb, material, dimensions, care, maker, lead_time, art_kind, stock, is_featured, position) values
  ('percale-sheet-beige', 'Percale Sheet Set — Beige',
   (select id from categories where slug = 'bedroom'), 5400,
   'A crisp percale flat sheet in warm beige, woven light enough to stay cool through the night.',
   '100% Egyptian cotton, percale weave — light, crisp, cool to the touch.',
   'Available in Single XL and Twin — flat sheet with a matching pillowcase.',
   'Machine wash cool, tumble dry low. Iron warm for a crisp line.',
   'The Mahalla weavers, Gharbia', 'Dispatched within 5 working days', 'throw', 8, false, 15),

  ('percale-sheet-brown', 'Percale Sheet Set — Brown',
   (select id from categories where slug = 'bedroom'), 5400,
   'The same crisp percale in a deeper toffee brown — light enough to stay cool, substantial enough to last.',
   '100% Egyptian cotton, percale weave — light, crisp, cool to the touch.',
   'Available in Single XL and Twin — flat sheet with a matching pillowcase.',
   'Machine wash cool, tumble dry low. Iron warm for a crisp line.',
   'The Mahalla weavers, Gharbia', 'Dispatched within 5 working days', 'throw', 5, false, 16),

  ('percale-sheet-yellow-beige', 'Percale Sheet Set — Yellow Beige',
   (select id from categories where slug = 'bedroom'), 5400,
   'A soft, sun-warmed yellow beige percale, woven light enough to stay cool through the night.',
   '100% Egyptian cotton, percale weave — light, crisp, cool to the touch.',
   'Available in Single XL and Twin — flat sheet with a matching pillowcase.',
   'Machine wash cool, tumble dry low. Iron warm for a crisp line.',
   'The Mahalla weavers, Gharbia', 'Dispatched within 5 working days', 'throw', 7, false, 17),

  ('plain-sheet-beige', 'Plain Flat Sheet — Beige',
   (select id from categories where slug = 'bedroom'), 3600,
   'A plain-weave flat sheet in quiet beige — no pattern, no shine, just soft, honest cotton.',
   '100% Egyptian cotton, plain weave — soft, matte, no shine.',
   'Available in Double and Queen — flat sheet with a matching pillowcase.',
   'Machine wash cool, tumble dry low. Iron warm for a crisp line.',
   'The Mahalla weavers, Gharbia', 'Dispatched within 5 working days', 'throw', 12, false, 18),

  ('plain-sheet-brown', 'Plain Flat Sheet — Brown',
   (select id from categories where slug = 'bedroom'), 3600,
   'The same plain weave, warmed to a soft cocoa brown — matte, soft, entirely unfussy.',
   '100% Egyptian cotton, plain weave — soft, matte, no shine.',
   'Available in Double and Queen — flat sheet with a matching pillowcase.',
   'Machine wash cool, tumble dry low. Iron warm for a crisp line.',
   'The Mahalla weavers, Gharbia', 'Dispatched within 5 working days', 'throw', 9, false, 19),

  ('plain-sheet-yellow-beige', 'Plain Flat Sheet — Yellow Beige',
   (select id from categories where slug = 'bedroom'), 3600,
   'A plain-weave sheet in pale sand yellow — soft, matte, the colour of early light.',
   '100% Egyptian cotton, plain weave — soft, matte, no shine.',
   'Available in Double and Queen — flat sheet with a matching pillowcase.',
   'Machine wash cool, tumble dry low. Iron warm for a crisp line.',
   'The Mahalla weavers, Gharbia', 'Dispatched within 5 working days', 'throw', 10, false, 20),

  ('sateen-fitted-candy-taft', 'Sateen Fitted Sheet — Candy Taft',
   (select id from categories where slug = 'bedroom'), 4200,
   'A sateen fitted sheet in warm cream, its surface printed with a faint tone-on-tone pattern that only shows in raking light.',
   '100% Egyptian cotton sateen, printed pattern — a soft lustre from a four-thread weave.',
   'Available in Double and Queen — fitted sheet, deep elastic pocket.',
   'Machine wash cool on a gentle cycle to protect the print. Tumble dry low.',
   'The Mahalla weavers, Gharbia', 'Made to order — 10 days', 'throw', 6, false, 21),

  ('sateen-fitted-fiori-rosa', 'Sateen Fitted Sheet — Fiori Rosa',
   (select id from categories where slug = 'bedroom'), 4200,
   'A sateen fitted sheet scattered with soft pink florals on white — fiori rosa, pink flowers, printed in a watercolour hand.',
   '100% Egyptian cotton sateen, printed pattern — a soft lustre from a four-thread weave.',
   'Available in Double and Queen — fitted sheet, deep elastic pocket.',
   'Machine wash cool on a gentle cycle to protect the print. Tumble dry low.',
   'The Mahalla weavers, Gharbia', 'Made to order — 10 days', 'throw', 8, false, 22),

  ('sateen-fitted-giordano-bianco', 'Sateen Fitted Sheet — Giordano Bianco',
   (select id from categories where slug = 'bedroom'), 4200,
   'A sateen fitted sheet in soft grey-white, its pattern a quiet damask that reads as texture more than print.',
   '100% Egyptian cotton sateen, printed pattern — a soft lustre from a four-thread weave.',
   'Available in Double and Queen — fitted sheet, deep elastic pocket.',
   'Machine wash cool on a gentle cycle to protect the print. Tumble dry low.',
   'The Mahalla weavers, Gharbia', 'Made to order — 10 days', 'throw', 7, false, 23),

  ('sateen-fitted-moon-flower', 'Sateen Fitted Sheet — Moon Flower',
   (select id from categories where slug = 'bedroom'), 4200,
   'A sateen fitted sheet in pale beige, printed with a hushed floral that fades in and out like moonlight.',
   '100% Egyptian cotton sateen, printed pattern — a soft lustre from a four-thread weave.',
   'Available in Double and Queen — fitted sheet, deep elastic pocket.',
   'Machine wash cool on a gentle cycle to protect the print. Tumble dry low.',
   'The Mahalla weavers, Gharbia', 'Made to order — 10 days', 'throw', 5, false, 24)
on conflict (slug) do nothing;

-- ── mugs, added to the existing Tableware room ─────────────────────────

insert into products (slug, name, category_id, price, blurb, material, dimensions, care, maker, lead_time, art_kind, stock, is_featured, position) values
  ('boho-geometric-mug', 'Boho Geometric Mug',
   (select id from categories where slug = 'tableware'), 950,
   'A teal chevron pattern carved through a dark glaze, so the brown clay body shows in every line.',
   'Stoneware, carved glaze, dark interior.', 'H 9 cm · Ø 8.5 cm · 330 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 10, false, 25),

  ('reactive-amber-mug', 'Reactive Amber Mug',
   (select id from categories where slug = 'tableware'), 850,
   'A warm amber glaze that breaks paler toward the foot, no two firings quite the same.',
   'Stoneware, reactive amber glaze.', 'H 9 cm · Ø 8.5 cm · 340 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 14, false, 26),

  ('copper-lustre-cup', 'Copper Lustre Cup',
   (select id from categories where slug = 'tableware'), 820,
   'A handleless cup left in plum stoneware below, an oil-slick band of copper lustre at the rim.',
   'Stoneware, lustre glaze band, unglazed terracotta foot.', 'H 8 cm · Ø 8 cm · 220 ml',
   'Hand wash, to protect the lustre.', 'Hoda & Sameh, Fustat', 'Made to order — 2 weeks', 'cups', 6, false, 27),

  ('forest-fade-mug', 'Forest Fade Mug',
   (select id from categories where slug = 'tableware'), 900,
   'Speckled sage at the rim, deepening to forest green at the foot — a full-handled mug for a proper cup.',
   'Stoneware, speckled glaze, colour-graded.', 'H 10 cm · Ø 8.5 cm · 350 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 9, false, 28),

  ('blue-ombre-mug', 'Blue Ombre Mug',
   (select id from categories where slug = 'tableware'), 950,
   'A reactive glaze that runs from deep indigo at the rim to sea-foam at the foot, textured like breaking water.',
   'Stoneware, reactive ombre glaze.', 'H 9.5 cm · Ø 8.5 cm · 340 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 8, false, 29),

  ('speckled-umber-mug', 'Speckled Umber Mug',
   (select id from categories where slug = 'tableware'), 850,
   'An olive-umber glaze flecked dark throughout, the kind of mug that hides a tea stain on purpose.',
   'Stoneware, speckled glaze.', 'H 9 cm · Ø 8.5 cm · 330 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 15, false, 30),

  ('forest-bubble-mug', 'Forest Bubble Mug',
   (select id from categories where slug = 'tableware'), 980,
   'A deep forest glaze pooled thick over a double-bellied form, glossy enough to catch the window.',
   'Stoneware, glossy forest glaze.', 'H 9 cm · Ø 9 cm · 350 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 7, false, 31),

  ('plum-lustre-mug', 'Plum Lustre Mug',
   (select id from categories where slug = 'tableware'), 1100,
   'Rows of hand-carved scale, glazed plum and lustre at the rim, sand-toned stoneware showing through below.',
   'Stoneware, carved texture, lustre glaze.', 'H 8.5 cm · Ø 9 cm · 320 ml',
   'Hand wash, to protect the lustre.', 'Hoda & Sameh, Fustat', 'Made to order — 2 weeks', 'cups', 5, false, 32),

  ('scale-texture-espresso-cup', 'Scale Texture Espresso Cup',
   (select id from categories where slug = 'tableware'), 800,
   'A small cup for a short coffee, its surface carved in overlapping scale and glazed a quiet teal-grey.',
   'Stoneware, carved texture, matte glaze.', 'H 7 cm · Ø 7.5 cm · 180 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 9, false, 33),

  ('sgraffito-lotus-mug', 'Sgraffito Lotus Mug',
   (select id from categories where slug = 'tableware'), 1200,
   'Lotus and papyrus, carved by hand through a deep blue glaze in the sgraffito technique — an old form, redrawn.',
   'Stoneware, hand-carved sgraffito, cobalt glaze.', 'H 10 cm · Ø 9 cm · 360 ml',
   'Hand wash, to protect the carved detail.', 'Hoda & Sameh, Fustat', 'Made to order — 2 weeks', 'cups', 4, false, 34),

  ('teal-scale-mug', 'Teal Scale Mug',
   (select id from categories where slug = 'tableware'), 950,
   'Carved scale under a speckled teal glaze, the copper foot left bare where the hand last held it.',
   'Stoneware, carved texture, speckled glaze.', 'H 9.5 cm · Ø 8.5 cm · 340 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 8, false, 35),

  ('indigo-iridescent-mug', 'Indigo Iridescent Mug',
   (select id from categories where slug = 'tableware'), 1100,
   'An iridescent glaze that shifts from indigo to rose gold as the light moves across it.',
   'Stoneware, iridescent glaze.', 'H 9 cm · Ø 8.5 cm · 330 ml',
   'Hand wash, to protect the iridescent finish.', 'Hoda & Sameh, Fustat', 'Made to order — 2 weeks', 'cups', 5, false, 36),

  ('olive-ridge-mug', 'Olive Ridge Mug',
   (select id from categories where slug = 'tableware'), 1000,
   'Thrown in two stacked bulges, olive speckle giving way to cream — a mug with a waistline.',
   'Stoneware, speckled two-tone glaze.', 'H 9.5 cm · Ø 9 cm · 350 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 7, false, 37),

  ('dusty-rose-bubble-mug', 'Dusty Rose Bubble Mug',
   (select id from categories where slug = 'tableware'), 980,
   'A dusty rose glaze fading to plum at the foot, thrown with the same double-bellied bubble form.',
   'Stoneware, ombre glaze.', 'H 9 cm · Ø 9 cm · 350 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 9, false, 38),

  ('sage-speckle-mug', 'Sage Speckle Mug',
   (select id from categories where slug = 'tableware'), 850,
   'Sage green, speckled dark throughout, in a simple rounded form that sits well in the hand.',
   'Stoneware, speckled glaze.', 'H 9 cm · Ø 8.5 cm · 330 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 12, false, 39),

  ('speckled-mauve-mug', 'Speckled Mauve Mug',
   (select id from categories where slug = 'tableware'), 900,
   'A mauve-pink glaze, speckled dark, deepening to a plum foot — quiet enough for every day.',
   'Stoneware, speckled glaze.', 'H 9 cm · Ø 8.5 cm · 340 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 10, false, 40),

  ('rose-bubble-ridge-mug', 'Rose Bubble Ridge Mug',
   (select id from categories where slug = 'tableware'), 980,
   'Bright rose, speckled white, thrown in the same stacked ridges as the Olive Ridge — a warmer twin.',
   'Stoneware, speckled glaze, ridged form.', 'H 9.5 cm · Ø 9 cm · 350 ml',
   'Dishwasher and microwave safe.', 'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 8, false, 41)
on conflict (slug) do nothing;
