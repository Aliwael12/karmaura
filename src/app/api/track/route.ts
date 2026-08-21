import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Hosts we care to name, so the breakdowns read as brands not domains. */
const SOCIAL_HOSTS: Record<string, string> = {
  "instagram.com": "instagram",
  "www.instagram.com": "instagram",
  "l.instagram.com": "instagram",
  "facebook.com": "facebook",
  "www.facebook.com": "facebook",
  "m.facebook.com": "facebook",
  "l.facebook.com": "facebook",
  "lm.facebook.com": "facebook",
  "tiktok.com": "tiktok",
  "www.tiktok.com": "tiktok",
  "vm.tiktok.com": "tiktok",
  "twitter.com": "twitter",
  "x.com": "twitter",
  "t.co": "twitter",
  "youtube.com": "youtube",
  "www.youtube.com": "youtube",
  "youtu.be": "youtube",
  "pinterest.com": "pinterest",
  "www.pinterest.com": "pinterest",
  "wa.me": "whatsapp",
  "api.whatsapp.com": "whatsapp",
};

function classify(referrer: string | null) {
  if (!referrer) return { host: null, social: null };
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return { host, social: SOCIAL_HOSTS[host] ?? null };
  } catch {
    return { host: null, social: null };
  }
}

const clip = (v: unknown, n: number) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null;

export async function POST(request: Request) {
  let body: {
    referrer?: string;
    path?: string;
    sessionId?: string;
    utm?: Record<string, unknown>;
  } = {};
  try {
    body = await request.json();
  } catch {
    /* sendBeacon can arrive with nothing in it */
  }

  const h = request.headers;
  const country = h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? null;
  const region = h.get("x-vercel-ip-country-region") ?? null;
  const city = (() => {
    const raw = h.get("x-vercel-ip-city");
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  })();

  const referrer = clip(body.referrer, 500) ?? h.get("referer");
  const { host, social } = classify(referrer);
  const utm = body.utm ?? {};

  try {
    await createAdminSupabase()
      .from("sessions")
      .insert({
        session_id: clip(body.sessionId, 64),
        path: clip(body.path, 300),
        referrer,
        referrer_host: host,
        social_referrer: social,
        country,
        region,
        city,
        utm: {
          source: clip(utm.source, 80),
          medium: clip(utm.medium, 80),
          campaign: clip(utm.campaign, 120),
          content: clip(utm.content, 120),
          term: clip(utm.term, 120),
        },
      });
  } catch {
    /* Analytics must never break a page view. Swallow and move on. */
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}
