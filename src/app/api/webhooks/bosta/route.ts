import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/server";
import { orderStatusForBostaState } from "@/lib/bosta/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Bosta calls this once per status change on a delivery we created — never
 * on creation itself. Authenticated by the custom header we asked Bosta to
 * echo back (webhookCustomHeaders.Authorization, set when the delivery was
 * created), not by a signature — Bosta's webhooks aren't signed.
 */
type BostaWebhookBody = {
  _id?: string;
  trackingNumber?: string | number;
  state?: number;
  businessReference?: string;
};

export async function POST(request: Request) {
  const expected = process.env.BOSTA_WEBHOOK_SECRET;
  const got = request.headers.get("authorization");
  if (!expected || got !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: BostaWebhookBody = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  const state = typeof body.state === "number" ? body.state : null;
  const admin = createAdminSupabase();

  // Correlate by our own order number first — set as businessReference when
  // the delivery was created, so it is the identifier we actually control.
  // Bosta's own delivery id is the fallback, for the rare case a
  // businessReference gets dropped somewhere upstream.
  type Match = { id: string; status: string };
  let match: Match | null = null;

  if (body.businessReference) {
    const { data } = await admin
      .from("orders")
      .select("id, status")
      .eq("order_number", body.businessReference)
      .maybeSingle();
    match = data as Match | null;
  }
  if (!match && body._id) {
    const { data } = await admin
      .from("orders")
      .select("id, status")
      .eq("bosta_delivery_id", body._id)
      .maybeSingle();
    match = data as Match | null;
  }

  if (!match) {
    // Nothing to reconcile against — not the sender's problem to retry.
    return NextResponse.json({ ok: true, note: "no matching order" });
  }

  await admin
    .from("orders")
    .update({
      ...(body._id ? { bosta_delivery_id: body._id } : {}),
      ...(body.trackingNumber != null
        ? { bosta_tracking_number: String(body.trackingNumber) }
        : {}),
      ...(state != null ? { bosta_state: state } : {}),
      bosta_last_event_at: new Date().toISOString(),
    })
    .eq("id", match.id);

  const nextStatus = state != null ? orderStatusForBostaState(state) : null;
  if (nextStatus && nextStatus !== match.status) {
    await admin.rpc("set_order_status", {
      p_order_id: match.id,
      p_status: nextStatus,
    });
  }

  try {
    revalidatePath("/account/orders");
    revalidatePath("/admin/orders");
  } catch {
    /* best-effort — a stale cache is not worth failing a 200 over */
  }

  return NextResponse.json({ ok: true });
}
