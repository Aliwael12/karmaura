export type CategorySlug =
  "ceramics" | "textiles" | "tableware" | "wall" | "storage";

export type ArtKind =
  | "vessel"
  | "bowl"
  | "carafe"
  | "planter"
  | "throw"
  | "cushion"
  | "runner"
  | "platter"
  | "cups"
  | "board"
  | "disc"
  | "mirror"
  | "basket"
  | "tray"
  | "hamper";

export type Category = {
  slug: CategorySlug;
  /** the long name, as it reads on the object itself */
  name: string;
  /** the short name, as it reads on a filter chip */
  short: string;
  blurb: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "ceramics",
    name: "Ceramics & vessels",
    short: "Ceramics",
    blurb:
      "Thrown on the wheel in Fustat, left unglazed where the hand meets it.",
  },
  {
    slug: "textiles",
    name: "Textiles & throws",
    short: "Textiles",
    blurb: "Loomed in single widths, undyed, finished by hand at both ends.",
  },
  {
    slug: "tableware",
    name: "Tableware",
    short: "Tableware",
    blurb:
      "For the table that stays laid — serving pieces made to be used daily.",
  },
  {
    slug: "wall",
    name: "Wall & décor",
    short: "Wall & décor",
    blurb: "Brass and ash, hammered and oiled, for the walls that hold a room.",
  },
  {
    slug: "storage",
    name: "Baskets & storage",
    short: "Storage",
    blurb: "River reed and palm, coiled to hold their shape empty or full.",
  },
];

export type Product = {
  id: string;
  name: string;
  category: CategorySlug;
  price: number;
  blurb: string;
  material: string;
  dim: string;
  care: string;
  art: ArtKind;
  maker: string;
  leadTime: string;
  /** dummy stock — drives the "last few" note on the product page */
  stock: number;
};

