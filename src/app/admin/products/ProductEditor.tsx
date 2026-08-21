"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  deleteProduct,
  deleteProductImage,
  saveProduct,
  uploadProductImage,
} from "@/app/actions/admin";
import { money } from "@/lib/commerce";
import type { CategoryRow } from "@/lib/supabase/types";
import type { AdminProduct } from "./page";

const ART_KINDS = [
  "vessel", "bowl", "carafe", "planter", "throw", "cushion", "runner",
  "platter", "cups", "board", "disc", "mirror", "basket", "tray", "hamper",
];

function imageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return path.startsWith("http")
    ? path
    : `${base}/storage/v1/object/public/product-images/${path}`;
}

export default function ProductEditor({
  products,
  categories,
}: {
  products: AdminProduct[];
  categories: CategoryRow[];
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
          {adding ? "Cancel" : "New piece"}
        </button>
      </div>

      {adding && (
        <Form
          categories={categories}
          onDone={() => setAdding(false)}
          key="new"
        />
      )}

      {products.map((product) => (
        <div
          key={product.id}
          className="rounded-lg border border-gold/20 bg-forest-deep/50"
        >
          <button
            type="button"
            onClick={() => setOpen(open === product.id ? null : product.id)}
            className="flex w-full flex-wrap items-center gap-4 p-4 text-left"
          >
            <span className="grid h-14 w-12 shrink-0 place-items-center overflow-hidden rounded border border-gold/25 bg-cream/10">
              {product.product_images?.[0] ? (
                <Image
                  src={imageUrl(product.product_images[0].storage_path)}
                  alt=""
                  width={48}
                  height={56}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-[9px] tracking-wider text-cream/40 uppercase">
                  drawn
                </span>
              )}
            </span>

            <span className="min-w-[180px] flex-1">
              <span className="block font-serif text-lg text-cream">
                {product.name}
              </span>
              <span className="block text-[11px] text-cream/40">
                /{product.slug}
              </span>
            </span>

            <span className="tabular-nums text-sm text-cream/70">
              {money(product.price)}
            </span>
            <span
              className={`text-sm tabular-nums ${
                product.stock <= 3 ? "text-gold-bright" : "text-cream/50"
              }`}
            >
              {product.stock} in stock
            </span>
            {!product.is_active && (
              <span className="rounded border border-cream/25 px-2 py-0.5 text-[10px] tracking-[.14em] text-cream/50 uppercase">
                hidden
              </span>
            )}
            {product.is_featured && (
              <span className="rounded border border-gold/50 px-2 py-0.5 text-[10px] tracking-[.14em] text-gold-bright uppercase">
                featured
              </span>
            )}
            <span className="text-cream/40">{open === product.id ? "−" : "+"}</span>
          </button>

          {open === product.id && (
            <div className="border-t border-gold/15 p-5">
              <Form
                product={product}
                categories={categories}
                onDone={() => setOpen(null)}
              />
              <Photos product={product} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Form({
  product,
  categories,
  onDone,
}: {
  product?: AdminProduct;
  categories: CategoryRow[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    setError("");
    start(async () => {
      const result = await saveProduct(fd);
      if (!result.ok) {
        setError(result.error ?? "Could not save.");
        return;
      }
      router.refresh();
      onDone();
    });
  }

  function remove() {
    if (!product) return;
    start(async () => {
      const result = await deleteProduct(product.id);
      if (!result.ok) setError(result.error ?? "Could not remove.");
      else {
        router.refresh();
        onDone();
      }
    });
  }

  const field = "km-field km-field-dark";
  const label = "flex flex-col gap-1.5 text-[10px] tracking-[.2em] text-cream/45 uppercase";

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-gold/20 bg-forest-night/40 p-5"
    >
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 md:grid-cols-2">
        <label className={label}>
          Name
          <input name="name" defaultValue={product?.name} required className={field} />
        </label>
        <label className={label}>
          Slug
          <input
            name="slug"
            defaultValue={product?.slug}
            placeholder="made from the name"
            className={field}
          />
        </label>
        <label className={label}>
          Price (EGP)
          <input
            name="price"
            type="number"
            min={0}
            step={50}
            defaultValue={product?.price ?? 0}
            required
            className={field}
          />
        </label>
        <label className={label}>
          Stock
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            className={field}
          />
        </label>
        <label className={label}>
          Room
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className={field}
          >
            <option value="">— none —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Art kind (drawn fallback)
          <select
            name="art_kind"
            defaultValue={product?.art_kind ?? "vessel"}
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
          Maker
          <input name="maker" defaultValue={product?.maker} className={field} />
        </label>
        <label className={label}>
          Lead time
          <input name="lead_time" defaultValue={product?.lead_time} className={field} />
        </label>
        <label className={label}>
          Dimensions
          <input name="dimensions" defaultValue={product?.dimensions} className={field} />
        </label>
        <label className={label}>
          Order on the page
          <input
            name="position"
            type="number"
            defaultValue={product?.position ?? 0}
            className={field}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4">
        <label className={label}>
          Blurb
          <textarea name="blurb" rows={2} defaultValue={product?.blurb} className={`${field} resize-y`} />
        </label>
        <label className={label}>
          Materials
          <textarea name="material" rows={2} defaultValue={product?.material} className={`${field} resize-y`} />
        </label>
        <label className={label}>
          Care
          <textarea name="care" rows={2} defaultValue={product?.care} className={`${field} resize-y`} />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-[11px] tracking-[.14em] text-cream/70 uppercase">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={product?.is_active ?? true}
            className="size-4 accent-[#ac9d62]"
          />
          Listed in the shop
        </label>
        <label className="flex items-center gap-2 text-[11px] tracking-[.14em] text-cream/70 uppercase">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={product?.is_featured ?? false}
            className="size-4 accent-[#ac9d62]"
          />
          Featured on the home page
        </label>
      </div>

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
          {pending ? "Saving…" : product ? "Save piece" : "Add piece"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-gold/25 px-5 py-2.5 text-[11px] tracking-[.14em] text-cream/60 uppercase hover:text-cream"
        >
          Close
        </button>
        {product && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="ml-auto rounded-lg border border-gold/25 px-5 py-2.5 text-[11px] tracking-[.14em] text-cream/45 uppercase hover:border-gold-bright hover:text-gold-bright disabled:opacity-50"
          >
            Remove piece
          </button>
        )}
      </div>
    </form>
  );
}

function Photos({ product }: { product: AdminProduct }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const images = (product.product_images ?? []).sort((a, b) => a.position - b.position);

  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    fd.set("product_id", product.id);
    setError("");
    start(async () => {
      const result = await uploadProductImage(fd);
      if (!result.ok) setError(result.error ?? "Upload failed.");
      else {
        form.reset();
        router.refresh();
      }
    });
  }

  return (
    <div className="mt-5 rounded-lg border border-gold/20 bg-forest-night/40 p-5">
      <h3 className="km-label mb-4 text-cream/70">Photographs</h3>

      {images.length > 0 && (
        <ul className="mb-5 flex flex-wrap gap-3">
          {images.map((img) => (
            <li key={img.id} className="relative">
              <Image
                src={imageUrl(img.storage_path)}
                alt={img.alt}
                width={96}
                height={120}
                unoptimized
                className="h-[120px] w-24 rounded border border-gold/25 object-cover"
              />
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const result = await deleteProductImage(img.id);
                    if (!result.ok) setError(result.error ?? "Could not remove.");
                    else router.refresh();
                  })
                }
                aria-label="Remove photograph"
                className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border border-gold/50 bg-forest-night text-cream/70 hover:text-gold-bright"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={upload} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-[10px] tracking-[.2em] text-cream/45 uppercase">
          Image file
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
            className="text-[12px] text-cream/70 file:mr-3 file:rounded file:border file:border-gold/40 file:bg-transparent file:px-3 file:py-1.5 file:text-[11px] file:tracking-[.1em] file:text-cream/80 file:uppercase"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[10px] tracking-[.2em] text-cream/45 uppercase">
          Alt text
          <input name="alt" className="km-field km-field-dark !w-56 !py-2" />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-gold/35 px-4 py-2.5 text-[11px] tracking-[.12em] text-cream/80 uppercase hover:bg-gold hover:text-forest disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-[13px] text-gold-bright">
          {error}
        </p>
      )}
      <p className="mt-3 text-[11px] text-cream/35">
        JPEG, PNG, WebP or AVIF, up to 8 MB. The first photograph is the one the
        shop leads with.
      </p>
    </div>
  );
}
