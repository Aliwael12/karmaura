"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setMessageStatus } from "@/app/actions/admin";
import type { MessageStatus } from "@/lib/supabase/types";

const MESSAGE_MOVES: { to: MessageStatus; label: string }[] = [
  { to: "new", label: "Unread" },
  { to: "read", label: "Read" },
  { to: "archived", label: "Archived" },
];

export default function InboxItem({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const moves = MESSAGE_MOVES.map((m) => ({ ...m, to: m.to as string }));

  return (
    <div className="flex flex-wrap gap-1.5">
      {moves.map((m) => (
        <button
          key={m.to}
          type="button"
          disabled={pending || status === m.to}
          onClick={() =>
            start(async () => {
              await setMessageStatus(id, m.to as MessageStatus);
              router.refresh();
            })
          }
          className={`rounded border px-2.5 py-1 text-[10px] tracking-[.12em] uppercase transition-colors duration-300 ${
            status === m.to
              ? "border-gold bg-gold/15 text-gold-bright"
              : "border-cream/20 text-cream/45 hover:border-gold/50 hover:text-cream disabled:opacity-40"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
