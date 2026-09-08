import "server-only";

import { cookies } from "next/headers";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import { createBostaDelivery, BOSTA_STATE_LABELS } from "@/lib/bosta/client";
import type {
  OrderAttribution,
  OrderItemRow,
  OrderRow,
  OrderStatus,
} from "@/lib/supabase/types";

export type OrderLine = {
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ship: {
    line1: string;
    city: string;
    postcode: string;
    country: string;
    cityId: string;
    districtId: string;
    districtName: string;
  };
  subtotal: number;
  deliveryFee: number;
  total: number;
  placedAt: string;
  deliveredAt: string | null;
  lines: OrderLine[];
  bosta: {
    deliveryId: string | null;
    trackingNumber: string | null;
    state: number | null;
    stateLabel: string | null;
    lastEventAt: string | null;
    error: string;
  };
};

type JoinedOrder = OrderRow & { order_items: OrderItemRow[] | null };

function toOrder(row: JoinedOrder): Order {
  return {
    id: row.id,
    number: row.order_number,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    ship: {
      line1: row.ship_line1,
      city: row.ship_city,
      postcode: row.ship_postcode,
      country: row.ship_country,
      cityId: row.ship_city_id,
      districtId: row.ship_district_id,
      districtName: row.ship_district_name,
    },
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
    placedAt: row.placed_at,
    deliveredAt: row.delivered_at,
    lines: (row.order_items ?? []).map((i) => ({
      slug: i.product_slug,
      name: i.product_name,
      unitPrice: i.unit_price,
      quantity: i.quantity,
      lineTotal: i.line_total,
    })),
    bosta: {
      deliveryId: row.bosta_delivery_id,
      trackingNumber: row.bosta_tracking_number,
      state: row.bosta_state,
      stateLabel:
        row.bosta_state != null
          ? (BOSTA_STATE_LABELS[row.bosta_state] ?? `Bosta state ${row.bosta_state}`)
          : null,
      lastEventAt: row.bosta_last_event_at,
      error: row.bosta_error,
    },
  };
}

const ORDER_SELECT = "*, order_items(*)";

/* ── the receipt a guest is allowed to see ─────────────────────────────
   Order numbers run in sequence, so knowing one is no proof of owning it.
   A signed-in visitor is matched by user_id; a guest is matched against a
   short-lived httpOnly cookie written the moment their order was placed. */

const RECEIPT_COOKIE = "km_receipts";
const RECEIPT_MAX = 12;

export async function rememberReceipt(orderNumber: string) {
  const store = await cookies();
  const current = (store.get(RECEIPT_COOKIE)?.value ?? "")
    .split(",")
    .filter(Boolean);
  const next = [orderNumber, ...current.filter((n) => n !== orderNumber)].slice(
    0,
    RECEIPT_MAX,
  );
  store.set(RECEIPT_COOKIE, next.join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

async function holdsReceipt(orderNumber: string): Promise<boolean> {
  const store = await cookies();
  return (store.get(RECEIPT_COOKIE)?.value ?? "")
    .split(",")
    .includes(orderNumber);
}

/**
 * The receipt for one order, or null if the caller has no claim to it.
 * Never leaks the existence of an order they cannot see.
 */
export async function getOrderForViewer(
  orderNumber: string,
): Promise<Order | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (data) return toOrder(data as unknown as JoinedOrder);
  }

  if (await holdsReceipt(orderNumber)) {
    const admin = createAdminSupabase();
    const { data } = await admin
      .from("orders")
      .select(ORDER_SELECT)
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (data) return toOrder(data as unknown as JoinedOrder);
  }

  return null;
}

/** Every order belonging to the signed-in visitor, newest first. */
export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", user.id)
    .order("placed_at", { ascending: false });

  if (error) throw new Error(`Could not load your orders: ${error.message}`);
  return (data as unknown as JoinedOrder[]).map(toOrder);
}

/* ── placing one ───────────────────────────────────────────────────────
   Runs through the service role because place_order is SECURITY DEFINER
   and revoked from anon: the browser can never call it directly, and the
   basket it sends is only a list of slugs and quantities. */

export type PlaceOrderInput = {
  items: { slug: string; quantity: number }[];
  customer: {
    name: string;
    email: string;
    phone?: string;
    line1: string;
    city: string;
    postcode?: string;
    /** Bosta's own city id — required together with districtName when
        districtId isn't available (see the district-name fallback shape
        in src/lib/bosta/client.ts). */
    cityId?: string;
    /** Bosta's districtId — the one the address picker normally supplies. */
    districtId?: string;
    districtName?: string;
  };
  attribution?: OrderAttribution;
  userId?: string | null;
};

export type PlaceOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const admin = createAdminSupabase();

  const { data, error } = await admin.rpc("place_order", {
    p_items: input.items,
    p_customer: input.customer,
    p_attribution: input.attribution ?? {},
    p_user_id: input.userId ?? null,
  });

  if (error) return { ok: false, error: error.message };

  const created = data as unknown as OrderRow;

  const { data: full } = await admin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", created.id)
    .maybeSingle();

  let order = toOrder((full ?? created) as unknown as JoinedOrder);
  await rememberReceipt(order.number);

  /* Every order here is cash-on-delivery, so every order becomes a Bosta
     delivery — but a courier we couldn't book must never undo a sale
     that already happened. Record the failure and let an admin retry;
     never throw back into checkout at this point. */
  const bosta = await createBostaDelivery({
    number: order.number,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    subtotal: order.subtotal,
    total: order.total,
    ship: {
      line1: order.ship.line1,
      city: order.ship.city,
      cityId: order.ship.cityId || undefined,
      districtId: order.ship.districtId || undefined,
      districtName: order.ship.districtName || undefined,
    },
  });

  const { data: updated } = await admin
    .from("orders")
    .update(
      bosta.ok
        ? {
            bosta_delivery_id: bosta.deliveryId,
            bosta_tracking_number: bosta.trackingNumber,
            bosta_state: bosta.state.code,
            bosta_last_event_at: new Date().toISOString(),
            bosta_error: "",
          }
        : { bosta_error: bosta.error },
    )
    .eq("id", order.id)
    .select(ORDER_SELECT)
    .maybeSingle();

  if (updated) order = toOrder(updated as unknown as JoinedOrder);
  return { ok: true, order };
}
