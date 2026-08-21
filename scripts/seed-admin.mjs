// Creates the first administrator through the Auth admin API, then flips the
// is_admin flag the profile trigger left at false.
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;

if (!url || !key || !email) {
  console.error("missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / ADMIN_EMAIL");
  process.exit(1);
}

const password =
  process.env.ADMIN_PASSWORD ?? randomBytes(12).toString("base64url");

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Reuse the account if it is already there rather than erroring out.
const { data: existing } = await db.auth.admin.listUsers({ perPage: 200 });
let user = existing?.users?.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase(),
);

if (user) {
  console.log("account already exists:", email);
  const { error } = await db.auth.admin.updateUserById(user.id, { password });
  if (error) throw new Error("could not reset password: " + error.message);
  console.log("password reset");
} else {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "KARMAURA" },
  });
  if (error) throw new Error("could not create: " + error.message);
  user = data.user;
  console.log("account created:", email);
}

// The trigger writes the profile row; give it a beat on a cold project.
await new Promise((r) => setTimeout(r, 800));

const { error: flagError } = await db
  .from("profiles")
  .upsert(
    { id: user.id, email, full_name: "KARMAURA", is_admin: true },
    { onConflict: "id" },
  );
if (flagError) throw new Error("could not mark as admin: " + flagError.message);

const { data: check } = await db
  .from("profiles")
  .select("email, full_name, is_admin")
  .eq("id", user.id)
  .single();

console.log("profile:", JSON.stringify(check));
console.log("PASSWORD:", password);
