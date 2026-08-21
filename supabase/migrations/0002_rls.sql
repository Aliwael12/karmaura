-- ═══════════════════════════════════════════════════════════════════════
-- Row Level Security
--
-- The rule of the house: the browser may read the catalogue and its own
-- records, and nothing else. Every privileged write — placing an order,
-- moving stock, anything under /admin — goes through a route handler using
-- the service role, which bypasses these policies entirely. The admin
-- policies below exist so an admin can also read through the normal client
-- without a second code path.
-- ═══════════════════════════════════════════════════════════════════════

-- SECURITY DEFINER so the lookup inside does not itself trip the policy on
-- `profiles` and recurse. search_path is pinned so the function cannot be
-- redirected at a shadowed table.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function is_admin() from public;
grant execute on function is_admin() to authenticated, anon;

alter table profiles              enable row level security;
alter table addresses             enable row level security;
alter table categories            enable row level security;
alter table products              enable row level security;
alter table product_images        enable row level security;
alter table saved_items           enable row level security;
alter table orders                enable row level security;
alter table order_items           enable row level security;
alter table repairs               enable row level security;
alter table contact_messages      enable row level security;
alter table newsletter_subscribers enable row level security;
alter table sessions              enable row level security;
alter table settings              enable row level security;

-- ── profiles ───────────────────────────────────────────────────────────

create policy profiles_read_own on profiles
  for select using (id = auth.uid() or is_admin());

create policy profiles_update_own on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_admin_all on profiles
  for all using (is_admin()) with check (is_admin());

-- ── addresses ──────────────────────────────────────────────────────────

create policy addresses_own on addresses
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy addresses_admin_read on addresses
  for select using (is_admin());

-- ── catalogue: the shop window is public ───────────────────────────────

create policy categories_public_read on categories
  for select using (is_active or is_admin());

create policy categories_admin_write on categories
  for all using (is_admin()) with check (is_admin());

create policy products_public_read on products
  for select using (is_active or is_admin());

create policy products_admin_write on products
  for all using (is_admin()) with check (is_admin());

create policy product_images_public_read on product_images
  for select using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id and (p.is_active or is_admin())
    )
  );

create policy product_images_admin_write on product_images
  for all using (is_admin()) with check (is_admin());

-- ── saved pieces ───────────────────────────────────────────────────────

create policy saved_items_own on saved_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── orders: yours, or an admin's ───────────────────────────────────────
-- No insert policy on purpose. Orders are created server-side so the price
-- is taken from the catalogue rather than from whatever the browser sent.

create policy orders_read_own on orders
  for select using (user_id = auth.uid() or is_admin());

create policy orders_admin_write on orders
  for all using (is_admin()) with check (is_admin());

create policy order_items_read_own on order_items
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or is_admin())
    )
  );

create policy order_items_admin_write on order_items
  for all using (is_admin()) with check (is_admin());

-- ── repairs ────────────────────────────────────────────────────────────

create policy repairs_read_own on repairs
  for select using (user_id = auth.uid() or is_admin());

create policy repairs_admin_write on repairs
  for all using (is_admin()) with check (is_admin());

-- ── inboxes: write-only from outside, admin-readable ───────────────────
-- Contact notes and newsletter sign-ups are also funnelled through route
-- handlers (so they can be rate-limited and validated), hence admin-only
-- policies here.

create policy contact_admin_all on contact_messages
  for all using (is_admin()) with check (is_admin());

create policy newsletter_admin_all on newsletter_subscribers
  for all using (is_admin()) with check (is_admin());

create policy sessions_admin_read on sessions
  for select using (is_admin());

-- ── settings: the shop's public knobs are readable, writes are not ─────

create policy settings_public_read on settings
  for select using (true);

create policy settings_admin_write on settings
  for all using (is_admin()) with check (is_admin());

-- ── storage: product photography ───────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy product_images_public_select on storage.objects
  for select using (bucket_id = 'product-images');

create policy product_images_admin_insert on storage.objects
  for insert with check (bucket_id = 'product-images' and is_admin());

create policy product_images_admin_update on storage.objects
  for update using (bucket_id = 'product-images' and is_admin());

create policy product_images_admin_delete on storage.objects
  for delete using (bucket_id = 'product-images' and is_admin());
