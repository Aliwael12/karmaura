-- ═══════════════════════════════════════════════════════════════════════
-- Seed — the catalogue exactly as the storefront carried it before the
-- database existed, plus the shop's tunable settings.
--
-- Generated from src/lib/products.ts. Safe to re-run: every insert is
-- guarded by ON CONFLICT so it will not duplicate or clobber edits made
-- in the admin.
-- ═══════════════════════════════════════════════════════════════════════

-- ── the five rooms ─────────────────────────────────────────────────────
insert into categories (slug, name, short_name, blurb, art_kind, position) values
  ('ceramics', 'Ceramics & vessels', 'Ceramics', 'Thrown on the wheel in Fustat, left unglazed where the hand meets it.', 'vessel', 0),
  ('textiles', 'Textiles & throws', 'Textiles', 'Loomed in single widths, undyed, finished by hand at both ends.', 'throw', 1),
  ('tableware', 'Tableware', 'Tableware', 'For the table that stays laid — serving pieces made to be used daily.', 'platter', 2),
  ('wall', 'Wall & décor', 'Wall & décor', 'Brass and ash, hammered and oiled, for the walls that hold a room.', 'disc', 3),
  ('storage', 'Baskets & storage', 'Storage', 'River reed and palm, coiled to hold their shape empty or full.', 'basket', 4)
on conflict (slug) do nothing;

