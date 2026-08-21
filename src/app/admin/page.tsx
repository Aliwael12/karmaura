import Link from "next/link";
import { requireAdmin } from "@/lib/db/auth";
import { getAnalytics } from "@/lib/db/analytics";
import { createAdminSupabase } from "@/lib/supabase/server";
import { money } from "@/lib/commerce";
import { EmptyNote, PageHead, Panel, Stat, StatusPill, fmtEgp, fmtNum } from "./ui";

export const dynamic = "force-dynamic";

type Recent = {
  id: string;
  order_number: string;
  customer_name: string;
  ship_city: string;
  total: number;
  status: string;
  placed_at: string;
};

export default async function AdminOverview() {
  await requireAdmin();

  const db = createAdminSupabase();
  const [analytics, recent, counts] = await Promise.all([
    getAnalytics({ days: 30 }),
    db
      .from("orders")
      .select("id, order_number, customer_name, ship_city, total, status, placed_at")
      .order("placed_at", { ascending: false })
      .limit(8),
    Promise.all([
      db.from("orders").select("id", { count: "exact", head: true }),
      db.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      db.from("profiles").select("id", { count: "exact", head: true }),
      db.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
      db.from("repairs").select("id", { count: "exact", head: true }).neq("status", "closed"),
      db.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("products").select("id", { count: "exact", head: true }).lte("stock", 3).eq("is_active", true),
    ]),
  ]);

  const [orderCount, productCount, customerCount, newMessages, openRepairs, pending, lowStock] =
    counts.map((c) => c.count ?? 0);

  const rows = (recent.data ?? []) as unknown as Recent[];
  const k = analytics.kpis;

  return (
    <>
      <PageHead eyebrow="The back room" title="How the shop is doing">
        <p className="text-[11px] tracking-[.16em] text-cream/45 uppercase">
          Last 30 days
        </p>
      </PageHead>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Revenue"
          value={fmtEgp(k.netSales.current)}
          hint="net of cancellations"
          href="/admin/analytics"
        />
        <Stat
          label="Orders"
          value={fmtNum(k.orders.current)}
          hint={`${fmtNum(k.deliveredOrders.current)} delivered`}
          href="/admin/orders"
        />
        <Stat
          label="Avg order"
          value={fmtEgp(k.avgOrderValue.current)}
          hint={`${fmtNum(k.sessions.current)} sessions`}
          href="/admin/analytics"
        />
        <Stat
          label="Lifetime"
          value={fmtNum(orderCount)}
          hint="orders, all time"
          href="/admin/orders"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Awaiting review" value={fmtNum(pending)} href="/admin/orders?status=pending" />
        <Stat label="Low stock" value={fmtNum(lowStock)} hint="3 or fewer left" href="/admin/products" />
        <Stat label="New messages" value={fmtNum(newMessages)} href="/admin/inbox" />
        <Stat label="Open repairs" value={fmtNum(openRepairs)} href="/admin/inbox" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Panel
          title="Latest orders"
          action={
            <Link
              href="/admin/orders"
              className="text-[11px] tracking-[.14em] text-gold-bright uppercase hover:underline hover:underline-offset-4"
            >
              All orders
            </Link>
          }
        >
          {rows.length === 0 ? (
            <EmptyNote>Nothing has been ordered yet</EmptyNote>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-gold/15 text-left text-[10px] tracking-[.2em] text-cream/45 uppercase">
                    <th className="py-2 pr-4 font-normal">Order</th>
                    <th className="py-2 pr-4 font-normal">Customer</th>
                    <th className="py-2 pr-4 font-normal">Status</th>
                    <th className="py-2 text-right font-normal">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id} className="border-b border-gold/10 last:border-0">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/orders/${o.order_number}`}
                          className="text-cream hover:text-gold-bright"
                        >
                          {o.order_number}
                        </Link>
                        <span className="block text-[11px] text-cream/40">
                          {new Date(o.placed_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-cream/75">
                        {o.customer_name}
                        <span className="block text-[11px] text-cream/40">
                          {o.ship_city}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusPill status={o.status} />
                      </td>
                      <td className="py-3 text-right tabular-nums text-cream/75">
                        {money(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="The shop">
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-cream/55">Pieces listed</dt>
                <dd className="text-cream">{fmtNum(productCount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream/55">Customers</dt>
                <dd className="text-cream">{fmtNum(customerCount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream/55">Conversion</dt>
                <dd className="text-cream">
                  {k.conversionRate.current.toFixed(2)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-cream/55">Returning</dt>
                <dd className="text-cream">
                  {k.returningCustomerRate.current.toFixed(1)}%
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Best sellers">
            {analytics.breakdowns.productUnits.length === 0 ? (
              <p className="py-4 text-sm text-cream/40">Nothing sold yet.</p>
            ) : (
              <ul className="flex flex-col gap-2.5 text-sm">
                {analytics.breakdowns.productUnits.slice(0, 5).map((p) => (
                  <li key={p.label} className="flex justify-between gap-4">
                    <span className="truncate text-cream/80">{p.label}</span>
                    <span className="shrink-0 tabular-nums text-cream/50">
                      {fmtNum(p.current)} sold
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
