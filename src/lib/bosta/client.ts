import "server-only";

/**
 * Bosta's delivery API — production only, there is no sandbox. Every call
 * from this file creates or reads a real delivery in their system.
 *
 * Auth: a raw API key in the Authorization header, no "Bearer " prefix —
 * confirmed against Bosta's own "Get Your API Key" guide, which shows
 * `--header "Authorization: <YOUR_API_KEY>"` verbatim. Their interactive
 * API reference shows "Bearer undefined" in its generated curl sample,
 * but that is the reference tool's own unfilled placeholder, not a second
 * accepted format.
 */

const BOSTA_BASE = "https://app.bosta.co/api/v2";
const COD_MAX = 30_000;

// Full state list from Bosta's webhook documentation. Codes not listed
// there (11, 22, 23, etc.) are shown to exist but undocumented — they fall
// back to "Bosta state <n>" rather than a guessed label.
export const BOSTA_STATE_LABELS: Record<number, string> = {
  10: "Pickup requested",
  20: "Route assigned",
  21: "Picked up from business",
  24: "Received at warehouse",
  45: "Delivered",
  46: "Returned to business",
  47: "Exception",
  48: "Terminated",
  49: "Canceled",
  100: "Lost",
  101: "Damaged",
};

/**
 * Where a Bosta state should also move this shop's own order_status.
 * Only the states with no ambiguity: a courier's "lost" or "damaged" needs
 * a person to decide what happens next, so those are recorded but left for
 * an admin to resolve rather than auto-cancelled.
 */
export function orderStatusForBostaState(
  state: number,
): "delivered" | "cancelled" | null {
  if (state === 45) return "delivered";
  if (state === 46 || state === 48 || state === 49) return "cancelled";
  return null;
}

export type BostaShipAddress = {
  line1: string;
  city: string;
  cityId?: string;
  districtId?: string;
  districtName?: string;
  zoneId?: string;
};

export type BostaOrderInput = {
  number: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  total: number;
  ship: BostaShipAddress;
};

export type BostaCreateResult =
  | {
      ok: true;
      deliveryId: string;
      trackingNumber: string;
      state: { code: number; value: string };
    }
  | { ok: false; error: string };

function splitName(fullName: string): { firstName: string; lastName?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || "Customer";
  return lastName_(parts);
  function lastName_(rest: string[]) {
    return rest.length ? { firstName, lastName: rest.join(" ") } : { firstName };
  }
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://karmaura.vercel.app").replace(/\/$/, "");
}

/**
 * Creates a cash-on-delivery "Deliver" order (type 10) — the only kind this
 * shop ever needs, since every order here is paid on arrival. Returns
 * {ok:false} rather than throwing: a failed Bosta call should never fail
 * the order itself, only be visible to an admin for a manual retry.
 */
export async function createBostaDelivery(
  order: BostaOrderInput,
): Promise<BostaCreateResult> {
  const apiKey = process.env.BOSTA_API_KEY;
  if (!apiKey) return { ok: false, error: "BOSTA_API_KEY is not configured" };

  if (!order.ship.districtId && !(order.ship.cityId && order.ship.districtName)) {
    return {
      ok: false,
      error: "No Bosta district on this order's address — cannot create a delivery",
    };
  }
  if (order.total <= 0) {
    return { ok: false, error: "Order total must be positive for a COD delivery" };
  }
  if (order.total > COD_MAX) {
    return { ok: false, error: `COD of ${order.total} EGP exceeds Bosta's ${COD_MAX} EGP limit` };
  }

  const { firstName, lastName } = splitName(order.customerName);

  const body = {
    type: 10, // Deliver — cash collected from the customer on arrival
    cod: order.total,
    goodsInfo: { amount: order.subtotal },
    specs: { packageType: "MEDIUM" },
    notes: "Handmade ceramics and textiles — please handle with care.",
    businessReference: order.number,
    dropOffAddress: {
      city: order.ship.city,
      ...(order.ship.districtId
        ? { districtId: order.ship.districtId }
        : { cityId: order.ship.cityId, districtName: order.ship.districtName }),
      ...(order.ship.zoneId ? { zoneId: order.ship.zoneId } : {}),
      firstLine: order.ship.line1,
    },
    receiver: {
      firstName,
      ...(lastName ? { lastName } : {}),
      phone: order.customerPhone || "00000000000",
      email: order.customerEmail,
    },
    webhookUrl: `${siteUrl()}/api/webhooks/bosta`,
    webhookCustomHeaders: { Authorization: process.env.BOSTA_WEBHOOK_SECRET ?? "" },
  };

  let res: Response;
  try {
    res = await fetch(`${BOSTA_BASE}/deliveries?apiVersion=1`, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return { ok: false, error: `Could not reach Bosta: ${(err as Error).message}` };
  }

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: {
      _id: string;
      trackingNumber: string;
      state: { code: number; value: string };
    };
  } | null;

  if (!res.ok || !json?.success || !json.data) {
    return {
      ok: false,
      error: json?.message ?? `Bosta returned ${res.status} with no usable body`,
    };
  }

  return {
    ok: true,
    deliveryId: json.data._id,
    trackingNumber: String(json.data.trackingNumber),
    state: json.data.state,
  };
}

/**
 * A read-only smoke test — lists the first page of Bosta's own cities to
 * confirm the API key and auth header actually work, without creating
 * anything. Safe to call as often as needed; nothing here has a side effect.
 */
export async function verifyBostaCredentials(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const apiKey = process.env.BOSTA_API_KEY;
  if (!apiKey) return { ok: false, error: "BOSTA_API_KEY is not configured" };

  let res: Response;
  try {
    res = await fetch(`${BOSTA_BASE}/cities?countryId=1`, {
      headers: { Authorization: apiKey },
    });
  } catch (err) {
    return { ok: false, error: `Could not reach Bosta: ${(err as Error).message}` };
  }

  if (res.status === 401 || res.status === 403) {
    return { ok: false, error: `Bosta rejected the API key (${res.status})` };
  }
  if (!res.ok) {
    return { ok: false, error: `Bosta returned ${res.status}` };
  }
  return { ok: true };
}
