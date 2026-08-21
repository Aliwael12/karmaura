"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import { isAdminRequest } from "@/lib/db/auth";
import { SETTING_KEYS } from "@/lib/db/settings";
import type { MessageStatus, OrderStatus, RepairStatus } from "@/lib/supabase/types";

export type AdminResult = { ok: boolean; error?: string; message?: string };

/** Every mutation below starts here. No exceptions. */
async function guard(): Promise<AdminResult | null> {
  if (!(await isAdminRequest())) {
    return { ok: false, error: "Not signed in as an administrator." };
  }
  return null;
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string, fallback = 0) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? Math.round(n) : fallback;
};
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/* ── admin sign-in ─────────────────────────────────────────────────────
   Uses the same Supabase Auth as everyone else; the difference is the
   is_admin flag on the profile, checked after the password succeeds. */

export async function adminSignIn(formData: FormData): Promise<AdminResult> {
  const email = str(formData, "email");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Email and password, please." };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { ok: false, error: "That email and password do not match." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    await supabase.auth.signOut();
    return { ok: false, error: "That account is not an administrator." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function adminSignOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/admin/login");
}

/* ── orders ────────────────────────────────────────────────────────────
   Status changes go through set_order_status so stock moves with them. */

export async function setOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const { error } = await createAdminSupabase().rpc("set_order_status", {
    p_order_id: orderId,
    p_status: status,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin", "layout");
  return { ok: true, message: `Order marked ${status}` };
}

export async function bulkSetOrderStatus(
  orderIds: string[],
  status: OrderStatus,
): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const db = createAdminSupabase();
  const failures: string[] = [];
  for (const id of orderIds) {
    const { error } = await db.rpc("set_order_status", {
      p_order_id: id,
      p_status: status,
    });
    if (error) failures.push(error.message);
  }

  revalidatePath("/admin", "layout");
  if (failures.length) {
    return {
      ok: false,
      error: `${orderIds.length - failures.length} moved, ${failures.length} refused: ${failures[0]}`,
    };
  }
  return { ok: true, message: `${orderIds.length} orders marked ${status}` };
}

export async function setOrderNote(
  orderId: string,
  note: string,
): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const { error } = await createAdminSupabase()
    .from("orders")
    .update({ admin_note: note.slice(0, 2000) })
    .eq("id", orderId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/orders");
  return { ok: true, message: "Note saved" };
}

/* ── products ──────────────────────────────────────────────────────────*/

export async function saveProduct(formData: FormData): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) return { ok: false, error: "A piece needs a name." };

  const price = int(formData, "price", -1);
  if (price < 0) return { ok: false, error: "Price must be zero or more." };

  const row = {
    name,
    slug: str(formData, "slug") || slugify(name),
    category_id: str(formData, "category_id") || null,
    price,
    blurb: str(formData, "blurb"),
    material: str(formData, "material"),
    dimensions: str(formData, "dimensions"),
    care: str(formData, "care"),
    maker: str(formData, "maker"),
    lead_time: str(formData, "lead_time"),
    art_kind: str(formData, "art_kind") || "vessel",
    stock: Math.max(0, int(formData, "stock")),
    is_active: bool(formData, "is_active"),
    is_featured: bool(formData, "is_featured"),
    position: int(formData, "position"),
  };

  const db = createAdminSupabase();
  const { error } = id
    ? await db.from("products").update(row).eq("id", id)
    : await db.from("products").insert(row);

  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "That slug is already taken." : error.message,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { ok: true, message: id ? "Piece saved" : "Piece added" };
}

export async function deleteProduct(id: string): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  /* Past orders keep their own copy of the name and price, so removing a
     product cannot rewrite history — order_items.product_id just goes null. */
  const { error } = await createAdminSupabase().from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true, message: "Piece removed" };
}

export async function setProductStock(
  id: string,
  stock: number,
): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const { error } = await createAdminSupabase()
    .from("products")
    .update({ stock: Math.max(0, Math.round(stock)) })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/products");
  return { ok: true };
}

/* ── product photography ───────────────────────────────────────────────*/

