import { requireAdmin } from "@/lib/db/auth";
import { createAdminSupabase } from "@/lib/supabase/server";
import { EmptyNote, PageHead, Panel } from "../ui";
import InboxItem from "./InboxItem";
import type { ContactMessageRow, NewsletterRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function AdminInbox() {
  await requireAdmin();
  const db = createAdminSupabase();

  const [messagesRes, lettersRes] = await Promise.all([
    db.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200),
    db
      .from("newsletter_subscribers")
      .select("*")
      .is("unsubscribed_at", null)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const messages = (messagesRes.data ?? []) as unknown as ContactMessageRow[];
  const letters = (lettersRes.data ?? []) as unknown as NewsletterRow[];

  const unread = messages.filter((m) => m.status === "new").length;

  return (
    <>
      <PageHead eyebrow="Inbox" title="Notes and letters">
        <p className="text-sm text-cream/50">
          {unread} unread · {letters.length} on the list
        </p>
      </PageHead>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Written to us">
          {messages.length === 0 ? (
            <EmptyNote>No notes yet</EmptyNote>
          ) : (
            <ul className="flex flex-col gap-3">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className={`rounded-lg border p-4 ${
                    m.status === "new"
                      ? "border-gold/40 bg-forest-night/40"
                      : "border-gold/15 bg-transparent"
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-cream">
                      {m.name}
                      <a
                        href={`mailto:${m.email}`}
                        className="ml-2 text-[12px] text-gold-bright hover:underline hover:underline-offset-4"
                      >
                        {m.email}
                      </a>
                    </span>
                    <span className="text-[11px] text-cream/40">{when(m.created_at)}</span>
                  </div>
                  <p className="mb-3 text-sm leading-[1.7] whitespace-pre-wrap text-cream/75">
                    {m.message}
                  </p>
                  <InboxItem id={m.id} status={m.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel
            title="Letters, twice a season"
            action={
              <span className="text-[11px] text-cream/40">
                {letters.length} subscribed
              </span>
            }
          >
            {letters.length === 0 ? (
              <p className="py-4 text-sm text-cream/40">Nobody yet.</p>
            ) : (
              <>
                <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-2 text-sm">
                  {letters.map((l) => (
                    <li key={l.id} className="flex justify-between gap-4">
                      <span className="truncate text-cream/70">{l.email}</span>
                      <span className="shrink-0 text-[11px] text-cream/35">
                        {new Date(l.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-gold/15 pt-3 text-[11px] leading-[1.6] text-cream/35">
                  Sending is deliberately not built in. Export these addresses
                  into whichever letter tool the house uses.
                </p>
              </>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
