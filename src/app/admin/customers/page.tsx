import { requireAdmin } from "@/lib/db/auth";
import { createAdminSupabase } from "@/lib/supabase/server";
import { money } from "@/lib/commerce";
import { EmptyNote, PageHead, Panel, fmtEgp } from "../ui";
import AdminToggle from "./AdminToggle";
import type { ProfileRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminCustomers() {
  const viewer = await requireAdmin();
  const db = createAdminSupabase();

  const [profilesRes, ordersRes] = await Promise.all([
    db.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
    db.from("orders").select("customer_email, total, status"),
  ]);

  if (profilesRes.error) throw new Error(profilesRes.error.message);

  const profiles = (profilesRes.data ?? []) as unknown as ProfileRow[];
  const orders = (ordersRes.data ?? []) as unknown as {
    customer_email: string;
    total: number;
    status: string;
  }[];

  /* Spend is matched by email so a guest order placed before signing up still
     counts toward the person who later made a profile with that address. */
  const spend = new Map<string, { count: number; total: number }>();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const key = o.customer_email.toLowerCase();
    const cur = spend.get(key) ?? { count: 0, total: 0 };
    spend.set(key, { count: cur.count + 1, total: cur.total + o.total });
  }

  const guestEmails = [...spend.keys()].filter(
    (e) => !profiles.some((p) => p.email.toLowerCase() === e),
  );

  return (
    <>
      <PageHead eyebrow="Customers" title="Everyone with a profile">
        <p className="text-sm text-cream/50">
          {profiles.length} with profiles · {guestEmails.length} guest-only
        </p>
      </PageHead>

      {profiles.length === 0 ? (
        <EmptyNote>Nobody has made a profile yet</EmptyNote>
      ) : (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-gold/15 text-left text-[10px] tracking-[.2em] text-cream/45 uppercase">
                  <th className="py-2 pr-4 font-normal">Name</th>
                  <th className="py-2 pr-4 font-normal">Email</th>
                  <th className="py-2 pr-4 font-normal">Joined</th>
                  <th className="py-2 pr-4 font-normal">Orders</th>
                  <th className="py-2 pr-4 font-normal">Spent</th>
                  <th className="py-2 text-right font-normal">Admin</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const s = spend.get(p.email.toLowerCase());
                  return (
                    <tr key={p.id} className="border-b border-gold/10 last:border-0">
                      <td className="py-3 pr-4 text-cream/80">
                        {p.full_name || "—"}
                        {p.phone && (
                          <span className="block text-[11px] text-cream/40">
                            {p.phone}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-cream/60">{p.email}</td>
                      <td className="py-3 pr-4 text-cream/50">
                        {new Date(p.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-cream/60">
                        {s?.count ?? 0}
                      </td>
                      <td className="py-3 pr-4 tabular-nums text-cream/60">
                        {money(s?.total ?? 0)}
                      </td>
                      <td className="py-3 text-right">
                        <AdminToggle
                          userId={p.id}
                          isAdmin={p.is_admin}
                          isSelf={p.id === viewer.id}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {guestEmails.length > 0 && (
        <Panel title="Ordered without a profile" className="mt-6">
          <ul className="flex flex-col gap-2 text-sm">
            {guestEmails.slice(0, 40).map((email) => {
              const s = spend.get(email)!;
              return (
                <li key={email} className="flex justify-between gap-4">
                  <span className="truncate text-cream/70">{email}</span>
                  <span className="shrink-0 tabular-nums text-cream/45">
                    {s.count} order{s.count === 1 ? "" : "s"} · {fmtEgp(s.total)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </>
  );
}
