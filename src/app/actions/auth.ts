"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export type AuthResult = { ok: boolean; error?: string; message?: string };

function readableAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password do not match.";
  if (m.includes("already registered")) return "That email already has a profile — sign in instead.";
  if (m.includes("password should be")) return "Use at least six characters for the password.";
  if (m.includes("rate limit")) return "Too many attempts. Try again in a minute.";
  return message;
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "An email and a password, please." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: readableAuthError(error.message) };

  revalidatePath("/", "layout");
  return { ok: true, message: "Welcome back" };
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return { ok: false, error: "A name, so we know who to write to." };
  if (!email || !password) {
    return { ok: false, error: "An email and a password, please." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Use at least six characters for the password." };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) return { ok: false, error: readableAuthError(error.message) };

  /* With email confirmation switched on, Supabase returns a user but no
     session — the visitor has to go and click the letter first. */
  if (!data.session) {
    return {
      ok: true,
      message: "Check your email to confirm the profile, then sign in.",
    };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Profile created" };
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/account");
}

export async function updateProfile(formData: FormData): Promise<AuthResult> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const full_name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/account", "layout");
  return { ok: true, message: "Profile saved" };
}
