import "server-only";

import { createServerSupabase } from "@/lib/supabase/server";

export type StoreSettings = {
  deliveryFee: number;
  freeDeliveryFrom: number;
  storeOpen: boolean;
  announcement: string;
};

/** What the shop falls back to if a key has not been seeded yet. */
export const DEFAULT_SETTINGS: StoreSettings = {
  deliveryFee: 900,
  freeDeliveryFrom: 12_500,
  storeOpen: true,
  announcement: "",
};

const KEYS: Record<keyof StoreSettings, string> = {
  deliveryFee: "delivery_fee",
  freeDeliveryFrom: "free_delivery_from",
  storeOpen: "store_open",
  announcement: "announcement",
};

export async function getSettings(): Promise<StoreSettings> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from("settings").select("key, value");

  /* Settings are decoration on top of a working shop — if the table cannot be
     read, serve the defaults rather than failing the page. */
  if (error || !data) return DEFAULT_SETTINGS;

  const map = new Map(data.map((r) => [r.key, r.value]));
  const read = <T>(key: string, fallback: T): T => {
    const raw = map.get(key);
    return raw === undefined || raw === null ? fallback : (raw as T);
  };

  return {
    deliveryFee: Number(read(KEYS.deliveryFee, DEFAULT_SETTINGS.deliveryFee)),
    freeDeliveryFrom: Number(
      read(KEYS.freeDeliveryFrom, DEFAULT_SETTINGS.freeDeliveryFrom),
    ),
    storeOpen: Boolean(read(KEYS.storeOpen, DEFAULT_SETTINGS.storeOpen)),
    announcement: String(read(KEYS.announcement, DEFAULT_SETTINGS.announcement)),
  };
}

export const SETTING_KEYS = KEYS;