-- ── the fifteen pieces ─────────────────────────────────────────────────
insert into products (slug, name, category_id, price, blurb, material, dimensions, care, maker, lead_time, art_kind, stock, is_featured, position) values
  ('amara', 'Amara Vessel', (select id from categories where slug = 'ceramics'), 9000,
   'A tall, hand-thrown vessel left unglazed outside so the clay keeps its tooth. Glazed within, so it holds water.',
   'Nile Delta stoneware, matte clay body, food-safe interior glaze.', 'H 24 cm · Ø 16 cm · 1.4 kg',
   'Rinse by hand. The unglazed body darkens slowly with use — that is the piece settling in.',
   'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'vessel', 6, true, 0),
  ('sahel', 'Sahel Bowl', (select id from categories where slug = 'ceramics'), 4800,
   'A wide, shallow bowl for fruit, keys, or nothing at all. Thrown thin at the rim, heavy at the foot.',
   'Stoneware, oatmeal glaze pooling to olive at the well.', 'H 7 cm · Ø 28 cm',
   'Dishwasher safe, though hand washing keeps the glaze soft.',
   'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'bowl', 12, false, 1),
  ('nour', 'Nour Carafe', (select id from categories where slug = 'ceramics'), 6400,
   'A carafe with a cut lip that pours without a drip. Made to sit out on the table all day.',
   'Stoneware, clear glaze, unglazed collar.', 'H 22 cm · 1.1 L',
   'Hand wash. Do not use on direct heat.',
   'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'carafe', 3, false, 2),
  ('wadi', 'Wadi Planter', (select id from categories where slug = 'ceramics'), 7200,
   'A footed planter with a drainage well, sized for a mature fig or olive.',
   'Terracotta with a sand slip, sealed base.', 'H 30 cm · Ø 26 cm',
   'Frost-hardy. Empty the well after heavy watering.',
   'Beshir pottery, Qena', 'Dispatched within 7 working days', 'planter', 8, false, 3),
  ('layla', 'Layla Throw', (select id from categories where slug = 'textiles'), 12000,
   'Hand-loomed in a single width, undyed, with a hand-knotted fringe at both ends.',
   'Fayoum wool, undyed, hand-loomed.', '200 × 140 cm',
   'Air rather than wash. Spot clean cool. Dry flat, out of sun.',
   'The Fayoum loom house', 'Woven to order — 3 weeks', 'throw', 4, true, 4),
  ('sabaa', 'Sabaa Cushion', (select id from categories where slug = 'textiles'), 4400,
   'A heavy linen cushion with a slubbed weave and a hidden linen tie instead of a zip.',
   'Washed linen, feather-down inner.', '50 × 50 cm',
   'Cool machine wash, cover only. Iron damp.',
   'The Fayoum loom house', 'Dispatched within 5 working days', 'cushion', 15, false, 5),
  ('dune', 'Dune Runner', (select id from categories where slug = 'textiles'), 8250,
   'A narrow table runner woven with an off-set stripe, so it reads differently either way round.',
   'Linen and cotton, stone and clay.', '180 × 40 cm',
   'Machine wash cool. Line dry.',
   'The Fayoum loom house', 'Dispatched within 5 working days', 'runner', 9, false, 6),
  ('zahra', 'Zahra Platter', (select id from categories where slug = 'tableware'), 6600,
   'An oval serving platter with a raised lip. Large enough for a whole fish or a flatbread.',
   'Stoneware, sand glaze, unglazed rim.', '42 × 28 cm',
   'Dishwasher safe. Warm in a low oven, never under a grill.',
   'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'platter', 7, false, 7),
  ('halim', 'Halim Cup Set', (select id from categories where slug = 'tableware'), 3700,
   'Four handleless cups, each thrown a little differently. For tea, coffee, or the last of the wine.',
   'Stoneware, four cups, mixed glazes.', 'H 8 cm · 180 ml each',
   'Dishwasher safe.',
   'Hoda & Sameh, Fustat', 'Dispatched within 5 working days', 'cups', 20, false, 8),
  ('anbar', 'Anbar Board', (select id from categories where slug = 'tableware'), 5500,
   'A thick olive-wood board with a hand-cut finger notch, oiled and nothing else.',
   'Olive wood, food-safe oil finish.', '46 × 22 × 3 cm',
   'Wipe, never soak. Re-oil twice a year.',
   'Wagdy the turner, Damietta', 'Dispatched within 5 working days', 'board', 11, false, 9),
  ('aura', 'Aura Disc', (select id from categories where slug = 'wall'), 10500,
   'A hand-hammered brass disc that catches whatever light the room has. Hangs flush or leans.',
   'Solid brass, hammered and lacquered.', 'Ø 40 cm · 2 mm',
   'Dust dry. The lacquer holds the shine; leave it unlacquered to patina, on request.',
   'Khan brass works, Cairo', 'Made to order — 2 weeks', 'disc', 5, true, 10),
  ('barq', 'Barq Mirror', (select id from categories where slug = 'wall'), 16000,
   'An arched mirror in an oiled ash frame, deep enough to hold a small shelf at the base.',
   'Ash frame, 5 mm mirror glass, brass hangers.', 'H 90 cm · W 46 cm',
   'Clean with a damp cloth. Keep the frame out of steam.',
   'Wagdy the turner, Damietta', 'Made to order — 3 weeks', 'mirror', 2, false, 11),
  ('qasab', 'Qasab Basket', (select id from categories where slug = 'storage'), 5900,
   'Coiled river reed with a soft, open weave. Holds firewood, laundry, or a season of blankets.',
   'River reed, cut and dried by hand.', 'H 40 cm · Ø 44 cm',
   'Keep dry. Mist lightly if the reed feels brittle.',
   'The reed cutters, Rashid', 'Dispatched within 5 working days', 'basket', 10, true, 12),
  ('reed', 'Reed Tray', (select id from categories where slug = 'storage'), 3200,
   'A flat woven tray for the hallway table — post, keys, a cup that has no saucer.',
   'Reed and palm fibre.', '38 × 26 cm',
   'Dust dry.',
   'The reed cutters, Rashid', 'Dispatched within 5 working days', 'tray', 18, false, 13),
  ('souk', 'Souk Hamper', (select id from categories where slug = 'storage'), 9500,
   'A tall lidded hamper with leather pulls, woven to hold its shape when empty.',
   'Palm leaf, vegetable-tanned leather pulls.', 'H 60 cm · 46 × 34 cm',
   'Keep dry. Condition the leather yearly.',
   'The reed cutters, Rashid', 'Made to order — 2 weeks', 'hamper', 6, false, 14)
on conflict (slug) do nothing;

-- ── the knobs the admin can turn without a deploy ──────────────────────
insert into settings (key, value) values
  ('delivery_fee', '900'::jsonb),
  ('free_delivery_from', '12500'::jsonb),
  ('store_open', 'true'::jsonb),
  ('announcement', '""'::jsonb),
  ('atelier_address', '"14 Sharia Bahgat Ali, Zamalek, Cairo"'::jsonb),
  ('atelier_hours', '"Thursday to Saturday, 11 — 7. By appointment otherwise."'::jsonb),
  ('atelier_phone', '"+20 2 2735 1180"'::jsonb),
  ('atelier_email', '"hello@karmaura.example"'::jsonb)
on conflict (key) do nothing;
