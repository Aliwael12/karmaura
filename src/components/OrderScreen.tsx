import Image from "next/image";
import Link from "next/link";
import { Money, Truck } from "@phosphor-icons/react/ssr";
import { formatDate, money, shippingLabel } from "@/lib/commerce";
import type { Order } from "@/lib/db/orders";

export default function OrderScreen({ order }: { order: Order }) {
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
          Order {order.number}, placed {formatDate(order.placedAt)}. We will
          write when it leaves the atelier, usually within five working days.
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
              key={line.slug}
              className="flex items-baseline justify-between gap-4 border-b border-[rgba(95,106,66,.14)] py-3.5"
            >
              <div>
                <Link
                  href={`/shop/${line.slug}`}
                  className="font-serif text-lg transition-colors duration-300 hover:text-brass"
                >
                  {line.name}
                </Link>
                <p className="text-xs text-moss">
                  {line.quantity} × {money(line.unitPrice)}
                </p>
              </div>
              <p className="text-sm whitespace-nowrap text-olive">
                {money(line.lineTotal)}
              </p>
            </div>
          ))}

          <div className="flex justify-between py-2.5 text-sm text-olive">
            <span>Subtotal</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div className="flex justify-between border-b border-[rgba(95,106,66,.18)] py-2.5 text-sm text-olive">
            <span>Delivery</span>
            <span>{shippingLabel(order.deliveryFee)}</span>
          </div>
          <div className="flex items-baseline justify-between pt-4">
            <span className="km-label">Total</span>
            <span className="font-serif text-[26px]">{money(order.total)}</span>
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-gold/40 bg-cream-light p-4 text-left">
            <Money
              size={19}
              weight="light"
              className="mt-0.5 shrink-0 text-gold"
            />
            <p className="text-[13px] leading-[1.6] text-moss">
              <span className="text-forest">Cash on delivery.</span> Have{" "}
              {money(order.total)} ready for the courier — nothing has been
              charged.
            </p>
          </div>

          {order.bosta.trackingNumber && (
            <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-[rgba(95,106,66,.2)] bg-cream-light p-4 text-left">
              <Truck
                size={19}
                weight="light"
                className="mt-0.5 shrink-0 text-olive"
              />
              <p className="text-[13px] leading-[1.6] text-moss">
                <span className="text-forest">
                  Tracking {order.bosta.trackingNumber}.
                </span>{" "}
                {order.bosta.stateLabel ?? "Booked with the courier"}.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 rounded-lg border border-[rgba(95,106,66,.2)] bg-cream p-[22px]">
          <p className="km-label mb-3 text-olive">Going to</p>
          <p className="text-sm leading-[1.7] text-olive">
            {order.customerName}
            <br />
            {order.ship.line1}
            <br />
            {order.ship.districtName ? `${order.ship.districtName}, ` : ""}
            {order.ship.city} {order.ship.postcode}
          </p>
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
