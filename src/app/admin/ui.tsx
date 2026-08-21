import Link from "next/link";
import { money } from "@/lib/commerce";
import type { Breakdown, Kpi, Point } from "@/lib/db/analytics";

/* ── shared chrome ─────────────────────────────────────────────────────*/

export function PageHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5 py-9">
      <div>
        <p className="km-eyebrow mb-3 text-gold-bright">{eyebrow}</p>
        <h1 className="font-serif text-[clamp(26px,4vw,42px)] leading-[1.06] text-cream">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-gold/20 bg-forest-deep/60 p-[clamp(18px,2.5vw,26px)] ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="km-label text-cream/70">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-[10px] tracking-[.3em] text-cream/50 uppercase">
        {label}
      </p>
      <p className="mt-2 font-serif text-[clamp(24px,3vw,34px)] leading-none text-cream">
        {value}
      </p>
      {hint && <p className="mt-2 text-[11px] text-cream/40">{hint}</p>}
    </>
  );

  const shell =
    "rounded-lg border border-gold/20 bg-forest-deep/50 p-5 transition-[border-color,background] duration-300";

  return href ? (
    <Link href={href} className={`${shell} hover:border-gold/50 hover:bg-forest-deep`}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}

/* ── analytics pieces ──────────────────────────────────────────────────*/

export const fmtEgp = (n: number) => money(Math.round(n));
export const fmtNum = (n: number) => Math.round(n).toLocaleString("en-US");
export const fmtPct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

function Delta({ pct }: { pct: number | null }) {
  if (pct === null) {
    return <span className="text-[11px] text-cream/35">no prior data</span>;
  }
  const flat = Math.abs(pct) < 0.05;
  const up = pct > 0;
  return (
    <span
      className={`text-[11px] tabular-nums ${
        flat ? "text-cream/40" : up ? "text-lime-300/80" : "text-gold-bright"
      }`}
    >
      {flat ? "—" : `${up ? "▲" : "▼"} ${Math.abs(pct).toFixed(1)}%`}
    </span>
  );
}

/** A bare polyline — enough to read the shape, no charting dependency. */
function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const step = 100 / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(2)},${(28 - (v / max) * 26).toFixed(2)}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="mt-3 h-7 w-full">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        className="text-gold"
      />
    </svg>
  );
}

export function KpiCard({
  label,
  kpi,
  format,
}: {
  label: string;
  kpi: Kpi;
  format: (n: number) => string;
}) {
  return (
    <div className="rounded-lg border border-gold/20 bg-forest-deep/50 p-5">
      <p className="text-[10px] tracking-[.3em] text-cream/50 uppercase">{label}</p>
      <p className="mt-2 font-serif text-[clamp(22px,2.6vw,30px)] leading-none text-cream">
        {format(kpi.current)}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <Delta pct={kpi.changePct} />
        {kpi.previous > 0 && (
          <span className="text-[11px] text-cream/35">
            was {format(kpi.previous)}
          </span>
        )}
      </div>
      <Spark values={kpi.sparkline} />
    </div>
  );
}

/**
 * Two overlaid lines — the window and the one it is being compared with —
 * drawn straight from the series rather than through a charting library, so
 * the admin ships no extra JavaScript for it.
 */
export function TrendChart({
  title,
  total,
  kpi,
  series,
  format,
}: {
  title: string;
  total: string;
  kpi: Kpi;
  series: Point[];
  format: (n: number) => string;
}) {
  if (series.length === 0) {
    return (
      <Panel title={title}>
        <p className="py-8 text-sm text-cream/40">Nothing in this range yet.</p>
      </Panel>
    );
  }

  const max = Math.max(1, ...series.map((p) => Math.max(p.current, p.previous)));
  const step = series.length > 1 ? 100 / (series.length - 1) : 0;
  const line = (pick: (p: Point) => number) =>
    series
      .map((p, i) => `${(i * step).toFixed(2)},${(60 - (pick(p) / max) * 56).toFixed(2)}`)
      .join(" ");

  const first = series[0]?.date ?? "";
  const last = series[series.length - 1]?.date ?? "";

  return (
    <Panel
      title={title}
      action={
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-xl text-cream">{total}</span>
          <Delta pct={kpi.changePct} />
        </div>
      }
    >
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-40 w-full">
        <polyline
          points={line((p) => p.previous)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
          className="text-cream/25"
        />
        <polyline
          points={line((p) => p.current)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          vectorEffect="non-scaling-stroke"
          className="text-gold-bright"
        />
      </svg>
      <div className="mt-2 flex items-center justify-between text-[10px] text-cream/40">
        <span>{first}</span>
        <span className="text-cream/30">peak {format(max)}</span>
        <span>{last}</span>
      </div>
    </Panel>
  );
}

export function BreakdownTable({
  title,
  rows,
  format,
  limit = 8,
  emptyNote = "Nothing recorded in this range.",
}: {
  title: string;
  rows: Breakdown[];
  format: (n: number) => string;
  limit?: number;
  emptyNote?: string;
}) {
  const shown = rows.filter((r) => r.current > 0 || r.previous > 0).slice(0, limit);
  const max = Math.max(1, ...shown.map((r) => r.current));
  const hidden = rows.length - shown.length;

  return (
    <Panel title={title}>
      {shown.length === 0 ? (
        <p className="py-6 text-sm text-cream/40">{emptyNote}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((row) => (
            <li key={row.label}>
              <div className="mb-1 flex items-baseline justify-between gap-4">
                <span className="truncate text-sm text-cream/85">{row.label}</span>
                <span className="shrink-0 text-sm tabular-nums text-cream/60">
                  {format(row.current)}
                </span>
              </div>
              <div className="h-1 rounded-full bg-cream/10">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${Math.max(2, (row.current / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {hidden > 0 && (
        <p className="mt-4 text-[11px] text-cream/35">
          {hidden} more not shown
        </p>
      )}
    </Panel>
  );
}

/* ── order status pill ─────────────────────────────────────────────────*/

const STATUS_STYLE: Record<string, string> = {
  pending: "border-cream/30 text-cream/70",
  approved: "border-sky-400/50 text-sky-300",
  delivered: "border-lime-400/50 text-lime-300",
  cancelled: "border-gold/60 text-gold-bright",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-md border px-3 py-1 text-[10px] tracking-[.14em] uppercase ${
        STATUS_STYLE[status] ?? STATUS_STYLE.pending
      }`}
    >
      {status}
    </span>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-gold/15 bg-forest-deep/40 px-6 py-14 text-center font-serif text-xl text-cream/50 italic">
      {children}
    </p>
  );
}
