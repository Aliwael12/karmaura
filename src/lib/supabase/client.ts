"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * The browser's client. Carries the anon key, so every read it makes is
 * filtered by Row Level Security — it can see the shop window and the
 * signed-in visitor's own records, and nothing else.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
