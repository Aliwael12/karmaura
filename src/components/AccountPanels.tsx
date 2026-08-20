"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Star, Trash } from "@phosphor-icons/react/ssr";
import { useStore } from "@/context/store";
import { formatDate, money } from "@/lib/commerce";
import { getProduct } from "@/lib/products";
import ProductCard from "./ProductCard";

/* ── overview ─────────────────────────────────────────────────────── */

export function OverviewPanel() {
  const { orders, saved, addresses, repairs } = useStore();
  const latest = orders[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-4">
        <Stat value={orders.length} label="Orders" href="/account/orders" />
        <Stat value={saved.length} label="Saved pieces" href="/account/saved" />
        <Stat value={addresses.length} label="Addresses" href="/account/addresses" />
        <Stat value={repairs.length} label="Repairs" href="/account/repairs" />
      </div>

      {latest ? (
        <Card>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <p className="km-label text-cream/70">Latest order</p>
            <span className="rounded-md border border-gold/50 px-3 py-1 text-[11px] tracking-[.14em] text-gold-bright uppercase">
              {latest.status}
            </span>
          </div>
          <p className="font-serif text-2xl text-cream">{latest.id}</p>
          <p className="mt-1 mb-4 text-sm text-cream/60">
            {formatDate(latest.placedAt)} ·{" "}
            {latest.lines.map((l) => l.name).join(", ")}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-serif text-xl text-gold-bright">
              {money(latest.total)}
            </p>
            <Link href={`/order/${latest.id}`} className="km-arrow text-cream">
              See the order <ArrowRight size={15} weight="light" />
            </Link>
          </div>
        </Card>
      ) : (
        <Card>
          <p className="mb-4 font-serif text-2xl text-cream/70 italic">
            No orders yet
          </p>
          <Link href="/shop" className="km-btn km-btn-dark">
            Browse the collection
          </Link>
        </Card>
      )}

      {saved.length > 0 && (
        <Card>
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <p className="km-label text-cream/70">Saved pieces</p>
            <Link href="/account/saved" className="km-arrow text-cream">
              All saved <ArrowRight size={15} weight="light" />
            </Link>
          </div>
          <ul className="flex flex-col gap-3">
            {saved.slice(0, 3).map((id) => {
              const product = getProduct(id);
              if (!product) return null;
              return (
                <li
                  key={id}
                  className="flex items-baseline justify-between gap-4 border-b border-gold/12 pb-3 last:border-0 last:pb-0"
                >
                  <Link
                    href={`/shop/${id}`}
                    className="font-serif text-lg text-cream transition-colors duration-300 hover:text-gold-bright"
                  >
                    {product.name}
                  </Link>
                  <span className="text-sm text-cream/60">
                    {money(product.price)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ── orders ───────────────────────────────────────────────────────── */

export function OrdersPanel() {
  const { orders } = useStore();

  if (orders.length === 0) {
    return (
      <Empty
        line="Nothing has left the atelier for you yet"
        cta="Browse the collection"
        href="/shop"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="font-serif text-2xl text-cream">{order.id}</p>
              <p className="mt-1 text-sm text-cream/55">
                {formatDate(order.placedAt)}
              </p>
            </div>
            <span className="rounded-md border border-gold/50 px-3 py-1 text-[11px] tracking-[.14em] text-gold-bright uppercase">
              {order.status}
            </span>
          </div>

          <ul className="mb-4 flex flex-col gap-2">
            {order.lines.map((line) => (
              <li
                key={line.id}
                className="flex items-baseline justify-between gap-4 text-sm"
              >
                <Link
                  href={`/shop/${line.id}`}
                  className="text-cream/85 transition-colors duration-300 hover:text-gold-bright"
                >
                  {line.name}{" "}
                  <span className="text-cream/45">× {line.qty}</span>
                </Link>
                <span className="text-cream/60">
                  {money(line.qty * line.price)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gold/15 pt-4">
            <p className="font-serif text-xl text-gold-bright">
              {money(order.total)}
            </p>
            <Link href={`/order/${order.id}`} className="km-arrow text-cream">
              Order details <ArrowRight size={15} weight="light" />
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ── saved ────────────────────────────────────────────────────────── */

export function SavedPanel() {
  const { saved } = useStore();
  const products = saved
    .map((id) => getProduct(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length === 0) {
    return (
      <Empty
        line="Nothing saved yet — the heart on any piece keeps it here"
        cta="Browse the collection"
        href="/shop"
      />
    );
  }

  return (
    <div className="rounded-lg bg-cream p-[clamp(20px,3cqw,32px)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-[clamp(14px,2cqw,26px)]">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </div>
  );
}

/* ── addresses ────────────────────────────────────────────────────── */

const BLANK = {
  label: "",
  name: "",
  line1: "",
  city: "",
  postcode: "",
  country: "Egypt",
};

export function AddressesPanel() {
  const { addresses, addAddress, removeAddress, makeDefaultAddress } =
    useStore();
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.line1.trim() || !form.city.trim()) {
      setError("A name, a street and a city, at least.");
      return;
    }
    setError("");
    addAddress({ ...form, label: form.label.trim() || "Address" });
    setForm(BLANK);
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,290px),1fr))] items-start gap-6">
      <div className="flex flex-col gap-4">
        {addresses.length === 0 && (
          <p className="font-serif text-xl text-cream/60 italic">
            No addresses kept yet
          </p>
        )}
        {addresses.map((address) => (
          <Card key={address.id}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="km-label text-cream/70">{address.label}</p>
              {address.isDefault ? (
                <span className="flex items-center gap-1.5 text-[11px] tracking-[.14em] text-gold-bright uppercase">
                  <Star size={13} weight="fill" />
                  Default
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeDefaultAddress(address.id)}
                  className="text-[11px] tracking-[.14em] text-cream/50 uppercase transition-colors duration-300 hover:text-gold-bright"
                >
                  Make default
                </button>
              )}
            </div>
            <p className="text-sm leading-[1.7] text-cream/80">
              {address.name}
              <br />
              {address.line1}
              <br />
              {address.city} {address.postcode}
              <br />
              {address.country}
            </p>
            <button
              type="button"
              onClick={() => removeAddress(address.id)}
              className="mt-4 flex items-center gap-2 self-start text-[11px] tracking-[.14em] text-cream/45 uppercase transition-colors duration-300 hover:text-gold-bright"
            >
              <Trash size={14} weight="light" />
              Remove
            </button>
          </Card>
        ))}
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="rounded-lg border border-gold/25 bg-forest-deep/70 p-[clamp(20px,3cqw,30px)]"
      >
        <p className="km-label mb-5 text-cream/80">Keep another address</p>
        <div className="flex flex-col gap-3">
          <input
            className="km-field km-field-dark"
            placeholder="Label — Home, Studio"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
          <input
            className="km-field km-field-dark"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="km-field km-field-dark"
            placeholder="Street"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="km-field km-field-dark min-w-0"
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <input
              className="km-field km-field-dark min-w-0"
              placeholder="Postcode"
              value={form.postcode}
              onChange={(e) => setForm({ ...form, postcode: e.target.value })}
            />
          </div>
          <input
            className="km-field km-field-dark"
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
          {error && (
            <p role="alert" className="text-[13px] text-gold-bright">
              {error}
            </p>
          )}
          <button type="submit" className="km-btn km-btn-dark mt-1 w-full">
            Save the address
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── repairs ──────────────────────────────────────────────────────── */

export function RepairsPanel() {
  const { repairs } = useStore();

  if (repairs.length === 0) {
    return (
      <Empty
        line="Nothing is in for mending"
        cta="Open a repair"
        href="/visit#repairs"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {repairs.map((repair) => (
        <Card key={repair.id}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-serif text-xl text-cream">{repair.piece}</p>
            <span className="rounded-md border border-gold/50 px-3 py-1 text-[11px] tracking-[.14em] text-gold-bright uppercase">
              {repair.status}
            </span>
          </div>
          <p className="mb-2 text-sm leading-[1.7] text-cream/75">
            “{repair.note}”
          </p>
          <p className="text-xs text-cream/45">
            {repair.id} · opened {formatDate(repair.openedAt)}
          </p>
        </Card>
      ))}
      <Link href="/visit#repairs" className="km-btn km-btn-dark self-start">
        Open another repair
      </Link>
    </div>
  );
}

/* ── shared bits ──────────────────────────────────────────────────── */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-lg border border-gold/25 bg-forest-deep/70 p-[clamp(20px,3cqw,30px)]">
      {children}
    </div>
  );
}

function Stat({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gold/20 bg-forest-deep/50 p-5 transition-[border-color,background] duration-300 hover:border-gold/50 hover:bg-forest-deep"
    >
      <p className="font-serif text-[34px] leading-none text-gold-bright">
        {value}
      </p>
      <p className="mt-2 text-[11px] tracking-[.16em] text-cream/60 uppercase">
        {label}
      </p>
    </Link>
  );
}

function Empty({
  line,
  cta,
  href,
}: {
  line: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="rounded-lg border border-gold/20 bg-forest-deep/50 px-6 py-16 text-center">
      <p className="mb-6 font-serif text-2xl text-cream/65 italic">{line}</p>
      <Link href={href} className="km-btn km-btn-dark">
        {cta}
      </Link>
    </div>
  );
}
