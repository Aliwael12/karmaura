"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { saveSettings } from "@/app/actions/admin";
import type { StoreSettings } from "@/lib/db/settings";

export default function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const field = "km-field km-field-dark";
  const label = "flex flex-col gap-1.5 text-[10px] tracking-[.2em] text-cream/45 uppercase";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setError("");
    setMessage("");
    start(async () => {
      const result = await saveSettings(fd);
      if (!result.ok) setError(result.error ?? "Could not save.");
      else {
        setMessage(result.message ?? "Saved");
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-gold/20 bg-forest-deep/60 p-[clamp(18px,2.5vw,26px)]"
    >
      <h2 className="km-label mb-5 text-cream/70">Commerce</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={label}>
          Delivery fee (EGP)
          <input
            name="delivery_fee"
            type="number"
            min={0}
            step={50}
            defaultValue={settings.deliveryFee}
            className={field}
          />
        </label>
        <label className={label}>
          Free delivery from (EGP)
          <input
            name="free_delivery_from"
            type="number"
            min={0}
            step={500}
            defaultValue={settings.freeDeliveryFrom}
            className={field}
          />
        </label>
      </div>

      <label className={`${label} mt-4`}>
        Announcement strip
        <input
          name="announcement"
          defaultValue={settings.announcement}
          placeholder="Leave empty for no strip"
          className={field}
        />
      </label>

      <label className="mt-4 flex items-center gap-2 text-[11px] tracking-[.14em] text-cream/70 uppercase">
        <input
          type="checkbox"
          name="store_open"
          defaultChecked={settings.storeOpen}
          className="size-4 accent-[#ac9d62]"
        />
        Open for orders
      </label>

      <h2 className="km-label mt-8 mb-5 border-t border-gold/15 pt-6 text-cream/70">
        The atelier
      </h2>
      <div className="grid gap-4">
        <label className={label}>
          Address
          <input
            name="atelier_address"
            defaultValue={settings.atelierAddress}
            className={field}
          />
        </label>
        <label className={label}>
          Hours
          <input
            name="atelier_hours"
            defaultValue={settings.atelierHours}
            className={field}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={label}>
            Telephone
            <input
              name="atelier_phone"
              defaultValue={settings.atelierPhone}
              className={field}
            />
          </label>
          <label className={label}>
            Email
            <input
              name="atelier_email"
              type="email"
              defaultValue={settings.atelierEmail}
              className={field}
            />
          </label>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-5 text-[13px] text-gold-bright">
          {error}
        </p>
      )}
      {message && !error && (
        <p className="mt-5 text-[13px] text-lime-300/80">{message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-lg border border-gold px-6 py-3 text-[11px] tracking-[.14em] text-cream uppercase hover:bg-gold hover:text-forest disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
