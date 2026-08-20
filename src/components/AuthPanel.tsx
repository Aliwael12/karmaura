"use client";

import { useState, type FormEvent } from "react";
import {
  BookmarkSimple,
  EnvelopeOpen,
  Package,
} from "@phosphor-icons/react/ssr";
import { useStore } from "@/context/store";
import Reveal from "./Reveal";

const PERKS = [
  { Icon: Package, label: "Order history and repairs" },
  { Icon: BookmarkSimple, label: "Saved pieces and restock notes" },
  { Icon: EnvelopeOpen, label: "First word on small runs" },
];

export default function AuthPanel() {
  const { signIn } = useStore();
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const registering = tab === "register";

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setError("An email and a password, please.");
      return;
    }
    if (registering && !form.name.trim()) {
      setError("A name, so we know who to write to.");
      return;
    }
    setError("");
    signIn(form.email.trim(), registering ? form.name.trim() : undefined);
  }

  return (
    <div
      className="km-gutter min-h-full bg-forest"
      style={{
        paddingBlock: "clamp(40px,6cqw,110px) clamp(60px,8cqw,120px)",
      }}
    >
      <div
        className="grid max-w-[980px] grid-cols-[repeat(auto-fit,minmax(min(100%,290px),1fr))] items-start"
        style={{ gap: "clamp(26px,4cqw,64px)" }}
      >
        <Reveal delay={0}>
          <p className="km-eyebrow mb-4 text-gold-bright">Account</p>
          <h1 className="font-serif text-[clamp(30px,6cqw,56px)] leading-[1.06] text-cream italic">
            Home that feels like you.
          </h1>
          <div className="km-rule my-[26px] w-[min(200px,50%)]" />
          <div className="flex max-w-[44ch] flex-col gap-4">
            <p className="text-[15px] leading-[1.66] text-cream/75">
              An account keeps your addresses and the record of every piece you
              own — so a repair is one message, not a search.
            </p>
            <div className="mt-1.5 flex flex-col gap-2.5">
              {PERKS.map(({ Icon, label }) => (
                <p
                  key={label}
                  className="flex items-center gap-[11px] text-sm text-cream/80"
                >
                  <Icon size={19} weight="light" className="text-gold-bright" />
                  {label}
                </p>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <form
            onSubmit={submit}
            noValidate
            className="rounded-lg border border-gold/28 bg-forest-deep/70 p-[clamp(22px,3cqw,34px)]"
          >
            <div className="mb-6 flex gap-1 rounded-lg border border-gold/25 p-1">
              <Tab active={!registering} onClick={() => setTab("signin")}>
                Sign in
              </Tab>
              <Tab active={registering} onClick={() => setTab("register")}>
                Create account
              </Tab>
            </div>

            <div className="flex flex-col gap-3.5">
              {registering && (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Name"
                  autoComplete="name"
                  className="km-field km-field-dark"
                />
              )}
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                autoComplete="email"
                className="km-field km-field-dark"
              />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                autoComplete={registering ? "new-password" : "current-password"}
                className="km-field km-field-dark"
              />

              {error && (
                <p role="alert" className="text-[13px] text-gold-bright">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="mt-1.5 rounded-lg border border-gold p-4 text-xs tracking-[.18em] text-cream uppercase transition-[background,color] duration-[400ms] hover:bg-gold hover:text-forest"
              >
                {registering ? "Create account" : "Sign in"}
              </button>

              <button
                type="button"
                onClick={() => setError("A reset letter is on its way.")}
                className="mt-1 text-center text-[13px] text-gold-bright hover:underline hover:underline-offset-4"
              >
                Forgotten password
              </button>

              <p className="text-center text-[11px] leading-[1.6] text-cream/45">
                A demonstration account — any email and password will do, and
                nothing leaves this browser.
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-md p-3 text-[11px] tracking-[.14em] uppercase transition-[background,color] duration-300 ${
        active ? "bg-gold text-forest" : "bg-transparent text-cream/70"
      }`}
    >
      {children}
    </button>
  );
}
