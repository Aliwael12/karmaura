"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setCustomerAdmin } from "@/app/actions/admin";

export default function AdminToggle({
  userId,
  isAdmin,
  isSelf,
}: {
  userId: string;
  isAdmin: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  if (isSelf) {
    return (
      <span className="text-[10px] tracking-[.14em] text-gold-bright uppercase">
        you
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await setCustomerAdmin(userId, !isAdmin);
            if (!result.ok) setError(result.error ?? "Could not change that.");
            else {
              setError("");
              router.refresh();
            }
          })
        }
        className={`rounded border px-3 py-1 text-[10px] tracking-[.14em] uppercase transition-colors duration-300 disabled:opacity-50 ${
          isAdmin
            ? "border-gold bg-gold/15 text-gold-bright"
            : "border-cream/20 text-cream/45 hover:border-gold/50 hover:text-cream"
        }`}
      >
        {isAdmin ? "admin" : "make admin"}
      </button>
      {error && (
        <span className="mt-1 block text-[10px] text-gold-bright">{error}</span>
      )}
    </>
  );
}
