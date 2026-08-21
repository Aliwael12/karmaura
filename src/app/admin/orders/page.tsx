import Link from "next/link";
import { requireAdmin } from "@/lib/db/auth";
import { createAdminSupabase } from "@/lib/supabase/server";
import { money } from "@/lib/commerce";
import { EmptyNote, PageHead, Panel, StatusPill, fmtEgp } from "../ui";
import type { OrderStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const STATUSES: (OrderStatus | "all")[] = [
  "all",
  "pending",
  "approved",
  "delivered",
  "cancelled",
];

const SORTS = {
  recent: { label: "Newest", column: "placed_at", ascending: false },
  oldest: { label: "Oldest", column: "placed_at", ascending: true },
  largest: { label: "Largest", column: "total", ascending: false },
} as const;

type SortKey = keyof typeof SORTS;

type Row = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  ship_city: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  placed_at: string;
  order_items: { quantity: number }[] | null;
};

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const status = (STATUSES as string[]).includes(params.status ?? "")
    ? (params.status as OrderStatus | "all")
    : "all";
  const sortKey: SortKey = (Object.keys(SORTS) as SortKey[]).includes(
    params.sort as SortKey,
  )
    ? (params.sort as SortKey)
    : "recent";
  const sort = SORTS[sortKey];
  const q = (params.q ?? "").trim();

  const db = createAdminSupabase();
  let query = db
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, ship_city, subtotal, total, status, placed_at, order_items(quantity)",
    )
    .order(sort.column, { ascending: sort.ascending })
    .limit(200);

  if (status !== "all") query = query.eq("status", status);
  if (q) {
    query = query.or(
      `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%,ship_city.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Row[];

  const revenue = rows
    .filter((r) => r.status !== "cancelled")
    .reduce((n, r) => n + r.total, 0);

  const href = (next: Partial<{ status: string; sort: string; q: string }>) => {
    const sp = new URLSearchParams();
    const s = next.status ?? status;
    const so = next.sort ?? sortKey;
    const qq = next.q ?? q;
    if (s !== "all") sp.set("status", s);
    if (so !== "recent") sp.set("sort", so);
    if (qq) sp.set("q", qq);
    const query = sp.toString();
    return query ? `/admin/orders?${query}` : "/admin/orders";
  };

  return (
    <>
      <PageHead eyebrow="Orders" title="Everything that has been ordered">
        <p className="text-sm text-cream/50">
          {rows.length} shown · {fmtEgp(revenue)} excluding cancellations
        </p>
      </PageHead>

      <Panel className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={href({ status: s })}
              className={`rounded-lg border px-3.5 py-2 text-[11px] tracking-[.12em] uppercase transition-[background,color,border-color] duration-300 ${
                status === s
                  ? "border-gold bg-gold text-forest"
                  : "border-gold/25 text-cream/65 hover:border-gold/60 hover:text-cream"
              }`}
            >
              {s}
            </Link>
          ))}

          <span className="flex-1" />

          <form action="/admin/orders" className="flex gap-2">
            {status !== "all" && <input type="hidden" name="status" value={status} />}
            {sortKey !== "recent" && <input type="hidden" name="sort" value={sortKey} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Order, name, email, city"
              className="km-field km-field-dark !w-56 !py-2"
            />
            <button
              type="submit"
              className="rounded-lg border border-gold/35 px-4 py-2 text-[11px] tracking-[.12em] text-cream/80 uppercase hover:bg-gold hover:text-forest"
            >
              Find
            </button>
          </form>

          {(Object.keys(SORTS) as SortKey[]).map((k) => (
            <Link
              key={k}
              href={href({ sort: k })}
              className={`rounded-lg border px-3 py-2 text-[11px] tracking-[.12em] uppercase transition-colors duration-300 ${
                sortKey === k
                  ? "border-gold text-gold-bright"
                  : "border-gold/20 text-cream/50 hover:text-cream"
              }`}
            >
              {SORTS[k].label}
            </Link>
          ))}
        </div>
      </Panel>

      {rows.length === 0 ? (
        <EmptyNote>No orders match that</EmptyNote>
      ) : (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-gold/15 text-left text-[10px] tracking-[.2em] text-cream/45 uppercase">
                  <th className="py-2 pr-4 font-normal">Order</th>
                  <th className="py-2 pr-4 font-normal">Placed</th>
                  <th className="py-2 pr-4 font-normal">Customer</th>
                  <th className="py-2 pr-4 font-normal">City</th>
                  <th className="py-2 pr-4 font-normal">Pieces</th>
                  <th className="py-2 pr-4 font-normal">Status</th>
                  <th className="py-2 text-right font-normal">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const pieces = (o.order_items ?? []).reduce(
                    (n, i) => n + i.quantity,
                    0,
                  );
                  return (
                    <tr key={o.id} className="border-b border-gold/10 last:border-0">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/orders/${o.order_number}`}
                          className="text-cream hover:text-gold-bright"
                        >
                          {o.order_number}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-cream/55">
                        {new Date(o.placed_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="py-3 pr-4 text-cream/75">
                        {o.customer_name}
                        <span className="block text-[11px] text-cream/40">
                          {o.customer_email}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-cream/55">{o.ship_city}</td>
                      <td className="py-3 pr-4 tabular-nums text-cream/55">{pieces}</td>
                      <td className="py-3 pr-4">
                        <StatusPill status={o.status} />
                      </td>
                      <td className="py-3 text-right tabular-nums text-cream/80">
                        {money(o.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length === 200 && (
            <p className="mt-4 text-[11px] text-cream/35">
              Showing the first 200 — narrow the search to see more.
            </p>
          )}
        </Panel>
      )}
    </>
  );
}
