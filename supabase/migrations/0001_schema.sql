-- ═══════════════════════════════════════════════════════════════════════
-- KARMAURA · HOME — core schema
--
-- Money is stored as whole Egyptian pounds in `integer` columns. The store
-- has never priced anything in piastres and EGP has no practical sub-unit at
-- these price points, so integers avoid float drift entirely.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── enums ──────────────────────────────────────────────────────────────

create type order_status as enum (
  'pending',    -- placed, awaiting the atelier's review
  'approved',   -- confirmed; stock has been taken
  'delivered',  -- in the customer's hands; counts as realised revenue
  'cancelled'   -- voided; stock returned if it had been taken
);

create type repair_status as enum ('received', 'mending', 'sent_back', 'closed');

create type message_status as enum ('new', 'read', 'archived');

-- ── people ─────────────────────────────────────────────────────────────

-- One row per auth.users row. `is_admin` is the only gate on /admin.
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  phone       text not null default '',
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_is_admin_idx on profiles (is_admin) where is_admin;

create table addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  label       text not null default 'Address',
  full_name   text not null,
  line1       text not null,
  city        text not null,
  postcode    text not null default '',
  country     text not null default 'Egypt',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index addresses_user_idx on addresses (user_id);

-- At most one default per person, enforced by the database rather than by
-- whichever code path happens to be writing.
create unique index addresses_one_default_idx
  on addresses (user_id) where is_default;

-- ── catalogue ──────────────────────────────────────────────────────────

create table categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  short_name  text not null,
  blurb       text not null default '',
  art_kind    text not null default 'vessel',
  position    integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index categories_position_idx on categories (position);

create table products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  category_id  uuid references categories(id) on delete set null,
  price        integer not null check (price >= 0),
  blurb        text not null default '',
  material     text not null default '',
  dimensions   text not null default '',
  care         text not null default '',
  maker        text not null default '',
  lead_time    text not null default '',
  -- the SVG silhouette that stands in until a photograph is uploaded
  art_kind     text not null default 'vessel',
  stock        integer not null default 0 check (stock >= 0),
  is_active    boolean not null default true,
  is_featured  boolean not null default false,
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index products_category_idx on products (category_id);
create index products_active_idx on products (is_active) where is_active;
create index products_featured_idx on products (is_featured) where is_featured;

create table product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  storage_path text not null,
  alt          text not null default '',
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);

create index product_images_product_idx on product_images (product_id, position);

create table saved_items (
  user_id    uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ── orders ─────────────────────────────────────────────────────────────

create table orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique,
  -- null for a guest checkout; the order is still reachable by its number
  user_id        uuid references profiles(id) on delete set null,

  customer_name  text not null,
  customer_email text not null,
  customer_phone text not null default '',

  ship_line1     text not null,
  ship_city      text not null,
  ship_postcode  text not null default '',
  ship_country   text not null default 'Egypt',

  subtotal       integer not null check (subtotal >= 0),
  delivery_fee   integer not null default 0 check (delivery_fee >= 0),
  total          integer not null check (total >= 0),

  status         order_status not null default 'pending',

  -- where the visit that produced this order came from
  attribution    jsonb not null default '{}'::jsonb,
  admin_note     text not null default '',

  placed_at      timestamptz not null default now(),
  approved_at    timestamptz,
  delivered_at   timestamptz,
  cancelled_at   timestamptz
);

create index orders_user_idx on orders (user_id);
create index orders_placed_at_idx on orders (placed_at desc);
create index orders_status_idx on orders (status);
create index orders_email_idx on orders (lower(customer_email));

-- Line items keep their own copy of name and price: the catalogue may be
-- edited or a product deleted, and a past order must not silently change.
create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  product_id   uuid references products(id) on delete set null,
  product_slug text not null,
  product_name text not null,
  unit_price   integer not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  line_total   integer not null check (line_total >= 0)
);

create index order_items_order_idx on order_items (order_id);
create index order_items_product_idx on order_items (product_id);

-- ── the house's own inboxes ────────────────────────────────────────────

create table repairs (
  id            uuid primary key default gen_random_uuid(),
  reference     text not null unique,
  user_id       uuid references profiles(id) on delete set null,
  customer_email text not null default '',
  piece         text not null,
  note          text not null default '',
  status        repair_status not null default 'received',
  admin_note    text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index repairs_user_idx on repairs (user_id);
create index repairs_created_idx on repairs (created_at desc);

create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  status     message_status not null default 'new',
  created_at timestamptz not null default now()
);

create index contact_created_idx on contact_messages (created_at desc);

create table newsletter_subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique,
  created_at     timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- ── analytics ──────────────────────────────────────────────────────────

-- One row per visit. Written by /api/track through the service role, never
-- by the browser directly, so the table cannot be stuffed from outside.
create table sessions (
  id              uuid primary key default gen_random_uuid(),
  session_id      text,
  path            text,
  referrer        text,
  referrer_host   text,
  social_referrer text,
  country         text,
  region          text,
  city            text,
  utm             jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index sessions_created_idx on sessions (created_at desc);
create index sessions_social_idx on sessions (social_referrer);

-- ── settings ───────────────────────────────────────────────────────────

-- A tiny key/value store so the admin can retune the shop without a deploy.
create table settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ── keep updated_at honest ─────────────────────────────────────────────

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_touch  before update on products
  for each row execute function touch_updated_at();
create trigger profiles_touch  before update on profiles
  for each row execute function touch_updated_at();
create trigger repairs_touch   before update on repairs
  for each row execute function touch_updated_at();
create trigger settings_touch  before update on settings
  for each row execute function touch_updated_at();

-- ── a profile for every new sign-up ────────────────────────────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── order numbers ──────────────────────────────────────────────────────

-- KM-4820 onward, matching the numbering the storefront already showed.
create sequence order_number_seq start with 4820;

create or replace function next_order_number()
returns text
language sql
as $$
  select 'KM-' || nextval('order_number_seq')::text;
$$;

create sequence repair_reference_seq start with 119;

create or replace function next_repair_reference()
returns text
language sql
as $$
  select 'RP-' || nextval('repair_reference_seq')::text;
$$;
