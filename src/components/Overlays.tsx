"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "@phosphor-icons/react/ssr";
import { useStore } from "@/context/store";
import { useHydrated } from "@/lib/useHydrated";
import { money } from "@/lib/commerce";
import ObjectArt from "./ObjectArt";

export default function Overlays() {
  const mounted = useHydrated();
  if (!mounted) return null;

  return createPortal(
    <>
      <MobileMenu />
      <CartDrawer />
      <Toasts />
    </>,
    document.body,
  );
}

/* ── the full-bleed menu, below 760px ─────────────────────────────── */

const MENU_LINKS = [
  { href: "/shop", label: "Collection" },
  { href: "/story", label: "The story" },
  { href: "/visit", label: "Visit" },
  { href: "/account", label: "My profile" },
];

function MobileMenu() {
  const { menuOpen, setMenuOpen } = useStore();
  useEscape(menuOpen, () => setMenuOpen(false));
  if (!menuOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex animate-fade flex-col bg-forest-night/95 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-gold/20 px-[clamp(16px,4vw,60px)] py-5">
        <Image
          src="/brand/wordmark.png"
          alt="KARMAURA HOME"
          width={880}
          height={300}
          className="h-7 w-auto opacity-90"
        />
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Close"
          className="grid size-[42px] place-items-center rounded-lg text-cream hover:bg-gold/15"
        >
          <X size={22} weight="light" />
        </button>
      </div>
      <nav className="flex flex-1 flex-col justify-center gap-1.5 p-[clamp(20px,5vw,60px)]">
        {MENU_LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="animate-sheet py-2 text-left font-serif text-[clamp(32px,9vw,52px)] text-cream transition-colors duration-300 hover:text-gold-bright"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {link.label}
          </Link>
        ))}
        <div className="km-rule my-[22px] w-3/5" />
        <p className="font-serif text-[19px] text-gold-bright italic">
          Slow down. Feel home.
        </p>
      </nav>
    </div>
  );
}

/* ── the bag drawer ───────────────────────────────────────────────── */

function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    lines,
    count,
    subtotal,
    removeFromCart,
    products,
  } = useStore();
  useEscape(cartOpen, () => setCartOpen(false));
  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex justify-end">
      <button
        type="button"
        aria-label="Close the bag"
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 animate-fade bg-forest-black/60"
      />
      <aside className="relative flex h-full w-[min(420px,88%)] animate-drawer flex-col border-l border-gold/25 bg-forest-deep">
        <div className="flex items-center justify-between border-b border-gold/20 px-6 py-5">
          <p className="text-xs tracking-[.2em] text-cream uppercase">
            Your bag — {count}
          </p>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            aria-label="Close"
            className="grid size-[38px] place-items-center rounded-lg text-cream hover:bg-gold/15"
          >
            <X size={19} weight="light" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2">
          {lines.map((line) => {
            const product = products.find((p) => p.slug === line.slug);
            const photo = product?.images[0];
            return (
              <div
                key={line.slug}
                className="flex gap-3.5 border-b border-gold/15 py-[18px]"
              >
                <Link
                  href={`/shop/${line.slug}`}
                  onClick={() => setCartOpen(false)}
                  className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-gold/30 bg-cream"
                >
                  {photo ? (
                    <Image
                      src={photo.url}
                      alt={photo.alt || line.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    product && (
                      <ObjectArt
                        kind={product.art}
                        tone="light"
                        className="size-full"
                      />
                    )
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/shop/${line.slug}`}
                    onClick={() => setCartOpen(false)}
                    className="font-serif text-lg leading-tight text-cream hover:text-gold-bright"
                  >
                    {line.name}
                  </Link>
                  <p className="mt-1 text-xs text-cream/55">{line.qtyLabel}</p>
                  <p className="mt-2 text-[13px] text-gold-bright">
                    {money(line.lineTotal)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(line.slug)}
                  aria-label={`Remove ${line.name}`}
                  className="self-start text-cream/50 transition-colors duration-300 hover:text-gold-bright"
                >
                  <X size={15} weight="light" />
                </button>
              </div>
            );
          })}

          {lines.length === 0 && (
            <p className="py-[50px] text-center font-serif text-[22px] text-cream/55 italic">
              Nothing here yet
            </p>
          )}
        </div>

        <div className="border-t border-gold/20 px-6 py-[22px]">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-xs tracking-[.16em] text-cream/70 uppercase">
              Subtotal
            </span>
            <span className="font-serif text-2xl text-cream">
              {money(subtotal)}
            </span>
          </div>
          <Link
            href="/cart"
            onClick={() => setCartOpen(false)}
            className="block w-full rounded-lg border border-gold p-4 text-center text-xs tracking-[.18em] text-cream uppercase transition-[background,color] duration-[400ms] hover:bg-gold hover:text-forest"
          >
            Bag &amp; checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}

/* ── the toast stack ──────────────────────────────────────────────── */

function Toasts() {
  const { toasts } = useStore();
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-[26px] left-1/2 z-80 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.key}
          role="status"
          className="flex animate-toast items-center gap-2.5 rounded-lg border border-gold/40 bg-forest-night/95 px-5 py-[13px] text-[13px] whitespace-nowrap text-cream"
        >
          <Check size={16} weight="light" className="text-gold-bright" />
          {toast.message}
        </div>
      ))}
    </div>
  );
}

/* ── shared ───────────────────────────────────────────────────────── */

function useEscape(active: boolean, close: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);
}
