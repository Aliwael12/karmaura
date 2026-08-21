-- ═══════════════════════════════════════════════════════════════════════
-- Placing an order, and moving one through its lifecycle.
--
-- Both live in the database rather than in TypeScript for two reasons:
-- a single transaction (so an order can never exist with half its lines),
-- and prices read from the catalogue rather than trusted from the browser.
-- ═══════════════════════════════════════════════════════════════════════

-- ── place_order ────────────────────────────────────────────────────────
-- p_items: [{ "slug": "amara", "quantity": 2 }, …]
-- Returns the created order row.

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

  -- Price the basket from the catalogue, never from the payload.
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
    subtotal, delivery_fee, total, attribution
  ) values (
    next_order_number(), p_user_id,
    p_customer->>'name', lower(trim(p_customer->>'email')),
    coalesce(p_customer->>'phone', ''),
    p_customer->>'line1', p_customer->>'city',
    coalesce(p_customer->>'postcode', ''),
    coalesce(p_customer->>'country', 'Egypt'),
    v_subtotal, v_delivery, v_subtotal + v_delivery,
    coalesce(p_attribution, '{}'::jsonb)
  )
  returning * into v_order;

  -- Second pass now that we have an order id to hang the lines off.
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

-- ── set_order_status ───────────────────────────────────────────────────
-- Stock moves with the status, exactly once in each direction:
--   → approved / delivered : take the stock, if it has not been taken yet
--   → pending / cancelled  : give it back, if it had been taken
-- Both directions are guarded so re-running an action is harmless.

create or replace function set_order_status(
  p_order_id uuid,
  p_status   order_status
)
returns orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order      orders;
  v_was_held   boolean;
  v_will_hold  boolean;
  v_line       order_items;
  v_available  integer;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then
    raise exception 'No such order' using errcode = 'no_data_found';
  end if;

  v_was_held  := v_order.status in ('approved', 'delivered');
  v_will_hold := p_status in ('approved', 'delivered');

  if v_will_hold and not v_was_held then
    -- Check the whole basket before moving any of it, so a shortfall on the
    -- last line cannot leave the earlier ones already deducted.
    for v_line in select * from order_items where order_id = p_order_id loop
      if v_line.product_id is not null then
        select stock into v_available from products
          where id = v_line.product_id for update;
        if v_available is not null and v_available < v_line.quantity then
          raise exception 'Not enough % in stock (% left, % needed)',
            v_line.product_name, v_available, v_line.quantity
            using errcode = 'check_violation';
        end if;
      end if;
    end loop;

    update products p
       set stock = p.stock - oi.quantity
      from order_items oi
     where oi.order_id = p_order_id and p.id = oi.product_id;

  elsif v_was_held and not v_will_hold then
    update products p
       set stock = p.stock + oi.quantity
      from order_items oi
     where oi.order_id = p_order_id and p.id = oi.product_id;
  end if;

  update orders set
    status       = p_status,
    approved_at  = case when p_status = 'approved'  and approved_at  is null
                        then now() else approved_at end,
    delivered_at = case when p_status = 'delivered' then coalesce(delivered_at, now())
                        when p_status in ('pending', 'cancelled') then null
                        else delivered_at end,
    cancelled_at = case when p_status = 'cancelled' then now()
                        when p_status <> 'cancelled' then null
                        else cancelled_at end
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

revoke all on function set_order_status(uuid, order_status) from public, anon, authenticated;

-- ── open_repair ────────────────────────────────────────────────────────

create or replace function open_repair(
  p_piece   text,
  p_note    text,
  p_email   text default '',
  p_user_id uuid default null
)
returns repairs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_repair repairs;
begin
  if coalesce(trim(p_piece), '') = '' then
    raise exception 'Which piece needs mending?' using errcode = 'check_violation';
  end if;

  insert into repairs (reference, user_id, customer_email, piece, note)
  values (
    next_repair_reference(), p_user_id,
    lower(trim(coalesce(p_email, ''))), trim(p_piece), coalesce(p_note, '')
  )
  returning * into v_repair;

  return v_repair;
end;
$$;

revoke all on function open_repair(text, text, text, uuid) from public, anon, authenticated;
