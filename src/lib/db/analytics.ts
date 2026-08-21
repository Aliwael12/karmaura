import "server-only";

import { createAdminSupabase } from "@/lib/supabase/server";
import type { OrderAttribution } from "@/lib/supabase/types";

const DAY = 86_400_000;

export type Point = { date: string; current: number; previous: number };
export type Kpi = {
  current: number;
  previous: number;
  changePct: number | null;
  sparkline: number[];
};
export type Breakdown = { label: string; current: number; previous: number };

export type AnalyticsRange = {
  start?: string | null;
  end?: string | null;
  compareStart?: string | null;
  compareEnd?: string | null;
  compare?: string | null;
  days?: number;
};

export type Analytics = {
  range: {
    days: number;
    currentStart: string;
    currentEnd: string;
    previousStart: string | null;
    previousEnd: string | null;
  };
  kpis: Record<
    | "grossSales"
    | "netSales"
    | "orders"
    | "deliveredOrders"
    | "sessions"
    | "conversionRate"
    | "avgOrderValue"
    | "returningCustomerRate",
    Kpi
  >;
  series: Record<
    | "sales"
    | "netSales"
    | "orders"
    | "deliveredOrders"
    | "sessions"
    | "conversionRate"
    | "avgOrderValue",
    Point[]
  >;
  breakdowns: Record<
    | "productSales"
    | "productUnits"
    | "categorySales"
    | "locations"
    | "socialReferrers"
    | "salesByReferrer"
    | "salesBySocialReferrer"
    | "utmSource"
    | "utmMedium"
    | "utmCampaign",
    Breakdown[]
  >;
};

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function startOfUtcDay(ms: number) {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function parseIso(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(ms) ? null : ms;
}

function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return curr === 0 ? 0 : null;
  return ((curr - prev) / prev) * 100;
}

function emptyBuckets(start: number, days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: isoDay(start + i * DAY),
    value: 0,
  }));
}

type Dated = { at: number };

function bucketize<T extends Dated>(
  items: T[],
  extract: (item: T) => number,
  start: number,
  days: number,
) {
  const buckets = emptyBuckets(start, days);
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const item of items) {
    const i = index.get(isoDay(startOfUtcDay(item.at)));
    if (i === undefined) continue;
    buckets[i].value += extract(item);
  }
  return buckets;
}

const combine = (
  curr: { date: string; value: number }[],
  prev: { date: string; value: number }[],
): Point[] =>
  curr.map((c, i) => ({
    date: c.date,
    current: c.value,
    previous: prev[i]?.value ?? 0,
  }));

const sum = (b: { value: number }[]) => b.reduce((n, x) => n + x.value, 0);

function rank(
  curr: Map<string, number>,
  prev: Map<string, number>,
): Breakdown[] {
  return Array.from(new Set([...curr.keys(), ...prev.keys()]))
    .map((label) => ({
      label,
      current: curr.get(label) ?? 0,
      previous: prev.get(label) ?? 0,
    }))
    .sort((a, b) => b.current - a.current);
}

type OrderLite = {
  at: number;
  subtotal: number;
  total: number;
  status: string;
  email: string;
  attribution: OrderAttribution;
  items: { name: string; category: string; price: number; qty: number }[];
};

