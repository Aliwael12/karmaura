import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

export type Viewer = {
  id: string;
  email: string;
  name: string;
  phone: string;
  isAdmin: boolean;
};

/** Who is asking, or null. Safe to call from any server component. */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as ProfileRow | null;

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    /* A profile row is created by a trigger on sign-up; falling back to the
       email's local part covers the window before that lands, and any account
       created straight in the Supabase dashboard. */
    name:
      profile?.full_name?.trim() ||
      (user.email ?? "friend").split("@")[0].replace(/[._-]+/g, " "),
    phone: profile?.phone ?? "",
    isAdmin: profile?.is_admin ?? false,
  };
}

/** For /account pages: bounce to the sign-in panel when signed out. */
export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/account");
  return viewer;
}

/**
 * For /admin. The proxy already turned away anonymous visitors; this is the
 * check that actually matters, because it verifies the admin flag against the
 * database on every request rather than trusting a cookie.
 */
export async function requireAdmin(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/admin/login");
  if (!viewer.isAdmin) redirect("/admin/login?denied=1");
  return viewer;
}

/** The same check for route handlers, which answer with JSON not a redirect. */
export async function isAdminRequest(): Promise<boolean> {
  const viewer = await getViewer();
  return viewer?.isAdmin ?? false;
}
