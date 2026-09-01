"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useStore } from "@/context/store";

export default function Footer() {
  const { flash } = useStore();
  const [email, setEmail] = useState("");

  function subscribe(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      flash("An email, first");
      return;
    }
    setEmail("");
    flash("You are on the list");
  }

  return (
    <footer
      className="km-gutter border-t border-gold/20 bg-forest-night"
      style={{ paddingBlock: "clamp(40px,5.4cqw,80px) 30px" }}
    >
      <div
        className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] border-b border-gold/15"
        style={{
          gap: "clamp(26px,4cqw,56px)",
          paddingBottom: "clamp(30px,4cqw,50px)",
        }}
      >
        <div>
          <Image
            src="/brand/wordmark.png"
            alt="KARMAURA HOME"
            width={880}
            height={300}
            className="mb-[18px] h-[50px] w-auto opacity-90"
          />
          <p className="font-serif text-xl text-gold-bright italic">
            Good energy, good home.
          </p>
        </div>

        <FooterColumn title="Shop">
          <FooterLink href="/shop">All objects</FooterLink>
          <FooterLink href="/account/saved">Saved pieces</FooterLink>
          <FooterLink href="/account">My profile</FooterLink>
        </FooterColumn>

        <FooterColumn title="House">
          <FooterLink href="/story">The story</FooterLink>
        </FooterColumn>

        <div>
          <p className="mb-4 text-[11px] tracking-[.24em] text-cream/50 uppercase">
            Letters, twice a season
          </p>
          <form onSubmit={subscribe} className="flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="km-newsletter">
              Your email
            </label>
            <input
              id="km-newsletter"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="km-field km-field-dark min-w-0 flex-[1_1_140px] !p-[13px]"
            />
            <button
              type="submit"
              className="rounded-lg border border-gold px-[18px] py-[13px] text-[11px] tracking-[.16em] text-cream uppercase transition-[background,color] duration-[400ms] hover:bg-gold hover:text-forest"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      <p className="pt-[22px] text-xs text-cream/40">
        © 2026 KARMAURA · HOME — Cairo
      </p>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-4 text-[11px] tracking-[.24em] text-cream/50 uppercase">
        {title}
      </p>
      <div className="flex flex-col items-start gap-[11px]">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-cream/80 transition-colors duration-300 hover:text-gold-bright"
    >
      {children}
    </Link>
  );
}
