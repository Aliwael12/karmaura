import "server-only";

import type { Order } from "@/lib/db/orders";
import { money } from "@/lib/commerce";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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
  const link = `${site}/admin/orders/${encodeURIComponent(order.number)}`;
  const where = [order.ship.line1, order.ship.districtName, order.ship.city]
    .filter(Boolean)
    .join(", ");

  const rows = order.lines
    .map(
      (l) =>
        `<tr><td style="padding:4px 12px 4px 0">${escapeHtml(l.name)}</td><td style="padding:4px 12px">x ${l.quantity}</td><td style="padding:4px 0;text-align:right">${money(l.lineTotal)}</td></tr>`,
    )
    .join("");

  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;line-height:1.5">
<h2 style="margin:0 0 12px">New order ${escapeHtml(order.number)}</h2>
<p style="margin:0 0 4px"><strong>${escapeHtml(order.customerName)}</strong></p>
<p style="margin:0 0 4px">${escapeHtml(order.customerPhone || "No phone given")} &middot; ${escapeHtml(order.customerEmail)}</p>
<p style="margin:0 0 16px">${escapeHtml(where)}</p>
<table style="border-collapse:collapse;margin-bottom:12px">${rows}</table>
<p style="margin:0">Subtotal ${money(order.subtotal)}<br>Delivery ${money(order.deliveryFee)}<br><strong>Total ${money(order.total)}</strong> (cash on delivery)</p>
<p style="margin:16px 0 0"><a href="${link}">Review and approve this order</a></p>
</div>`;

  const text = [
    `New order ${order.number}`,
    `${order.customerName}, ${order.customerPhone || "no phone"}, ${order.customerEmail}`,
    where,
    "",
    ...order.lines.map((l) => `${l.name} x ${l.quantity}  ${money(l.lineTotal)}`),
    "",
    `Total ${money(order.total)} (cash on delivery)`,
    link,
  ].join("\n");

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
