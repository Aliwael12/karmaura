"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useStore } from "@/context/store";
import { PRODUCTS } from "@/lib/products";

export default function RepairForm() {
  const { openRepair, user } = useStore();
  const [piece, setPiece] = useState(PRODUCTS[0].name);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!note.trim()) return;
    openRepair(piece, note.trim());
    setNote("");
    setDone(true);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-gold/25 bg-forest-deep/70 p-[clamp(22px,3cqw,34px)]"
    >
      <p className="km-label mb-5 text-cream/80">Send a piece back</p>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs text-cream/60">Which piece</span>
          <select
            value={piece}
            onChange={(e) => setPiece(e.target.value)}
            className="km-field km-field-dark"
          >
            {PRODUCTS.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs text-cream/60">What happened</span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A chip, a loose fringe, a handle that came away"
            className="km-field km-field-dark resize-y"
          />
        </label>

        <button type="submit" className="km-btn km-btn-dark w-full">
          Open a repair
        </button>

        {done && (
          <p className="text-[13px] leading-[1.7] text-gold-bright">
            Noted. {user ? (
              <>
                You can follow it in{" "}
                <Link href="/account/repairs" className="underline underline-offset-4">
                  your account
                </Link>
                .
              </>
            ) : (
              <>
                <Link href="/account" className="underline underline-offset-4">
                  Sign in
                </Link>{" "}
                to follow it through.
              </>
            )}
          </p>
        )}
      </div>
    </form>
  );
}
