"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/context/store";
import { formatDate, money, shippingLabel } from "@/lib/commerce";

export default function OrderScreen({ id }: { id: string }) {
  const { orders, hydrated } = useStore();
  const order = orders.find((o) => o.id === id);

  if (!hydrated) {
    return (
      <div className="km-gutter min-h-[60vh] bg-cream-light py-24 text-forest">
        <p className="font-serif text-2xl text-moss italic">
          Fetching the order…
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="km-gutter min-h-[60vh] bg-cream-light py-24 text-center text-forest">
        <h1 className="mb-4 font-serif text-[clamp(26px,5cqw,44px)]">
          We cannot find order {id}
        </h1>
        <p className="mx-auto mb-8 max-w-[44ch] text-[15px] leading-[1.7] text-olive">
          Orders live in this browser for the demonstration, so a fresh browser
          starts with none. Your history is in your account.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/account/orders" className="km-btn km-btn-light">
            Order history
          </Link>
          <Link href="/shop" className="km-arrow border-b-[rgba(95,106,66,.3)] text-olive">
            Back to the collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-cream-light text-forest">
      <section
        className="km-gutter mx-auto max-w-[720px] text-center"
        style={{ paddingBlock: "clamp(56px,9cqw,120px) clamp(24px,3cqw,40px)" }}
      >
        <Image
          src="/brand/emblem.png"
          alt=""
          width={340}
          height={380}
          className="mx-auto mb-[26px] h-16 w-auto animate-aura"
        />
        <h1 className="mb-4.5 font-serif text-[clamp(28px,5cqw,48px)] leading-[1.1]">
          Thank you — it is on its way
        </h1>
        <p className="mx-auto max-w-[46ch] text-[15px] leading-[1.7] text-olive">
          Order {order.id}, placed {formatDate(order.placedAt)}. We will write
          when it leaves the atelier, usually within five working days.
        </p>
      </section>

      <section
        className="km-gutter mx-auto max-w-[720px]"
        style={{ paddingBottom: "clamp(60px,8cqw,120px)" }}
      >
        <div className="rounded-lg border border-[rgba(95,106,66,.2)] bg-cream p-[clamp(22px,3cqw,32px)]">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <p className="km-label text-olive">What is coming</p>
            <span className="rounded-md border border-gold/50 px-3 py-1 text-[11px] tracking-[.14em] text-brass uppercase">
              {order.status}
            </span>
          </div>

          {order.lines.map((line) => (
            <div
              key={line.id}
              className="flex items-baseline justify-between gap-4 border-b border-[rgba(95,106,66,.14)] py-3.5"
            >
              <div>
                <Link
                  href={`/shop/${line.id}`}
                  className="font-serif text-lg transition-colors duration-300 hover:text-brass"
                >
                  {line.name}
                </Link>
                <p className="text-xs text-moss">
                  {line.qty} × {money(line.price)}
                </p>
              </div>
              <p className="text-sm whitespace-nowrap text-olive">
                {money(line.qty * line.price)}
              </p>
            </div>
          ))}

          <div className="flex justify-between py-2.5 text-sm text-olive">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div className="flex justify-between border-b border-[rgba(95,106,66,.18)] py-2.5 text-sm text-olive">
            <span>Delivery</span>
            <span>{shippingLabel(order.shipping)}</span>
          </div>
          <div className="flex items-baseline justify-between pt-4">
            <span className="km-label">Total</span>
            <span className="font-serif text-[26px]">{money(order.total)}</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-5">
          <div className="rounded-lg border border-[rgba(95,106,66,.2)] bg-cream p-[22px]">
            <p className="km-label mb-3 text-olive">Going to</p>
            <p className="text-sm leading-[1.7] text-olive">
              {order.ship.name}
              <br />
              {order.ship.line1}
              <br />
              {order.ship.city} {order.ship.postcode}
            </p>
          </div>

          {order.giftNote && (
            <div className="rounded-lg border border-[rgba(95,106,66,.2)] bg-cream p-[22px]">
              <p className="km-label mb-3 text-olive">Gift note</p>
              <p className="font-serif text-base leading-[1.6] text-forest italic">
                “{order.giftNote}”
              </p>
            </div>
          )}
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="km-btn km-btn-light">
            Keep looking
          </Link>
          <Link
            href="/account/orders"
            className="km-arrow border-b-[rgba(95,106,66,.3)] text-olive"
          >
            All your orders
          </Link>
        </div>
      </section>
    </div>
  );
}