export const PRODUCTS: Product[] = [
  {
    id: "amara",
    name: "Amara Vessel",
    category: "ceramics",
    price: 9000,
    blurb:
      "A tall, hand-thrown vessel left unglazed outside so the clay keeps its tooth. Glazed within, so it holds water.",
    material:
      "Nile Delta stoneware, matte clay body, food-safe interior glaze.",
    dim: "H 24 cm · Ø 16 cm · 1.4 kg",
    care: "Rinse by hand. The unglazed body darkens slowly with use — that is the piece settling in.",
    art: "vessel",
    maker: "Hoda & Sameh, Fustat",
    leadTime: "Dispatched within 5 working days",
    stock: 6,
  },
  {
    id: "sahel",
    name: "Sahel Bowl",
    category: "ceramics",
    price: 4800,
    blurb:
      "A wide, shallow bowl for fruit, keys, or nothing at all. Thrown thin at the rim, heavy at the foot.",
    material: "Stoneware, oatmeal glaze pooling to olive at the well.",
    dim: "H 7 cm · Ø 28 cm",
    care: "Dishwasher safe, though hand washing keeps the glaze soft.",
    art: "bowl",
    maker: "Hoda & Sameh, Fustat",
    leadTime: "Dispatched within 5 working days",
    stock: 12,
  },
  {
    id: "nour",
    name: "Nour Carafe",
    category: "ceramics",
    price: 6400,
    blurb:
      "A carafe with a cut lip that pours without a drip. Made to sit out on the table all day.",
    material: "Stoneware, clear glaze, unglazed collar.",
    dim: "H 22 cm · 1.1 L",
    care: "Hand wash. Do not use on direct heat.",
    art: "carafe",
    maker: "Hoda & Sameh, Fustat",
    leadTime: "Dispatched within 5 working days",
    stock: 3,
  },
  {
    id: "wadi",
    name: "Wadi Planter",
    category: "ceramics",
    price: 7200,
    blurb:
      "A footed planter with a drainage well, sized for a mature fig or olive.",
    material: "Terracotta with a sand slip, sealed base.",
    dim: "H 30 cm · Ø 26 cm",
    care: "Frost-hardy. Empty the well after heavy watering.",
    art: "planter",
    maker: "Beshir pottery, Qena",
    leadTime: "Dispatched within 7 working days",
    stock: 8,
  },
  {
    id: "layla",
    name: "Layla Throw",
    category: "textiles",
    price: 12000,
    blurb:
      "Hand-loomed in a single width, undyed, with a hand-knotted fringe at both ends.",
    material: "Fayoum wool, undyed, hand-loomed.",
    dim: "200 × 140 cm",
    care: "Air rather than wash. Spot clean cool. Dry flat, out of sun.",
    art: "throw",
    maker: "The Fayoum loom house",
    leadTime: "Woven to order — 3 weeks",
    stock: 4,
  },
  {
    id: "sabaa",
    name: "Sabaa Cushion",
    category: "textiles",
    price: 4400,
    blurb:
      "A heavy linen cushion with a slubbed weave and a hidden linen tie instead of a zip.",
    material: "Washed linen, feather-down inner.",
    dim: "50 × 50 cm",
    care: "Cool machine wash, cover only. Iron damp.",
    art: "cushion",
    maker: "The Fayoum loom house",
    leadTime: "Dispatched within 5 working days",
    stock: 15,
  },
  {
    id: "dune",
    name: "Dune Runner",
    category: "textiles",
    price: 8250,
    blurb:
      "A narrow table runner woven with an off-set stripe, so it reads differently either way round.",
    material: "Linen and cotton, stone and clay.",
    dim: "180 × 40 cm",
    care: "Machine wash cool. Line dry.",
    art: "runner",
    maker: "The Fayoum loom house",
    leadTime: "Dispatched within 5 working days",
    stock: 9,
  },
  {
    id: "zahra",
    name: "Zahra Platter",
    category: "tableware",
    price: 6600,
    blurb:
      "An oval serving platter with a raised lip. Large enough for a whole fish or a flatbread.",
    material: "Stoneware, sand glaze, unglazed rim.",
    dim: "42 × 28 cm",
    care: "Dishwasher safe. Warm in a low oven, never under a grill.",
    art: "platter",
    maker: "Hoda & Sameh, Fustat",
    leadTime: "Dispatched within 5 working days",
    stock: 7,
  },
  {
    id: "halim",
    name: "Halim Cup Set",
    category: "tableware",
    price: 3700,
    blurb:
      "Four handleless cups, each thrown a little differently. For tea, coffee, or the last of the wine.",
    material: "Stoneware, four cups, mixed glazes.",
    dim: "H 8 cm · 180 ml each",
    care: "Dishwasher safe.",
    art: "cups",
    maker: "Hoda & Sameh, Fustat",
    leadTime: "Dispatched within 5 working days",
    stock: 20,
  },
  {
    id: "anbar",
    name: "Anbar Board",
    category: "tableware",
    price: 5500,
    blurb:
      "A thick olive-wood board with a hand-cut finger notch, oiled and nothing else.",
    material: "Olive wood, food-safe oil finish.",
    dim: "46 × 22 × 3 cm",
    care: "Wipe, never soak. Re-oil twice a year.",
    art: "board",
    maker: "Wagdy the turner, Damietta",
    leadTime: "Dispatched within 5 working days",
    stock: 11,
  },
  {
    id: "aura",
    name: "Aura Disc",
    category: "wall",
    price: 10500,
    blurb:
      "A hand-hammered brass disc that catches whatever light the room has. Hangs flush or leans.",
    material: "Solid brass, hammered and lacquered.",
    dim: "Ø 40 cm · 2 mm",
    care: "Dust dry. The lacquer holds the shine; leave it unlacquered to patina, on request.",
    art: "disc",
    maker: "Khan brass works, Cairo",
    leadTime: "Made to order — 2 weeks",
    stock: 5,
  },
  {
    id: "barq",
    name: "Barq Mirror",
    category: "wall",
    price: 16000,
    blurb:
      "An arched mirror in an oiled ash frame, deep enough to hold a small shelf at the base.",
    material: "Ash frame, 5 mm mirror glass, brass hangers.",
    dim: "H 90 cm · W 46 cm",
    care: "Clean with a damp cloth. Keep the frame out of steam.",
    art: "mirror",
    maker: "Wagdy the turner, Damietta",
    leadTime: "Made to order — 3 weeks",
    stock: 2,
  },
  {
    id: "qasab",
    name: "Qasab Basket",
    category: "storage",
    price: 5900,
    blurb:
      "Coiled river reed with a soft, open weave. Holds firewood, laundry, or a season of blankets.",
    material: "River reed, cut and dried by hand.",
    dim: "H 40 cm · Ø 44 cm",
    care: "Keep dry. Mist lightly if the reed feels brittle.",
    art: "basket",
    maker: "The reed cutters, Rashid",
    leadTime: "Dispatched within 5 working days",
    stock: 10,
  },
  {
    id: "reed",
    name: "Reed Tray",
    category: "storage",
    price: 3200,
    blurb:
      "A flat woven tray for the hallway table — post, keys, a cup that has no saucer.",
    material: "Reed and palm fibre.",
    dim: "38 × 26 cm",
    care: "Dust dry.",
    art: "tray",
    maker: "The reed cutters, Rashid",
    leadTime: "Dispatched within 5 working days",
    stock: 18,
  },
  {
    id: "souk",
    name: "Souk Hamper",
    category: "storage",
    price: 9500,
    blurb:
      "A tall lidded hamper with leather pulls, woven to hold its shape when empty.",
    material: "Palm leaf, vegetable-tanned leather pulls.",
    dim: "H 60 cm · 46 × 34 cm",
    care: "Keep dry. Condition the leather yearly.",
    art: "hamper",
    maker: "The reed cutters, Rashid",
    leadTime: "Made to order — 2 weeks",
    stock: 6,
  },
];

/** the four pieces the home page leads with */
export const FEATURED_IDS = ["amara", "layla", "aura", "qasab"];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function categoryOf(slug: CategorySlug): Category {
  return CATEGORIES.find((c) => c.slug === slug) as Category;
}

export function categoryName(slug: CategorySlug): string {
  return categoryOf(slug).name;
}

export function productsIn(slug: CategorySlug): Product[] {
  return PRODUCTS.filter((p) => p.category === slug);
}

/** same room first, then everything else — always three */
export function relatedTo(product: Product): Product[] {
  const sameRoom = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  );
  const rest = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category !== product.category,
  );
  return [...sameRoom, ...rest].slice(0, 3);
}

export type SortKey = "featured" | "low" | "high";

export const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  low: "Price up",
  high: "Price down",
};

export function sortProducts(list: Product[], key: SortKey): Product[] {
  if (key === "low") return [...list].sort((a, b) => a.price - b.price);
  if (key === "high") return [...list].sort((a, b) => b.price - a.price);
  return list;
}
