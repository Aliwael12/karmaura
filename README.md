# KARMAURA · HOME

A Next.js build of the KARMAURA home-goods storefront, scaffolded from the
single-file `KARMAURA Home.html` design comp. Every screen, component and
interaction in that comp is here as a real route, with dummy data standing in
for a catalogue service.

```bash
npm run dev
```

Runs on http://localhost:3000 (the checked-in launch config uses 3210).

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **Tailwind CSS v4** — tokens live in `@theme` in `src/app/globals.css`
- **TypeScript**
- **@phosphor-icons/react** (`/ssr` entry, so icons render in server components)
- No backend: the cart, account and orders live in `localStorage` behind one
  React context.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Home — hero, three promises, shop-by-material, this season, story, closing line |
| `/shop` | The collection. `?room=` filters, `?sort=` orders — both server-rendered, so filters are shareable and survive Back |
| `/shop/[slug]` | Product — gallery with four views, quantity, add to bag, save, three accordions, related pieces. All 15 pages are statically generated |
| `/story` | The story — pillars, atelier band, the four making steps |
| `/visit` | The atelier, stockists, contact form, and the repairs flow at `#repairs` |
| `/cart` | Bag and checkout on one screen |
| `/order/[id]` | Order confirmation and receipt |
| `/account` | "My profile". Signed out: the sign-in / create-profile panel. Signed in: the overview |
| `/account/orders` · `/saved` · `/addresses` · `/repairs` | The profile tabs |
| _404_ | "This room is empty" |

## Flows

- **Bag** — add from a card, a product page or the drawer; quantity steppers,
  remove, a free-delivery threshold at EGP 12,500, and a toast plus a bag-icon
  pulse on every add.
- **Checkout** — validates the delivery address, mints an order number
  (`KM-4820`, `KM-4821`, …), empties the bag and lands on the receipt. Payment
  is **cash on delivery only**: there is no card field anywhere in the site, and
  nothing is ever charged.
- **My profile** — any email and password signs in. A fresh profile is handed
  seed orders, addresses and a repair so the tabs have something to show;
  anything you create yourself is never overwritten.
- **Saved** — the heart on any product card or product page, collected under
  `/account/saved`.
- **Repairs** — opened from `/visit#repairs`, tracked in `/account/repairs`.

## Where things are

```
src/
  app/                  routes; every page is a server component
  components/
    Header, Footer      the chrome
    Overlays            mobile menu, cart drawer, toasts — portalled to <body>
    Reveal              the scroll-in animation, one IntersectionObserver each
    ObjectArt           per-product silhouettes standing in for photography
    SceneArt            the hero interior and the atelier band
    ProductCard, ProductDetail, CartScreen, OrderScreen, AccountPanels, …
  context/store.tsx     cart, saved, auth, orders, addresses, repairs, toasts
  lib/
    products.ts         the 15-piece catalogue and its categories
    commerce.ts         EGP formatting, cart lines, subtotal, delivery
public/brand/           emblem, wordmark and the kraft photograph
```

## Notes on the port

- **Artwork.** The comp used empty `image-slot` placeholders. Rather than ship
  grey boxes, `ObjectArt` draws each piece as a silhouette on a warm ground and
  `SceneArt` draws the two full-bleed scenes. Swapping in photography means
  replacing those two components — nothing else refers to them.
- **Layout units.** The comp measured its `clamp()`s in `cqw` against a preview
  frame. `.km-shell` in `globals.css` is the container those units resolve
  against here, so the spacing scale carries over unchanged.
- **Base CSS lives in `@layer base`.** Unlayered rules outrank every Tailwind
  utility, so a bare `button { background: none }` would silently beat
  `bg-gold` at the call site.
- **The desktop/mobile toggle** in the bottom-right of the comp was a preview
  affordance, not a site feature, and is not carried over. The breakpoint it
  switched at (760px) is the one the header still uses for the mobile menu.
- **Prices are EGP.** The comp priced everything in dollars ($64–$320); those
  figures were converted at roughly 50 EGP to the dollar and rounded to tidy
  retail numbers (EGP 3,200–16,000), because relabelling `$180` as `EGP 180`
  would have made the catalogue nonsense. Every price is one number in
  `products.ts`; the free-delivery threshold and the flat rate sit at the top
  of `commerce.ts`.
