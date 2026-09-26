import type { Order } from "@/lib/db/orders";

/* Email clients ignore most modern CSS, so this is table layout with inline
   styles and web-safe fonts. Colours are the shop's own: forest, cream, brass. */

const FOREST = "#3d5c2b";
const FOREST_DEEP = "#2b4220";
const CREAM = "#efdfc3";
const PAPER = "#fbf7ef";
const BRASS = "#ac9d62";
const INK = "#2a3320";
const MUTED = "#6b5f33";
const RULE = "#e6d9bd";

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "Helvetica,Arial,sans-serif";

function placedLabel(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Cairo",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function buildOrderEmail(
  order: Order,
  money: (n: number) => string,
  link: string,
  logoUrl: string,
): { html: string; text: string } {
  const where = [order.ship.line1, order.ship.districtName, order.ship.city]
    .filter(Boolean)
    .join(", ");
  const phone = order.customerPhone.trim();
  const itemCount = order.lines.reduce((n, l) => n + l.quantity, 0);

  const lineRows = order.lines
    .map(
      (l) => `<tr>
<td style="padding:14px 0;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:15px;color:${INK}">${escapeHtml(l.name)}<br><span style="font-size:13px;color:${MUTED}">${money(l.unitPrice)} each</span></td>
<td align="center" style="padding:14px 8px;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:15px;color:${INK};white-space:nowrap">&times; ${l.quantity}</td>
<td align="right" style="padding:14px 0;border-bottom:1px solid ${RULE};font-family:${SANS};font-size:15px;color:${INK};white-space:nowrap">${money(l.lineTotal)}</td>
</tr>`,
    )
    .join("");

  const totalRow = (label: string, value: string, strong = false) => `<tr>
<td style="padding:5px 0;font-family:${SANS};font-size:${strong ? 17 : 14}px;color:${strong ? INK : MUTED};${strong ? "font-weight:bold;" : ""}">${label}</td>
<td align="right" style="padding:5px 0;font-family:${strong ? SERIF : SANS};font-size:${strong ? 22 : 14}px;color:${strong ? FOREST : INK};${strong ? "font-weight:bold;" : ""}">${value}</td>
</tr>`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New order ${escapeHtml(order.number)}</title></head>
<body style="margin:0;padding:0;background:${CREAM}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${CREAM}">${escapeHtml(order.customerName)} ordered ${itemCount} ${itemCount === 1 ? "piece" : "pieces"}, ${money(order.total)} cash on delivery.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:${PAPER};border-radius:12px;overflow:hidden">

<tr><td align="center" style="background:${FOREST};padding:26px 24px">
<img src="${logoUrl}" alt="KARMAURA HOME" height="38" style="height:38px;width:auto;border:0;display:inline-block">
</td></tr>

<tr><td style="padding:34px 36px 6px">
<span style="display:inline-block;background:${CREAM};color:${FOREST_DEEP};font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:6px 12px;border-radius:20px">New order &middot; awaiting approval</span>
<h1 style="margin:16px 0 6px;font-family:${SERIF};font-size:34px;line-height:1.15;font-weight:normal;color:${FOREST}">${escapeHtml(order.number)}</h1>
<p style="margin:0;font-family:${SANS};font-size:14px;color:${MUTED}">Placed ${escapeHtml(placedLabel(order.placedAt))} (Cairo time)</p>
</td></tr>

<tr><td style="padding:24px 36px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:10px"><tr><td style="padding:20px 22px">
<p style="margin:0 0 10px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">Customer</p>
<p style="margin:0 0 6px;font-family:${SERIF};font-size:21px;color:${INK}">${escapeHtml(order.customerName)}</p>
<p style="margin:0 0 4px;font-family:${SANS};font-size:15px;color:${INK}">${phone ? `<a href="tel:${escapeHtml(phone)}" style="color:${FOREST};text-decoration:none">${escapeHtml(phone)}</a>` : "No phone given"}</p>
<p style="margin:0 0 14px;font-family:${SANS};font-size:15px"><a href="mailto:${escapeHtml(order.customerEmail)}" style="color:${FOREST}">${escapeHtml(order.customerEmail)}</a></p>
<p style="margin:0 0 4px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">Deliver to</p>
<p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.5;color:${INK}">${escapeHtml(where)}</p>
</td></tr></table>
</td></tr>

<tr><td style="padding:28px 36px 0">
<p style="margin:0;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${MUTED}">What was ordered</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px">${lineRows}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">
${totalRow("Subtotal", money(order.subtotal))}
${totalRow("Delivery", money(order.deliveryFee))}
${totalRow("Total to collect", money(order.total), true)}
</table>
<p style="margin:6px 0 0;font-family:${SANS};font-size:13px;color:${MUTED}">Cash on delivery. Nothing has been charged.</p>
</td></tr>

<tr><td align="center" style="padding:32px 36px 12px">
<a href="${link}" style="display:inline-block;background:${FOREST};color:#ffffff;font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:16px 34px;border-radius:8px">Review and approve</a>
<p style="margin:14px 0 0;font-family:${SANS};font-size:13px;color:${MUTED}">Approving books the courier with Bosta.</p>
</td></tr>

<tr><td style="padding:22px 36px 30px;border-top:1px solid ${RULE};margin-top:18px">
<p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.6;color:${BRASS};text-align:center">Karmaura Home &middot; sent automatically when an order is placed</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;

  const text = [
    `New order ${order.number} (awaiting approval)`,
    `Placed ${placedLabel(order.placedAt)} Cairo time`,
    "",
    `${order.customerName}`,
    `${phone || "No phone given"}  ${order.customerEmail}`,
    `Deliver to: ${where}`,
    "",
    ...order.lines.map((l) => `${l.name} x ${l.quantity}  ${money(l.lineTotal)}`),
    "",
    `Subtotal ${money(order.subtotal)}`,
    `Delivery ${money(order.deliveryFee)}`,
    `Total to collect ${money(order.total)} (cash on delivery)`,
    "",
    `Review and approve: ${link}`,
  ].join("\n");

  return { html, text };
}
