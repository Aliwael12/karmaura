"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SESSION_KEY = "karmaura:sid";
const ATTRIBUTION_KEY = "karmaura:attribution";

export type Attribution = {
  session_id: string | null;
  referrer_host: string | null;
  social_referrer: string | null;
  utm: Record<string, string | null>;
};

/** A visit id that survives navigation but not a new tab-session. */
function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const made = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, made);
    return made;
  } catch {
    return "anonymous";
  }
}

function readUtm(search: string) {
  const p = new URLSearchParams(search);
  const pick = (k: string) => p.get(k)?.slice(0, 120) || null;
  return {
    source: pick("utm_source"),
    medium: pick("utm_medium"),
    campaign: pick("utm_campaign"),
    content: pick("utm_content"),
    term: pick("utm_term"),
  };
}

/**
 * What this visit should be credited to, kept for the whole visit so an
 * order placed three pages later still carries the campaign that brought
 * them in. Read at checkout and stored on the order.
 */
export function readAttribution(): Attribution | undefined {
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Records one row per page view. Fire-and-forget: a failed beacon must never
 * be visible to the person browsing.
 */
export default function Tracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const sid = sessionId();
    const utm = readUtm(window.location.search);

    /* First page of the visit wins the attribution — later internal
       navigation must not overwrite where they actually came from. */
    try {
      if (!sessionStorage.getItem(ATTRIBUTION_KEY)) {
        const referrer = document.referrer || null;
        let host: string | null = null;
        try {
          if (referrer) {
            const h = new URL(referrer).hostname.toLowerCase();
            host = h === window.location.hostname ? null : h;
          }
        } catch {
          host = null;
        }
        const attribution: Attribution = {
          session_id: sid,
          referrer_host: host,
          social_referrer: null,
          utm,
        };
        sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
      }
    } catch {
      /* private mode — attribution is simply not kept */
    }

    const payload = JSON.stringify({
      sessionId: sid,
      path: pathname,
      referrer: document.referrer || null,
      utm,
    });

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
