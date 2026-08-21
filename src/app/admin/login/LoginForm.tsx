"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { adminSignIn } from "@/app/actions/admin";

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    start(async () => {
      const result = await adminSignIn(formData);
      if (!result.ok) {
        setError(result.error ?? "Could not sign in.");
        return;
      }
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-gold/25 bg-forest-deep/70 p-7"
    >
      <div className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-2">
          <span className="text-xs text-cream/60">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="km-field km-field-dark"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs text-cream/60">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="km-field km-field-dark"
          />
        </label>

        {error && (
          <p role="alert" className="text-[13px] text-gold-bright">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1.5 rounded-lg border border-gold p-4 text-xs tracking-[.18em] text-cream uppercase transition-[background,color] duration-[400ms] hover:bg-gold hover:text-forest disabled:opacity-50"
        >
          {pending ? "Checking…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}
