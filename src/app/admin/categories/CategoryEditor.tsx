"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { deleteCategory, saveCategory } from "@/app/actions/admin";
import type { AdminCategory } from "./page";

const ART_KINDS = [
  "vessel", "bowl", "carafe", "planter", "throw", "cushion", "runner",
  "platter", "cups", "board", "disc", "mirror", "basket", "tray", "hamper",
];

export default function CategoryEditor({
  categories,
}: {
  categories: AdminCategory[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setAdding((v) => !v);
            setOpen(null);
          }}
          className="rounded-lg border border-gold px-5 py-2.5 text-[11px] tracking-[.14em] text-cream uppercase hover:bg-gold hover:text-forest"
        >
          {adding ? "Cancel" : "New room"}
        </button>
      </div>

      {adding && <Form onDone={() => setAdding(false)} />}

      {categories.map((category) => (
        <div
          key={category.id}
          className="rounded-lg border border-gold/20 bg-forest-deep/50"
        >
          <button
            type="button"
            onClick={() => setOpen(open === category.id ? null : category.id)}
            className="flex w-full flex-wrap items-center gap-4 p-4 text-left"
          >
            <span className="min-w-[200px] flex-1">
              <span className="block font-serif text-lg text-cream">
                {category.name}
              </span>
              <span className="block text-[11px] text-cream/40">
                /{category.slug} · chip reads “{category.short_name}”
              </span>
            </span>
            <span className="text-sm text-cream/55">
              {category.productCount} piece{category.productCount === 1 ? "" : "s"}
            </span>
            {!category.is_active && (
              <span className="rounded border border-cream/25 px-2 py-0.5 text-[10px] tracking-[.14em] text-cream/50 uppercase">
                hidden
              </span>
            )}
            <span className="text-cream/40">{open === category.id ? "−" : "+"}</span>
          </button>

          {open === category.id && (
            <div className="border-t border-gold/15 p-5">
              <Form category={category} onDone={() => setOpen(null)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Form({
  category,
  onDone,
}: {
  category?: AdminCategory;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const field = "km-field km-field-dark";
  const label = "flex flex-col gap-1.5 text-[10px] tracking-[.2em] text-cream/45 uppercase";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setError("");
    start(async () => {
      const result = await saveCategory(fd);
      if (!result.ok) setError(result.error ?? "Could not save.");
      else {
        router.refresh();
        onDone();
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-gold/20 bg-forest-night/40 p-5"
    >
      {category && <input type="hidden" name="id" value={category.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        <label className={label}>
          Name
          <input name="name" defaultValue={category?.name} required className={field} />
        </label>
        <label className={label}>
          Short name (filter chip)
          <input name="short_name" defaultValue={category?.short_name} className={field} />
        </label>
        <label className={label}>
          Slug
          <input
            name="slug"
            defaultValue={category?.slug}
            placeholder="made from the name"
            className={field}
          />
        </label>
        <label className={label}>
          Art kind
          <select
            name="art_kind"
            defaultValue={category?.art_kind ?? "vessel"}
            className={field}
          >
            {ART_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Order on the page
          <input
            name="position"
            type="number"
            defaultValue={category?.position ?? 0}
            className={field}
          />
        </label>
      </div>

      <label className={`${label} mt-4`}>
        Blurb (shown when the room is filtered)
        <textarea
          name="blurb"
          rows={2}
          defaultValue={category?.blurb}
          className={`${field} resize-y`}
        />
      </label>

      <label className="mt-4 flex items-center gap-2 text-[11px] tracking-[.14em] text-cream/70 uppercase">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={category?.is_active ?? true}
          className="size-4 accent-[#ac9d62]"
        />
        Shown in the shop
      </label>

      {error && (
        <p role="alert" className="mt-4 text-[13px] text-gold-bright">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-gold px-5 py-2.5 text-[11px] tracking-[.14em] text-cream uppercase hover:bg-gold hover:text-forest disabled:opacity-50"
        >
          {pending ? "Saving…" : category ? "Save room" : "Add room"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-gold/25 px-5 py-2.5 text-[11px] tracking-[.14em] text-cream/60 uppercase hover:text-cream"
        >
          Close
        </button>
        {category && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const result = await deleteCategory(category.id);
                if (!result.ok) setError(result.error ?? "Could not remove.");
                else {
                  router.refresh();
                  onDone();
                }
              })
            }
            className="ml-auto rounded-lg border border-gold/25 px-5 py-2.5 text-[11px] tracking-[.14em] text-cream/45 uppercase hover:border-gold-bright hover:text-gold-bright disabled:opacity-50"
          >
            Remove room
          </button>
        )}
      </div>
    </form>
  );
}
