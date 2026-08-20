"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle } from "@phosphor-icons/react/ssr";
import { useStore } from "@/context/store";

export default function ContactForm() {
  const { flash } = useStore();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("A name, an email and a note, please.");
      return;
    }
    setError("");
    setSent(true);
    flash("Thank you — we will write back");
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-[rgba(95,106,66,.2)] bg-cream-light p-[clamp(22px,3cqw,34px)]">
        <CheckCircle size={34} weight="light" className="mb-4 text-gold" />
        <p className="mb-3 font-serif text-2xl text-forest">
          Your note is with us
        </p>
        <p className="mb-6 text-sm leading-[1.7] text-olive">
          We read everything ourselves, so a reply takes a day or two rather
          than a minute. Thank you for your patience, {form.name.split(" ")[0]}.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setForm({ name: "", email: "", message: "" });
          }}
          className="km-arrow border-b-[rgba(95,106,66,.3)] text-olive"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-lg border border-[rgba(95,106,66,.2)] bg-cream-light p-[clamp(22px,3cqw,34px)]"
    >
      <p className="km-label mb-5 text-olive">Write to us</p>
      <div className="flex flex-col gap-4">
        <Field label="Name">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            className="km-field km-field-light !bg-cream"
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="km-field km-field-light !bg-cream"
          />
        </Field>
        <Field label="Message">
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Trade enquiry, a repair, a question"
            className="km-field km-field-light resize-y !bg-cream"
          />
        </Field>

        {error && (
          <p role="alert" className="text-[13px] text-brass">
            {error}
          </p>
        )}

        <button type="submit" className="km-btn km-btn-light mt-1 w-full">
          Send
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs text-moss">{label}</span>
      {children}
    </label>
  );
}
