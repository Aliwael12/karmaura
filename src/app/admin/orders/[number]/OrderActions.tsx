"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setOrderNote, setOrderStatus } from "@/app/actions/admin";
import type { OrderStatus } from "@/lib/supabase/types";

/** What each move does to stock, spelled out so it is never a surprise. */
const MOVES: { to: OrderStatus; label: string; hint: string }[] = [
  { to: "approved", label: "Approve", hint: "takes the stock" },
  { to: "delivered", label: "Mark delivered", hint: "counts as revenue" },
  { to: "cancelled", label: "Cancel", hint: "returns the stock" },
  { to: "pending", label: "Back to pending", hint: "returns the stock" },
];

export default function OrderActions({
  orderId,
  status,
  note,
}: {
  orderId: string;
  status: OrderStatus;
  note: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(note);

  function move(to: OrderStatus) {
    setError("");
    setMessage("");
    start(async () => {
      const result = await setOrderStatus(orderId, to);
      if (!result.ok) setError(result.error ?? "That did not work.");
      else setMessage(result.message ?? "Saved");
      router.refresh();
    });
  }

  function saveNote() {
    setError("");
    setMessage("");
    start(async () => {
      const result = await setOrderNote(orderId, draft);
      if (!result.ok) setError(result.error ?? "That did not work.");
      else setMessage("Note saved");
      router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-gold/20 bg-forest-deep/60 p-[clamp(18px,2.5vw,26px)]">
      <h2 className="km-label mb-5 text-cream/70">Move this order</h2>

      <div className="flex flex-wrap gap-2">
        {MOVES.filter((m) => m.to !== status).map((m) => (
          <button
            key={m.to}
            type="button"
            disabled={pending}
            onClick={() => move(m.to)}
            className="rounded-lg border border-gold/35 px-4 py-2.5 text-left text-[11px] tracking-[.12em] text-cream/80 uppercase transition-[background,color] duration-300 hover:bg-gold hover:text-forest disabled:opacity-50"
          >
            {m.label}
            <span className="mt-0.5 block text-[10px] tracking-normal normal-case opacity-60">
              {m.hint}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[13px] text-gold-bright">
          {error}
        </p>
      )}
      {message && !error && (
        <p className="mt-4 text-[13px] text-lime-300/80">{message}</p>
      )}

      <div className="mt-6 border-t border-gold/15 pt-5">
        <label
          htmlFor="admin-note"
          className="km-label mb-3 block text-cream/70"
        >
          Private note
        </label>
        <textarea
          id="admin-note"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Anything the atelier should know about this one"
          className="km-field km-field-dark resize-y"
        />
        <button
          type="button"
          disabled={pending || draft === note}
          onClick={saveNote}
          className="mt-3 rounded-lg border border-gold/35 px-4 py-2 text-[11px] tracking-[.12em] text-cream/80 uppercase hover:bg-gold hover:text-forest disabled:opacity-40"
        >
          Save note
        </button>
      </div>
    </section>
  );
}
