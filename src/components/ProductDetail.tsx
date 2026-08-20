"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Heart, Minus, Plus } from "@phosphor-icons/react/ssr";
import { useStore } from "@/context/store";
import { money } from "@/lib/commerce";
import { categoryName, type Product } from "@/lib/products";
import ObjectArt from "./ObjectArt";
import Reveal from "./Reveal";

type View = {
  key: string;
  label: string;
  tone: "light" | "dark";
  zoom: number;
  origin: string;
};

const VIEWS: View[] = [
  { key: "full", label: "Full view", tone: "light", zoom: 1, origin: "center" },
  { key: "detail", label: "Detail", tone: "light", zoom: 2.4, origin: "50% 30%" },
  { key: "room", label: "In the room", tone: "dark", zoom: 1.15, origin: "center" },
  { key: "scale", label: "Scale", tone: "light", zoom: 1.45, origin: "50% 80%" },
];

export default function ProductDetail({ product }: { product: Product }) {
  const { addToCart, toggleSaved, isSaved, hydrated } = useStore();
  const [qty, setQty] = useState(1);
  const [view, setView] = useState(VIEWS[0]);
  const [open, setOpen] = useState<Record<string, boolean>>({
    material: true,
    dim: false,
    care: false,
  });

  const saved = hydrated && isSaved(product.id);
  const others = VIEWS.filter((v) => v.key !== view.key);

  function toggle(key: string) {
    setOpen((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className="min-h-full bg-cream-light text-forest">
      {/* ── breadcrumb ─────────────────────────────────────────── */}
      <div className="km-gutter flex items-center gap-2.5 border-b border-[rgba(95,106,66,.14)] py-[clamp(18px,2.6cqw,30px)] text-xs text-moss">
        <Link
          href="/shop"
          className="flex items-center gap-[7px] text-olive transition-[gap] duration-300 hover:gap-3"
        >
          <ArrowLeft size={15} weight="light" />
          The collection
        </Link>
        <span>/</span>
        <Link
          href={`/shop?room=${product.category}`}
          className="transition-colors duration-300 hover:text-brass"
        >
          {categoryName(product.category)}
        </Link>
      </div>

      <div
        className="km-gutter grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start"
        style={{
          gap: "clamp(24px,4cqw,60px)",
          paddingBlock: "clamp(26px,4cqw,60px)",
        }}
      >
        {/* ── gallery ───────────────────────────────────────────── */}
        <Reveal delay={0} className="relative flex flex-col gap-3">
          <figure className="m-0">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg bg-cream">
              <div
                className="size-full transition-transform duration-[900ms] ease-km"
                style={{ transform: `scale(${view.zoom})`, transformOrigin: view.origin }}
              >
                <ObjectArt
                  kind={product.art}
                  tone={view.tone}
                  className="size-full"
                />
              </div>
              <figcaption className="absolute bottom-3 left-3 rounded-md bg-forest/75 px-3 py-1.5 text-[10px] tracking-[.16em] text-cream uppercase">
                {view.label}
              </figcaption>
            </div>
          </figure>

          <div className="grid grid-cols-3 gap-3">
            {others.map((other) => (
              <button
                key={other.key}
                type="button"
                onClick={() => setView(other)}
                aria-label={`Show ${other.label}`}
                className="aspect-square overflow-hidden rounded-lg bg-cream ring-gold transition-shadow duration-300 hover:ring-2"
              >
                <div
                  className="size-full"
                  style={{
                    transform: `scale(${other.zoom})`,
                    transformOrigin: other.origin,
                  }}
                >
                  <ObjectArt
                    kind={product.art}
                    tone={other.tone}
                    className="size-full"
                  />
                </div>
              </button>
            ))}
          </div>
        </Reveal>

        {/* ── the description ───────────────────────────────────── */}
        <Reveal delay={120} className="max-w-[520px]">
          <p className="km-eyebrow mb-3.5 text-moss">
            {categoryName(product.category)}
          </p>
          <h1 className="font-serif text-[clamp(30px,5.6cqw,54px)] leading-[1.06]">
            {product.name}
          </h1>
          <p className="mt-3.5 font-serif text-[22px] text-brass italic">
            {money(product.price)}
          </p>

          <div
            className="km-rule w-full"
            style={{ marginBlock: "clamp(22px,3cqw,32px)" }}
          />

          <p className="mb-[26px] text-[15px] leading-[1.7] text-olive">
            {product.blurb}
          </p>

          <div className="mb-[18px] flex flex-wrap items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-lg border border-[rgba(95,106,66,.28)]">
              <button
                type="button"
                onClick={() => setQty((n) => Math.max(1, n - 1))}
                aria-label="Fewer"
                className="grid h-[50px] w-[46px] place-items-center text-olive transition-[background] duration-300 hover:bg-gold/15"
              >
                <Minus size={15} weight="light" />
              </button>
              <span
                aria-live="polite"
                className="min-w-[34px] text-center text-[15px]"
              >
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((n) => n + 1)}
                aria-label="More"
                className="grid h-[50px] w-[46px] place-items-center text-olive transition-[background] duration-300 hover:bg-gold/15"
              >
                <Plus size={15} weight="light" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => addToCart(product.id, qty)}
              className="km-btn km-btn-light min-h-[50px] flex-[1_1_200px]"
            >
              Add to bag
            </button>

            <button
              type="button"
              onClick={() => toggleSaved(product.id)}
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved" : "Save this piece"}
              className="grid size-[50px] place-items-center rounded-lg border border-[rgba(95,106,66,.28)] text-olive transition-[background,border-color,color] duration-300 hover:border-gold hover:bg-gold/10 hover:text-forest"
            >
              <Heart size={19} weight={saved ? "fill" : "light"} />
            </button>
          </div>

          <p className="mb-2 text-[13px] text-moss">
            {product.leadTime} — wrapped in kraft and embossed by hand.
          </p>
          <p className="mb-[30px] text-[13px] text-moss">
            Made by {product.maker}.
            {product.stock <= 4 && (
              <span className="text-brass">
                {" "}
                Only {product.stock} left from this run.
              </span>
            )}
          </p>

          <Accordion
            label="Materials"
            open={open.material}
            onToggle={() => toggle("material")}
          >
            {product.material}
          </Accordion>
          <Accordion
            label="Dimensions"
            open={open.dim}
            onToggle={() => toggle("dim")}
          >
            {product.dim}
          </Accordion>
          <Accordion
            label="Care"
            open={open.care}
            onToggle={() => toggle("care")}
            last
          >
            {product.care}
          </Accordion>
        </Reveal>
      </div>
    </div>
  );
}

function Accordion({
  label,
  open,
  onToggle,
  children,
  last = false,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`border-t border-[rgba(95,106,66,.18)] ${last ? "border-b" : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-[18px] text-xs tracking-[.14em] text-forest uppercase"
      >
        <span>{label}</span>
        <span
          className="text-moss transition-transform duration-[400ms] ease-km"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          <Plus size={15} weight="light" />
        </span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[450ms] ease-km"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-[1.7] text-olive">{children}</p>
        </div>
      </div>
    </div>
  );
}
