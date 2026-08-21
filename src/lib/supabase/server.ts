import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createRawClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * The server's view of the signed-in visitor. Reads the session from cookies
 * and still runs under Row Level Security, so it is safe to hand a page's own
 * data straight from here.
 */
export async function createServerSupabase() {
  const store = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(list) {
          try {
            for (const { name, value, options } of list) {
              store.set(name, value, options);
            }
          } catch {
            /* Called from a Server Component, where cookies are read-only.
               Refresh is handled in middleware, so this is safe to swallow. */
          }
        },
      },
    },
  );
}

/**
 * The service-role client. Bypasses Row Level Security entirely, so it must
 * never be constructed anywhere a browser can reach — only inside route
 * handlers and server actions that have already checked who is asking.
 */
export function createAdminSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing — server-side writes cannot run.",
    );
  }
  return createRawClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
