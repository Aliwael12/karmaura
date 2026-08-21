import "server-only";

import { cookies } from "next/headers";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
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
  ship: { line1: string; city: string; postcode: string; country: string };
  subtotal: number;
  deliveryFee: number;
  total: number;
  placedAt: string;
  deliveredAt: string | null;
  lines: OrderLine[];
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

  const order = toOrder((full ?? created) as unknown as JoinedOrder);
  await rememberReceipt(order.number);
  return { ok: true, order };
}
