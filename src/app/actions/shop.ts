"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import { placeOrder as placeOrderInDb } from "@/lib/db/orders";
import type { OrderAttribution } from "@/lib/supabase/types";

export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── checkout ──────────────────────────────────────────────────────────
   The browser sends slugs and quantities only. Every price, the delivery
   fee and the total are computed in the database. */

export type CheckoutInput = {
  items: { slug: string; quantity: number }[];
  name: string;
  email: string;
  phone?: string;
  line1: string;
  city: string;
  postcode?: string;
  attribution?: OrderAttribution;
};

export async function submitOrder(
  input: CheckoutInput,
): Promise<ActionResult<{ orderNumber: string }>> {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false, error: "There is nothing in the bag yet." };
  }
  if (!input.name?.trim() || !input.line1?.trim() || !input.city?.trim()) {
    return { ok: false, error: "We need the whole delivery address before we can send it." };
  }
  if (!EMAIL.test(input.email ?? "")) {
    return { ok: false, error: "That email does not look right." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await placeOrderInDb({
    items: input.items
      .filter((i) => i?.slug && Number(i.quantity) > 0)
      .map((i) => ({ slug: i.slug, quantity: Math.floor(Number(i.quantity)) })),
    customer: {
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() ?? "",
      line1: input.line1.trim(),
      city: input.city.trim(),
      postcode: input.postcode?.trim() ?? "",
    },
    attribution: input.attribution,
    userId: user?.id ?? null,
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/account/orders");
  return { ok: true, data: { orderNumber: result.order.number } };
}

/* ── saved pieces ──────────────────────────────────────────────────────
   Only meaningful for a signed-in visitor; a guest's hearts stay local. */

export async function toggleSaved(productId: string): Promise<ActionResult<{ saved: boolean }>> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to keep a piece." };

  const { data: existing } = await supabase
    .from("saved_items")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/account/saved");
    return { ok: true, data: { saved: false } };
  }

  const { error } = await supabase
    .from("saved_items")
    .insert({ user_id: user.id, product_id: productId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/account/saved");
  return { ok: true, data: { saved: true } };
}

/* ── addresses ─────────────────────────────────────────────────────────
   The unique index only allows one default per person, so an existing
   default is cleared before the new one is written. */

export async function saveAddress(formData: FormData): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const full_name = String(formData.get("full_name") ?? "").trim();
  const line1 = String(formData.get("line1") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  if (!full_name || !line1 || !city) {
    return { ok: false, error: "A name, a street and a city, at least." };
  }

  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    label: String(formData.get("label") ?? "").trim() || "Address",
    full_name,
    line1,
    city,
    postcode: String(formData.get("postcode") ?? "").trim(),
    country: String(formData.get("country") ?? "").trim() || "Egypt",
    is_default: (count ?? 0) === 0,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/account/addresses");
  return { ok: true, message: "Address saved" };
}

export async function removeAddress(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function makeDefaultAddress(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id)
    .eq("is_default", true);

  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/account/addresses");
  return { ok: true };
}

/* ── the house's inboxes ───────────────────────────────────────────────
   All three write through the service role: the tables are admin-only under
   RLS, and funnelling them through here keeps validation in one place. */

export async function sendContactMessage(
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !message) return { ok: false, error: "A name and a note, please." };
  if (!EMAIL.test(email)) return { ok: false, error: "That email does not look right." };
  if (message.length > 4000) return { ok: false, error: "That note is too long." };

  const { error } = await createAdminSupabase()
    .from("contact_messages")
    .insert({ name, email: email.toLowerCase(), message });

  if (error) return { ok: false, error: "Could not send that. Try again." };
  return { ok: true, message: "Thank you — we will write back" };
}

export async function subscribeToLetters(email: string): Promise<ActionResult> {
  const clean = email.trim().toLowerCase();
  if (!EMAIL.test(clean)) return { ok: false, error: "That email does not look right." };

  const { error } = await createAdminSupabase()
    .from("newsletter_subscribers")
    .upsert({ email: clean, unsubscribed_at: null }, { onConflict: "email" });

  if (error) return { ok: false, error: "Could not add you. Try again." };
  return { ok: true, message: "You are on the list" };
}

export async function openRepair(formData: FormData): Promise<ActionResult> {
  const piece = String(formData.get("piece") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!piece) return { ok: false, error: "Which piece needs mending?" };

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await createAdminSupabase().rpc("open_repair", {
    p_piece: piece,
    p_note: note,
    p_email: email || user?.email || "",
    p_user_id: user?.id ?? null,
  });

  if (error) return { ok: false, error: "Could not open that repair. Try again." };

  revalidatePath("/account/repairs");
  return { ok: true, message: "Repair noted — we will write back" };
}

/** Best-effort read of the country the request came from, for tracking. */
export async function requestCountry(): Promise<string | null> {
  const h = await headers();
  return h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? null;
}
