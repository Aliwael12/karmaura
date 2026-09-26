import "server-only";

import type { Order } from "@/lib/db/orders";
import { money } from "@/lib/commerce";
import { buildOrderEmail } from "./orderEmailTemplate";

/**
 * Tells the atelier a new order has arrived. Needs RESEND_API_KEY,
 * ORDER_NOTIFY_EMAILS (comma separated) and ORDER_FROM_EMAIL; with any of
 * them missing it does nothing. It never throws: a mail problem must not
 * undo a sale that has already been saved.
 */
export async function notifyNewOrder(order: Order): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_FROM_EMAIL;
  const to = (process.env.ORDER_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!key || !from || to.length === 0) return;

  const site = process.env.SITE_URL ?? "https://karmaura.net";
  const { html, text } = buildOrderEmail(
    order,
    money,
    `${site}/admin/orders/${encodeURIComponent(order.number)}`,
    `${site}/brand/wordmark.png`,
  );

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `New order ${order.number}, ${money(order.total)}`,
        html,
        text,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error("order email refused:", res.status, await res.text());
    }
  } catch (err) {
    console.error("order email failed:", err);
  }
}
