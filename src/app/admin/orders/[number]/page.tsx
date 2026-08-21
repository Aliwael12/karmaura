import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/db/auth";
import { createAdminSupabase } from "@/lib/supabase/server";
import { money, shippingLabel } from "@/lib/commerce";
import { PageHead, Panel, StatusPill } from "../../ui";
import OrderActions from "./OrderActions";
import type { OrderRow, OrderItemRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type Joined = OrderRow & { order_items: OrderItemRow[] | null };

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  await requireAdmin();
  const { number } = await params;

  const { data } = await createAdminSupabase()
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", number)
    .maybeSingle();

  if (!data) notFound();
  const order = data as unknown as Joined;
  const items = order.order_items ?? [];
  const attribution = order.attribution ?? {};
  const utm = attribution.utm ?? {};

  const stamps = [
    ["Placed", order.placed_at],
    ["Approved", order.approved_at],
    ["Delivered", order.delivered_at],
    ["Cancelled", order.cancelled_at],
  ] as const;

  return (
    <>
      <PageHead eyebrow={order.order_number} title={order.customer_name}>
        <div className="flex items-center gap-3">
          <StatusPill status={order.status} />
          <Link
            href="/admin/orders"
            className="text-[11px] tracking-[.14em] text-cream/50 uppercase hover:text-gold-bright"
          >
            ← All orders
          </Link>
        </div>
      </PageHead>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <Panel title="What was ordered">
            <table className="w-full text-sm">
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-gold/10 last:border-0">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/shop/${i.product_slug}`}
                        className="text-cream hover:text-gold-bright"
                      >
                        {i.product_name}
                      </Link>
                      <span className="block text-[11px] text-cream/40">
                        {i.quantity} × {money(i.unit_price)}
                      </span>
                    </td>
                    <td className="py-3 text-right tabular-nums text-cream/70">
                      {money(i.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="mt-5 flex flex-col gap-2 border-t border-gold/15 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-cream/55">Subtotal</dt>
                <dd className="tabular-nums text-cream/75">{money(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream/55">Delivery</dt>
                <dd className="tabular-nums text-cream/75">
                  {shippingLabel(order.delivery_fee)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <dt className="km-label text-cream/70">Total</dt>
                <dd className="font-serif text-2xl text-cream">{money(order.total)}</dd>
              </div>
            </dl>

            <p className="mt-4 rounded-lg border border-gold/30 bg-forest-night/50 p-3 text-[12px] text-cream/60">
              Cash on delivery — collect {money(order.total)} from the customer.
            </p>
          </Panel>

          <OrderActions
            orderId={order.id}
            status={order.status}
            note={order.admin_note}
          />
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Going to">
            <p className="text-sm leading-[1.8] text-cream/75">
              {order.customer_name}
              <br />
              {order.ship_line1}
              <br />
              {order.ship_city} {order.ship_postcode}
              <br />
              {order.ship_country}
            </p>
            <p className="mt-4 border-t border-gold/15 pt-4 text-sm text-cream/60">
              <a
                href={`mailto:${order.customer_email}`}
                className="text-gold-bright hover:underline hover:underline-offset-4"
              >
                {order.customer_email}
              </a>
              {order.customer_phone && (
                <>
                  <br />
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="hover:text-gold-bright"
                  >
                    {order.customer_phone}
                  </a>
                </>
              )}
            </p>
          </Panel>

          <Panel title="History">
            <dl className="flex flex-col gap-2 text-sm">
              {stamps.map(([label, at]) =>
                at ? (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="text-cream/55">{label}</dt>
                    <dd className="text-right text-cream/75">
                      {new Date(at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>
          </Panel>

          <Panel title="Came from">
            {Object.keys(attribution).length === 0 ? (
              <p className="text-sm text-cream/40">Not recorded.</p>
            ) : (
              <dl className="flex flex-col gap-2 text-sm">
                {[
                  ["Referrer", attribution.referrer_host],
                  ["Social", attribution.social_referrer],
                  ["UTM source", utm.source],
                  ["UTM medium", utm.medium],
                  ["UTM campaign", utm.campaign],
                ]
                  .filter(([, v]) => Boolean(v))
                  .map(([label, value]) => (
                    <div key={label as string} className="flex justify-between gap-4">
                      <dt className="text-cream/55">{label}</dt>
                      <dd className="truncate text-cream/75">{value}</dd>
                    </div>
                  ))}
                {!attribution.referrer_host &&
                  !attribution.social_referrer &&
                  !utm.source && (
                    <p className="text-sm text-cream/40">Direct visit.</p>
                  )}
              </dl>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
