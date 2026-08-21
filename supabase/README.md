# Connecting KARMAURA to Supabase

Four migrations, applied in order. They have been run and exercised against a
real Postgres — schema, policies, seed and the order lifecycle all apply
cleanly — but not yet against a live Supabase project.

| File | What it does |
| --- | --- |
| `0001_schema.sql` | Tables, enums, indexes, triggers, order-number sequences |
| `0002_rls.sql` | Row Level Security on every table, plus the storage bucket |
| `0003_seed.sql` | The five rooms, the fifteen pieces, the shop's settings |
| `0004_order_functions.sql` | `place_order`, `set_order_status`, `open_repair` |

## 1. Create the project and apply the migrations

With the Supabase CLI, from the repo root:

```bash
npx supabase link --project-ref <your-project-ref>
```

```bash
npx supabase db push
```

Or paste each file, in order, into the SQL editor in the dashboard.

## 2. Environment

Copy `.env.example` to `.env.local` and fill in the three values from
**Project settings → API**:

```bash
cp .env.example .env.local
```

`SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. It is read only by
route handlers and server actions — never shipped to the browser — and must
not be given the `NEXT_PUBLIC_` prefix.

## 3. Seed the administrator

There is no sign-up at `/admin` on purpose. Make the account in the dashboard
(**Authentication → Users → Add user**, with *Auto Confirm* on), then mark it
as an administrator:

```sql
update profiles set is_admin = true where email = 'you@example.com';
```

Sign in at `/admin/login`. From then on further administrators can be promoted
from **Customers** inside the dashboard itself.

## How the pieces fit

- **Prices are never trusted from the browser.** `place_order` takes only
  slugs and quantities, then reads every price, the delivery fee and the
  free-delivery threshold from the database inside one transaction.
- **Stock moves with status, exactly once.** `set_order_status` takes stock on
  approve, returns it on cancel, and is guarded so re-running an action cannot
  double-count. It refuses an approval it cannot cover, and checks the whole
  basket before moving any of it.
- **Order lines are frozen copies.** Editing or deleting a product cannot
  rewrite what a past order said it cost.
- **Receipts are not guessable.** Order numbers run in sequence, so a guest's
  receipt is gated on a short-lived `httpOnly` cookie written when the order
  was placed; a signed-in customer is matched on `user_id` instead.
- **Money is whole pounds** in `integer` columns. EGP has no practical
  sub-unit at these prices, and integers cannot drift.

## Verified so far

Run against Postgres 17 with stubs standing in for `auth` and `storage`:

- all four migrations apply cleanly, and the seed is idempotent
- delivery is charged below the threshold and waived above it
- a payload claiming its own price is ignored — the catalogue wins
- stock: 12 → 11 on approve, still 11 on a second approve, 12 on cancel
- approving beyond stock is refused, and leaves stock untouched
- unknown product, empty basket and missing address are each rejected

Still to be checked against a live project: Row Level Security under real JWTs,
Storage uploads, and the auth trigger that creates a profile row on sign-up.