export async function uploadProductImage(formData: FormData): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const productId = str(formData, "product_id");
  const file = formData.get("file");
  if (!productId) return { ok: false, error: "Which piece is this for?" };
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image first." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "Images must be under 8 MB." };
  }
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
    return { ok: false, error: "JPEG, PNG, WebP or AVIF, please." };
  }

  const db = createAdminSupabase();
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${productId}/${Date.now()}.${ext}`;

  const { error: upErr } = await db.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (upErr) return { ok: false, error: upErr.message };

  const { count } = await db
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const { error } = await db.from("product_images").insert({
    product_id: productId,
    storage_path: path,
    alt: str(formData, "alt"),
    position: count ?? 0,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true, message: "Photograph added" };
}

export async function deleteProductImage(imageId: string): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const db = createAdminSupabase();
  const { data } = await db
    .from("product_images")
    .select("storage_path")
    .eq("id", imageId)
    .maybeSingle();

  if (data?.storage_path) {
    await db.storage.from("product-images").remove([data.storage_path]);
  }
  const { error } = await db.from("product_images").delete().eq("id", imageId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true, message: "Photograph removed" };
}

/* ── categories ────────────────────────────────────────────────────────*/

export async function saveCategory(formData: FormData): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) return { ok: false, error: "A room needs a name." };

  const row = {
    name,
    slug: str(formData, "slug") || slugify(name),
    short_name: str(formData, "short_name") || name,
    blurb: str(formData, "blurb"),
    art_kind: str(formData, "art_kind") || "vessel",
    position: int(formData, "position"),
    is_active: bool(formData, "is_active"),
  };

  const db = createAdminSupabase();
  const { error } = id
    ? await db.from("categories").update(row).eq("id", id)
    : await db.from("categories").insert(row);

  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "That slug is already taken." : error.message,
    };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  return { ok: true, message: id ? "Room saved" : "Room added" };
}

export async function deleteCategory(id: string): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  /* Products point at categories with ON DELETE SET NULL, so removing a room
     orphans its pieces rather than deleting them. Warn if any would be. */
  const db = createAdminSupabase();
  const { count } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return {
    ok: true,
    message: count
      ? `Room removed — ${count} piece${count === 1 ? "" : "s"} now have no room`
      : "Room removed",
  };
}

/* ── the inboxes ───────────────────────────────────────────────────────*/

export async function setMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const { error } = await createAdminSupabase()
    .from("contact_messages")
    .update({ status })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inbox");
  return { ok: true };
}

export async function setRepairStatus(
  id: string,
  status: RepairStatus,
): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const { error } = await createAdminSupabase()
    .from("repairs")
    .update({ status })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/inbox");
  revalidatePath("/account/repairs");
  return { ok: true };
}

/* ── settings ──────────────────────────────────────────────────────────*/

export async function saveSettings(formData: FormData): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const fee = int(formData, "delivery_fee", -1);
  const free = int(formData, "free_delivery_from", -1);
  if (fee < 0) return { ok: false, error: "Delivery fee must be zero or more." };
  if (free < 0) return { ok: false, error: "The free-delivery threshold must be zero or more." };

  const rows = [
    { key: SETTING_KEYS.deliveryFee, value: fee },
    { key: SETTING_KEYS.freeDeliveryFrom, value: free },
    { key: SETTING_KEYS.storeOpen, value: bool(formData, "store_open") },
    { key: SETTING_KEYS.announcement, value: str(formData, "announcement").slice(0, 300) },
    { key: SETTING_KEYS.atelierAddress, value: str(formData, "atelier_address") },
    { key: SETTING_KEYS.atelierHours, value: str(formData, "atelier_hours") },
    { key: SETTING_KEYS.atelierPhone, value: str(formData, "atelier_phone") },
    { key: SETTING_KEYS.atelierEmail, value: str(formData, "atelier_email") },
  ];

  const { error } = await createAdminSupabase()
    .from("settings")
    .upsert(rows, { onConflict: "key" });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved" };
}

/* ── customers ─────────────────────────────────────────────────────────*/

export async function setCustomerAdmin(
  userId: string,
  isAdmin: boolean,
): Promise<AdminResult> {
  const denied = await guard();
  if (denied) return denied;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* Removing your own last admin flag would lock everyone out of /admin. */
  if (user?.id === userId && !isAdmin) {
    return { ok: false, error: "You cannot remove your own administrator access." };
  }

  const { error } = await createAdminSupabase()
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/customers");
  return { ok: true, message: isAdmin ? "Made an administrator" : "Administrator access removed" };
}
