"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Minus, Money, Plus } from "@phosphor-icons/react/ssr";
import { useStore } from "@/context/store";
import {
  FREE_DELIVERY_FROM,
  bagHeading,
  money,
  shippingLabel,
} from "@/lib/commerce";
import { categoryName, getProduct } from "@/lib/products";
import ObjectArt from "./ObjectArt";

type Form = {
  name: string;
  line1: string;
  city: string;
  postcode: string;
};

const EMPTY: Form = { name: "", line1: "", city: "", postcode: "" };

export default function CartScreen() {
  const { hydrated, lines, count, setQty, removeFromCart, addresses } =
    useStore();

  const [giftNote, setGiftNote] = useState("");

  /* the signed-in visitor's default address seeds the delivery panel; keying
     the panel on it re-seeds the fields if the store hydrates late */
  const preset = addresses.find((a) => a.isDefault) ?? addresses[0];

  if (!hydrated) {
    return (
      <div className="km-gutter min-h-[60vh] bg-cream-light py-24">
        <p className="font-serif text-2xl text-moss italic">
          Opening your bag…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-cream-light text-forest">
      <section
        className="km-gutter"
        style={{
          paddingBlock: "clamp(34px,5cqw,72px) clamp(20px,2.6cqw,32px)",
        }}
      >
        <p className="km-eyebrow mb-3.5 text-moss">Your bag</p>
        <h1 className="font-serif text-[clamp(30px,6cqw,58px)] leading-[1.05]">
          {bagHeading(count)}
        </h1>
      </section>

      <section
        className="km-gutter"
        style={{ paddingBottom: "clamp(60px,8cqw,110px)" }}
      >
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start"
          style={{ gap: "clamp(24px,3.4cqw,52px)" }}
        >
          {/* ── the lines ─────────────────────────────────────── */}
          <div>
            {lines.map((line) => {
              const product = getProduct(line.id);
              return (
                <div
                  key={line.id}
                  className="flex gap-4 border-b border-[rgba(95,106,66,.16)] py-5"
                >
                  <Link
                    href={`/shop/${line.id}`}
                    className="h-[110px] w-[88px] shrink-0 overflow-hidden rounded-lg border border-gold/35 bg-cream"
                  >
                    {product && (
                      <ObjectArt
                        kind={product.art}
                        tone="light"
                        className="size-full"
                      />
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link
                        href={`/shop/${line.id}`}
                        className="font-serif text-xl leading-tight transition-colors duration-300 hover:text-brass"
                      >
                        {line.name}
                      </Link>
                      <p className="text-sm whitespace-nowrap text-olive">
                        {money(line.lineTotal)}
                      </p>
                    </div>
                    <p className="text-xs tracking-[.08em] text-moss uppercase">
                      {categoryName(line.category)}
                    </p>
                    <div className="mt-auto flex items-center gap-3.5">
                      <div className="flex items-center rounded-lg border border-[rgba(95,106,66,.24)]">
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty - 1)}
                          aria-label={`One fewer ${line.name}`}
                          className="grid size-[38px] place-items-center text-olive transition-[background] duration-300 hover:bg-gold/15"
                        >
                          <Minus size={14} weight="light" />
                        </button>
                        <span className="min-w-[26px] text-center text-sm">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty + 1)}
                          aria-label={`One more ${line.name}`}
                          className="grid size-[38px] place-items-center text-olive transition-[background] duration-300 hover:bg-gold/15"
                        >
                          <Plus size={14} weight="light" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.id)}
                        className="text-xs tracking-[.1em] text-moss uppercase transition-colors duration-300 hover:text-forest"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {lines.length === 0 && (
              <div className="py-10 text-center">
                <p className="mb-5 font-serif text-2xl text-moss italic">
                  Nothing here yet
                </p>
                <Link href="/shop" className="km-btn km-btn-light">
                  Browse the collection
                </Link>
              </div>
            )}

            <div className="mt-[30px] rounded-lg border border-[rgba(95,106,66,.2)] bg-cream p-[22px]">
              <label
                htmlFor="km-gift"
                className="km-label mb-3.5 block text-olive"
              >
                Gift note
              </label>
              <textarea
                id="km-gift"
                rows={3}
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder="We copy it out in ink on parchment"
                className="km-field km-field-light resize-y font-serif text-base italic"
              />
            </div>
          </div>

          {/* ── delivery and payment ──────────────────────────── */}
          <CheckoutPanel
            key={preset?.id ?? "blank"}
            preset={preset}
            giftNote={giftNote}
          />
        </div>
      </section>
    </div>
  );
}

function CheckoutPanel({
  preset,
  giftNote,
}: {
  preset?: {
    id: string;
    name: string;
    line1: string;
    city: string;
    postcode: string;
  };
  giftNote: string;
}) {
  const { lines, subtotal, shipping, total, placeOrder, user } = useStore();
  const router = useRouter();
  const [form, setForm] = useState<Form>(() =>
    preset
      ? {
          ...EMPTY,
          name: preset.name,
          line1: preset.line1,
          city: preset.city,
          postcode: preset.postcode,
        }
      : EMPTY,
  );
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const shortfall = FREE_DELIVERY_FROM - subtotal;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (lines.length === 0) {
      setError("There is nothing in the bag yet.");
      return;
    }
    const missing = (Object.keys(EMPTY) as (keyof Form)[]).filter(
      (key) => !form[key].trim(),
    );
    if (missing.length > 0) {
      setError("We need the whole delivery address before we can send it.");
      return;
    }
    setError("");
    setPlacing(true);
    const order = placeOrder({
      ship: {
        name: form.name,
        line1: form.line1,
        city: form.city,
        postcode: form.postcode,
      },
      giftNote,
    });
    if (!order) {
      setPlacing(false);
      setError("Something went astray. Try once more.");
      return;
    }
    router.push(`/order/${order.id}`);
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="sticky top-24 rounded-lg border border-[rgba(95,106,66,.2)] bg-cream p-[clamp(20px,3cqw,30px)]"
    >
      <p className="km-label mb-5 text-olive">Delivery &amp; payment</p>

      {!user && (
        <p className="mb-4 text-[13px] leading-[1.6] text-moss">
          <Link
            href="/account"
            className="text-brass underline underline-offset-4"
          >
            Sign in
          </Link>{" "}
          to use a saved address.
        </p>
      )}

      <div className="mb-[22px] flex flex-col gap-3">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full name"
          autoComplete="name"
          className="km-field km-field-light"
        />
        <input
          type="text"
          value={form.line1}
          onChange={(e) => setForm({ ...form, line1: e.target.value })}
          placeholder="Address"
          autoComplete="street-address"
          className="km-field km-field-light"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="City"
            autoComplete="address-level2"
            className="km-field km-field-light min-w-0"
          />
          <input
            type="text"
            value={form.postcode}
            onChange={(e) => setForm({ ...form, postcode: e.target.value })}
            placeholder="Postcode"
            autoComplete="postal-code"
            className="km-field km-field-light min-w-0"
          />
        </div>
        <div className="mt-1 rounded-lg border border-gold/40 bg-cream-light p-4">
          <p className="mb-2 flex items-center gap-2.5 text-[13px] tracking-[.06em] text-forest uppercase">
            <Money size={19} weight="light" className="text-gold" />
            Cash on delivery
          </p>
          <p className="text-[13px] leading-[1.6] text-moss">
            Pay the courier when the piece reaches you — it is the only way we
            take payment. Nothing is charged now.
          </p>
        </div>
      </div>

      <div className="flex justify-between py-2.5 text-sm text-olive">
        <span>Subtotal</span>
        <span>{money(subtotal)}</span>
      </div>
      <div className="flex justify-between border-b border-[rgba(95,106,66,.18)] py-2.5 text-sm text-olive">
        <span>Delivery</span>
        <span>{shippingLabel(shipping)}</span>
      </div>
      <div className="flex items-baseline justify-between pt-[18px] pb-[22px]">
        <span className="km-label">Total</span>
        <span className="font-serif text-[26px]">{money(total)}</span>
      </div>

      {error && (
        <p role="alert" className="mb-3 text-[13px] text-brass">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={placing || lines.length === 0}
        className="w-full rounded-lg border border-gold bg-forest p-4 text-xs tracking-[.18em] text-cream uppercase transition-[background,color,transform] duration-[400ms] ease-km hover:-translate-y-0.5 hover:bg-gold hover:text-forest active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:bg-forest disabled:hover:text-cream"
      >
        {placing ? "Sending…" : "Place the order"}
      </button>

      <p className="mt-3.5 text-xs leading-[1.6] text-moss">
        {shortfall > 0 && subtotal > 0
          ? `${money(shortfall)} more for complimentary delivery. Wrapped in kraft, embossed by hand.`
          : `Free delivery over ${money(FREE_DELIVERY_FROM)}. Wrapped in kraft, embossed by hand.`}
      </p>
    </form>
  );
}
