import Link from "next/link";
import { requireAdmin } from "@/lib/db/auth";
import { getAnalytics } from "@/lib/db/analytics";
import {
  BreakdownTable,
  KpiCard,
  PageHead,
  TrendChart,
  fmtEgp,
  fmtNum,
  fmtPct,
} from "../ui";

export const dynamic = "force-dynamic";

const PRESETS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
];

export default async function AdminAnalytics({
  searchParams,
}: {
  searchParams: Promise<{
    days?: string;
    start?: string;
    end?: string;
    compareStart?: string;
    compareEnd?: string;
    compare?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const days = Number(params.days ?? 30);
  const analytics = await getAnalytics({
    days: Number.isFinite(days) ? days : 30,
    start: params.start,
    end: params.end,
    compareStart: params.compareStart,
    compareEnd: params.compareEnd,
    compare: params.compare,
  });

  const { kpis, series, breakdowns, range } = analytics;
  const custom = Boolean(params.start && params.end);

  return (
    <>
      <PageHead eyebrow="Analytics" title="Where the shop stands">
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <Link
              key={p.days}
              href={`/admin/analytics?days=${p.days}`}
              className={`rounded-lg border px-3.5 py-2 text-[11px] tracking-[.12em] uppercase transition-colors duration-300 ${
                !custom && range.days === p.days
                  ? "border-gold bg-gold text-forest"
                  : "border-gold/25 text-cream/65 hover:border-gold/60 hover:text-cream"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </PageHead>

      <form
        action="/admin/analytics"
        className="mb-8 flex flex-wrap items-end gap-3 rounded-lg border border-gold/20 bg-forest-deep/50 p-5"
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[.2em] text-cream/45 uppercase">From</span>
          <input
            type="date"
            name="start"
            defaultValue={range.currentStart}
            className="km-field km-field-dark !w-44 !py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[.2em] text-cream/45 uppercase">To</span>
          <input
            type="date"
            name="end"
            defaultValue={range.currentEnd}
            className="km-field km-field-dark !w-44 !py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[.2em] text-cream/45 uppercase">
            Compare from
          </span>
          <input
            type="date"
            name="compareStart"
            defaultValue={range.previousStart ?? ""}
            className="km-field km-field-dark !w-44 !py-2"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] tracking-[.2em] text-cream/45 uppercase">
            Compare to
          </span>
          <input
            type="date"
            name="compareEnd"
            defaultValue={range.previousEnd ?? ""}
            className="km-field km-field-dark !w-44 !py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg border border-gold px-5 py-2.5 text-[11px] tracking-[.14em] text-cream uppercase hover:bg-gold hover:text-forest"
        >
          Apply
        </button>
        <p className="ml-auto text-[11px] text-cream/40">
          {range.currentStart} → {range.currentEnd}
          {range.previousStart && (
            <>
              {" "}
              vs {range.previousStart} → {range.previousEnd}
            </>
          )}
        </p>
      </form>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Gross sales" kpi={kpis.grossSales} format={fmtEgp} />
        <KpiCard label="Net sales" kpi={kpis.netSales} format={fmtEgp} />
        <KpiCard label="Orders" kpi={kpis.orders} format={fmtNum} />
        <KpiCard label="Delivered" kpi={kpis.deliveredOrders} format={fmtNum} />
        <KpiCard label="Sessions" kpi={kpis.sessions} format={fmtNum} />
        <KpiCard
          label="Conversion"
          kpi={kpis.conversionRate}
          format={(n) => fmtPct(n, 2)}
        />
        <KpiCard label="Avg order" kpi={kpis.avgOrderValue} format={fmtEgp} />
        <KpiCard
          label="Returning"
          kpi={kpis.returningCustomerRate}
          format={(n) => fmtPct(n, 1)}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <TrendChart
          title="Total sales over time"
          total={fmtEgp(kpis.grossSales.current)}
          kpi={kpis.grossSales}
          series={series.sales}
          format={fmtEgp}
        />
        <TrendChart
          title="Orders over time"
          total={fmtNum(kpis.orders.current)}
          kpi={kpis.orders}
          series={series.orders}
          format={fmtNum}
        />
        <TrendChart
          title="Sessions over time"
          total={fmtNum(kpis.sessions.current)}
          kpi={kpis.sessions}
          series={series.sessions}
          format={fmtNum}
        />
        <TrendChart
          title="Conversion rate over time"
          total={fmtPct(kpis.conversionRate.current, 2)}
          kpi={kpis.conversionRate}
          series={series.conversionRate}
          format={(n) => fmtPct(n, 2)}
        />
        <TrendChart
          title="Average order value over time"
          total={fmtEgp(kpis.avgOrderValue.current)}
          kpi={kpis.avgOrderValue}
          series={series.avgOrderValue}
          format={fmtEgp}
        />
        <TrendChart
          title="Delivered orders over time"
          total={fmtNum(kpis.deliveredOrders.current)}
          kpi={kpis.deliveredOrders}
          series={series.deliveredOrders}
          format={fmtNum}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <BreakdownTable
          title="Sales by piece"
          rows={breakdowns.productSales}
          format={fmtEgp}
        />
        <BreakdownTable
          title="Pieces sold"
          rows={breakdowns.productUnits}
          format={fmtNum}
        />
        <BreakdownTable
          title="Sales by room"
          rows={breakdowns.categorySales}
          format={fmtEgp}
        />
        <BreakdownTable
          title="Sessions by location"
          rows={breakdowns.locations}
          format={fmtNum}
          emptyNote="No location data — this arrives from the host's geo headers in production."
        />
        <BreakdownTable
          title="Sessions by social referrer"
          rows={breakdowns.socialReferrers}
          format={fmtNum}
        />
        <BreakdownTable
          title="Sales by referrer"
          rows={breakdowns.salesByReferrer}
          format={fmtEgp}
        />
        <BreakdownTable
          title="Sales by social referrer"
          rows={breakdowns.salesBySocialReferrer}
          format={fmtEgp}
        />
        <BreakdownTable
          title="Sales by UTM source"
          rows={breakdowns.utmSource}
          format={fmtEgp}
        />
        <BreakdownTable
          title="Sales by UTM campaign"
          rows={breakdowns.utmCampaign}
          format={fmtEgp}
        />
        <BreakdownTable
          title="Sales by UTM medium"
          rows={breakdowns.utmMedium}
          format={fmtEgp}
        />
      </div>
    </>
  );
}
