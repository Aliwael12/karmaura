-- ═══════════════════════════════════════════════════════════════════════
-- Bosta shipping — district-level addresses, and the courier's own state.
--
-- Bosta will not accept a free-text city: every delivery needs an exact
-- city name plus a districtId from Bosta's own list (see
-- src/lib/bosta/zones.ts, generated from their published zoning sheet).
-- The existing ship_city / city text columns stay as they are — they are
-- still what a human reads on the order — these are the extra fields
-- Bosta itself requires, alongside the id of the piece it will eventually
-- know as "the delivery for this order."
-- ═══════════════════════════════════════════════════════════════════════

alter table addresses
  add column city_id        text not null default '',
  add column district_id    text not null default '',
  add column district_name  text not null default '';

alter table orders
  add column ship_city_id       text not null default '',
  add column ship_district_id   text not null default '',
  add column ship_district_name text not null default '',
  -- Bosta's own identifiers and state — separate from order_status, which
  -- is this shop's admin-facing lifecycle and drives stock. bosta_state is
  -- their raw numeric code (see BOSTA_STATE_LABELS in src/lib/bosta/client.ts);
  -- the webhook advances order_status too, but only for the handful of
  -- states that actually mean "delivered" or "not coming back."
  add column bosta_delivery_id     text,
  add column bosta_tracking_number text,
  add column bosta_state           integer,
  add column bosta_last_event_at   timestamptz,
  add column bosta_error           text not null default '';

create index orders_bosta_delivery_idx on orders (bosta_delivery_id)
  where bosta_delivery_id is not null;

-- ── place_order, extended ────────────────────────────────────────────
-- Same function, same guarantees (one transaction, prices from the
-- catalogue) — p_customer now carries city_id/district_id/district_name
-- alongside the fields it already took. All three default to '' so this
-- stays backwards compatible with any caller that predates the picker.

create or replace function place_order(
  p_items       jsonb,
  p_customer    jsonb,
  p_attribution jsonb default '{}'::jsonb,
  p_user_id     uuid  default null
)
returns orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order       orders;
  v_item        jsonb;
  v_product     products;
  v_qty         integer;
  v_subtotal    integer := 0;
  v_fee         integer;
  v_free_from   integer;
  v_delivery    integer;
  v_line_count  integer := 0;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'An order needs at least one piece in it'
      using errcode = 'check_violation';
  end if;

  if coalesce(p_customer->>'name', '') = ''
     or coalesce(p_customer->>'email', '') = ''
     or coalesce(p_customer->>'line1', '') = ''
     or coalesce(p_customer->>'city', '') = '' then
    raise exception 'A name, an email and a delivery address are required'
      using errcode = 'check_violation';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := coalesce((v_item->>'quantity')::integer, 0);
    if v_qty <= 0 then
      raise exception 'Quantity must be at least one'
        using errcode = 'check_violation';
    end if;

    select * into v_product
    from products
    where slug = v_item->>'slug' and is_active
    limit 1;

    if not found then
      raise exception 'No such piece: %', v_item->>'slug'
        using errcode = 'foreign_key_violation';
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    v_line_count := v_line_count + 1;
  end loop;

  select coalesce((value)::text::integer, 900) into v_fee
    from settings where key = 'delivery_fee';
  select coalesce((value)::text::integer, 12500) into v_free_from
    from settings where key = 'free_delivery_from';

  v_fee := coalesce(v_fee, 900);
  v_free_from := coalesce(v_free_from, 12500);

  v_delivery := case
    when v_subtotal = 0 or v_subtotal >= v_free_from then 0
    else v_fee
  end;

  insert into orders (
    order_number, user_id,
    customer_name, customer_email, customer_phone,
    ship_line1, ship_city, ship_postcode, ship_country,
    ship_city_id, ship_district_id, ship_district_name,
    subtotal, delivery_fee, total, attribution
  ) values (
    next_order_number(), p_user_id,
    p_customer->>'name', lower(trim(p_customer->>'email')),
    coalesce(p_customer->>'phone', ''),
    p_customer->>'line1', p_customer->>'city',
    coalesce(p_customer->>'postcode', ''),
    coalesce(p_customer->>'country', 'Egypt'),
    coalesce(p_customer->>'city_id', ''),
    coalesce(p_customer->>'district_id', ''),
    coalesce(p_customer->>'district_name', ''),
    v_subtotal, v_delivery, v_subtotal + v_delivery,
    coalesce(p_attribution, '{}'::jsonb)
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;

    select * into v_product
    from products where slug = v_item->>'slug' and is_active limit 1;

    insert into order_items (
      order_id, product_id, product_slug, product_name,
      unit_price, quantity, line_total
    ) values (
      v_order.id, v_product.id, v_product.slug, v_product.name,
      v_product.price, v_qty, v_product.price * v_qty
    );
  end loop;

  return v_order;
end;
$$;

revoke all on function place_order(jsonb, jsonb, jsonb, uuid) from public, anon, authenticated;