type SessionLite = {
  at: number;
  referrerHost: string | null;
  socialReferrer: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

export async function getAnalytics(range: AnalyticsRange): Promise<Analytics> {
  /* ── resolve the two windows ───────────────────────────────────────── */
  const startParam = parseIso(range.start);
  const endParam = parseIso(range.end);

  let periodStart: number;
  let periodEnd: number; // exclusive
  let days: number;

  if (startParam !== null && endParam !== null && endParam >= startParam) {
    periodStart = startParam;
    periodEnd = endParam + DAY;
    days = Math.max(1, Math.round((periodEnd - periodStart) / DAY));
  } else {
    days = Math.min(365, Math.max(1, Number(range.days ?? 30)));
    periodEnd = startOfUtcDay(Date.now()) + DAY;
    periodStart = periodEnd - days * DAY;
  }

  const noCompare = range.compare === "none";
  const compStart = parseIso(range.compareStart);
  const compEnd = parseIso(range.compareEnd);

  let prevStart: number;
  let prevEnd: number;
  if (noCompare) {
    prevStart = periodStart;
    prevEnd = periodStart;
  } else if (compStart !== null && compEnd !== null && compEnd >= compStart) {
    prevStart = compStart;
    prevEnd = compEnd + DAY;
  } else {
    prevStart = periodStart - days * DAY;
    prevEnd = periodStart;
  }

  const compareDays = noCompare
    ? 0
    : Math.max(0, Math.round((prevEnd - prevStart) / DAY));
  const floor = Math.min(periodStart, prevStart);

  /* ── fetch only what the windows need ──────────────────────────────── */
  const db = createAdminSupabase();
  const floorIso = new Date(floor).toISOString();

  const [orderRes, sessionRes] = await Promise.all([
    db
      .from("orders")
      .select(
        "placed_at, subtotal, total, status, customer_email, attribution, order_items(product_name, unit_price, quantity, products(categories(name)))",
      )
      .gte("placed_at", floorIso)
      .order("placed_at", { ascending: false }),
    db
      .from("sessions")
      .select("created_at, referrer_host, social_referrer, country, region, city")
      .gte("created_at", floorIso)
      .order("created_at", { ascending: false }),
  ]);

  if (orderRes.error) throw new Error(orderRes.error.message);
  if (sessionRes.error) throw new Error(sessionRes.error.message);

  type RawItem = {
    product_name: string;
    unit_price: number;
    quantity: number;
    products: { categories: { name: string } | null } | null;
  };

  const orders: OrderLite[] = (orderRes.data ?? []).map((o) => {
    const row = o as unknown as {
      placed_at: string;
      subtotal: number;
      total: number;
      status: string;
      customer_email: string;
      attribution: OrderAttribution;
      order_items: RawItem[] | null;
    };
    return {
      at: new Date(row.placed_at).getTime(),
      subtotal: Number(row.subtotal ?? 0),
      total: Number(row.total ?? 0),
      status: String(row.status ?? "pending"),
      email: String(row.customer_email ?? "").toLowerCase(),
      attribution: row.attribution ?? {},
      items: (row.order_items ?? []).map((i) => ({
        name: i.product_name,
        category: i.products?.categories?.name ?? "Uncategorised",
        price: Number(i.unit_price ?? 0),
        qty: Number(i.quantity ?? 0),
      })),
    };
  });

  const sessions: SessionLite[] = (sessionRes.data ?? []).map((s) => {
    const row = s as unknown as {
      created_at: string;
      referrer_host: string | null;
      social_referrer: string | null;
      country: string | null;
      region: string | null;
      city: string | null;
    };
    return {
      at: new Date(row.created_at).getTime(),
      referrerHost: row.referrer_host,
      socialReferrer: row.social_referrer,
      country: row.country,
      region: row.region,
      city: row.city,
    };
  });

  const inWindow = <T extends Dated>(list: T[], from: number, to: number) =>
    list.filter((x) => x.at >= from && x.at < to);

  const curOrders = inWindow(orders, periodStart, periodEnd);
  const prvOrders = noCompare ? [] : inWindow(orders, prevStart, prevEnd);
  const curSessions = inWindow(sessions, periodStart, periodEnd);
  const prvSessions = noCompare ? [] : inWindow(sessions, prevStart, prevEnd);

  const cancelled = (o: OrderLite) => o.status === "cancelled";
  const delivered = (o: OrderLite) => o.status === "delivered";

  /* ── series ────────────────────────────────────────────────────────── */
  const salesCur = bucketize(curOrders, (o) => o.subtotal, periodStart, days);
  const salesPrv = bucketize(prvOrders, (o) => o.subtotal, prevStart, compareDays);

  const netCur = bucketize(curOrders, (o) => (cancelled(o) ? 0 : o.subtotal), periodStart, days);
  const netPrv = bucketize(prvOrders, (o) => (cancelled(o) ? 0 : o.subtotal), prevStart, compareDays);

  const ordCur = bucketize(curOrders, () => 1, periodStart, days);
  const ordPrv = bucketize(prvOrders, () => 1, prevStart, compareDays);

  const delCur = bucketize(curOrders, (o) => (delivered(o) ? 1 : 0), periodStart, days);
  const delPrv = bucketize(prvOrders, (o) => (delivered(o) ? 1 : 0), prevStart, compareDays);

  const sesCur = bucketize(curSessions, () => 1, periodStart, days);
  const sesPrv = bucketize(prvSessions, () => 1, prevStart, compareDays);

  const aovCur = salesCur.map((b, i) => ({
    date: b.date,
    value: ordCur[i].value ? b.value / ordCur[i].value : 0,
  }));
  const aovPrv = salesPrv.map((b, i) => ({
    date: b.date,
    value: ordPrv[i]?.value ? b.value / ordPrv[i].value : 0,
  }));

  const convCur = ordCur.map((b, i) => ({
    date: b.date,
    value: sesCur[i].value ? (b.value / sesCur[i].value) * 100 : 0,
  }));
  const convPrv = ordPrv.map((b, i) => ({
    date: b.date,
    value: sesPrv[i]?.value ? (b.value / sesPrv[i].value) * 100 : 0,
  }));

  /* ── breakdowns ────────────────────────────────────────────────────── */
  const tally = (
    list: OrderLite[],
    key: (i: OrderLite["items"][number]) => string,
    value: (i: OrderLite["items"][number]) => number,
  ) => {
    const map = new Map<string, number>();
    for (const o of list) {
      for (const item of o.items) {
        map.set(key(item), (map.get(key(item)) ?? 0) + value(item));
      }
    }
    return map;
  };

  const money = (i: OrderLite["items"][number]) => i.price * i.qty;
  const units = (i: OrderLite["items"][number]) => i.qty;
  const byName = (i: OrderLite["items"][number]) => i.name;
  const byCat = (i: OrderLite["items"][number]) => i.category;

  const locations = (list: SessionLite[]) => {
    const map = new Map<string, number>();
    for (const s of list) {
      if (!s.country) continue;
      const label = [s.country, s.region, s.city].filter(Boolean).join(" · ");
      map.set(label, (map.get(label) ?? 0) + 1);
    }
    return map;
  };

  const socials = (list: SessionLite[]) => {
    const map = new Map<string, number>();
    for (const s of list) {
      if (!s.socialReferrer) continue;
      map.set(s.socialReferrer, (map.get(s.socialReferrer) ?? 0) + 1);
    }
    return map;
  };

  /* Revenue by channel. Orders carry their own attribution, so this is exact
     rather than the proportional guess a session-share split would give. */
  const salesByChannel = (list: OrderLite[], socialOnly: boolean) => {
    const map = new Map<string, number>();
    for (const o of list) {
      const a = o.attribution ?? {};
      const channel =
        a.utm?.source || a.social_referrer || a.referrer_host || "direct";
      if (socialOnly && !a.social_referrer) continue;
      const label = socialOnly ? (a.social_referrer as string) : channel;
      map.set(label, (map.get(label) ?? 0) + o.subtotal);
    }
    return map;
  };

  const salesByUtm = (list: OrderLite[], dim: "source" | "medium" | "campaign") => {
    const map = new Map<string, number>();
    for (const o of list) {
      const value = o.attribution?.utm?.[dim];
      if (!value) continue;
      map.set(value, (map.get(value) ?? 0) + o.subtotal);
    }
    return map;
  };

  const returningRate = (list: OrderLite[]) => {
    const counts = new Map<string, number>();
    for (const o of list) {
      if (!o.email) continue;
      counts.set(o.email, (counts.get(o.email) ?? 0) + 1);
    }
    if (counts.size === 0) return 0;
    const returning = [...counts.values()].filter((n) => n > 1).length;
    return (returning / counts.size) * 100;
  };

  /* ── totals ────────────────────────────────────────────────────────── */
  const t = {
    sales: sum(salesCur),
    salesPrev: sum(salesPrv),
    net: sum(netCur),
    netPrev: sum(netPrv),
    orders: sum(ordCur),
    ordersPrev: sum(ordPrv),
    delivered: sum(delCur),
    deliveredPrev: sum(delPrv),
    sessions: sum(sesCur),
    sessionsPrev: sum(sesPrv),
  };

  const aov = t.orders ? t.sales / t.orders : 0;
  const aovPrev = t.ordersPrev ? t.salesPrev / t.ordersPrev : 0;
  const conv = t.sessions ? (t.orders / t.sessions) * 100 : 0;
  const convPrev = t.sessionsPrev ? (t.ordersPrev / t.sessionsPrev) * 100 : 0;
  const ret = returningRate(curOrders);
  const retPrev = returningRate(prvOrders);

  const kpi = (current: number, previous: number, sparkline: number[]): Kpi => ({
    current,
    previous,
    changePct: pctChange(current, previous),
    sparkline,
  });

  return {
    range: {
      days,
      currentStart: isoDay(periodStart),
      currentEnd: isoDay(periodEnd - DAY),
      previousStart: noCompare ? null : isoDay(prevStart),
      previousEnd: noCompare ? null : isoDay(prevEnd - DAY),
    },
    kpis: {
      grossSales: kpi(t.sales, t.salesPrev, salesCur.map((b) => b.value)),
      netSales: kpi(t.net, t.netPrev, netCur.map((b) => b.value)),
      orders: kpi(t.orders, t.ordersPrev, ordCur.map((b) => b.value)),
      deliveredOrders: kpi(t.delivered, t.deliveredPrev, delCur.map((b) => b.value)),
      sessions: kpi(t.sessions, t.sessionsPrev, sesCur.map((b) => b.value)),
      conversionRate: kpi(conv, convPrev, convCur.map((b) => b.value)),
      avgOrderValue: kpi(aov, aovPrev, aovCur.map((b) => b.value)),
      returningCustomerRate: kpi(ret, retPrev, []),
    },
    series: {
      sales: combine(salesCur, salesPrv),
      netSales: combine(netCur, netPrv),
      orders: combine(ordCur, ordPrv),
      deliveredOrders: combine(delCur, delPrv),
      sessions: combine(sesCur, sesPrv),
      conversionRate: combine(convCur, convPrv),
      avgOrderValue: combine(aovCur, aovPrv),
    },
    breakdowns: {
      productSales: rank(tally(curOrders, byName, money), tally(prvOrders, byName, money)),
      productUnits: rank(tally(curOrders, byName, units), tally(prvOrders, byName, units)),
      categorySales: rank(tally(curOrders, byCat, money), tally(prvOrders, byCat, money)),
      locations: rank(locations(curSessions), locations(prvSessions)),
      socialReferrers: rank(socials(curSessions), socials(prvSessions)),
      salesByReferrer: rank(salesByChannel(curOrders, false), salesByChannel(prvOrders, false)),
      salesBySocialReferrer: rank(salesByChannel(curOrders, true), salesByChannel(prvOrders, true)),
      utmSource: rank(salesByUtm(curOrders, "source"), salesByUtm(prvOrders, "source")),
      utmMedium: rank(salesByUtm(curOrders, "medium"), salesByUtm(prvOrders, "medium")),
      utmCampaign: rank(salesByUtm(curOrders, "campaign"), salesByUtm(prvOrders, "campaign")),
    },
  };
}
