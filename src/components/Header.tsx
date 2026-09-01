"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Handbag, List, User } from "@phosphor-icons/react/ssr";
import { useStore } from "@/context/store";

const LINKS = [
  { href: "/shop", label: "Collection" },
  { href: "/story", label: "The story" },
];

export default function Header() {
  const { count, hydrated, setCartOpen, setMenuOpen, bagPulse } = useStore();
  const [tight, setTight] = useState(false);
  const pathname = usePathname();

  /* the bar draws itself in as soon as the page moves off the top */
  useEffect(() => {
    const onScroll = () => setTight(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between gap-3.5 backdrop-blur-lg"
      style={{
        padding: tight
          ? "12px clamp(16px,4cqw,60px)"
          : "20px clamp(16px,4cqw,60px)",
        background: tight ? "rgba(41,57,27,.95)" : "rgba(61,92,43,.86)",
        borderBottom: `1px solid ${tight ? "rgba(172,157,98,.36)" : "rgba(172,157,98,.22)"}`,
        transition:
          "padding .5s cubic-bezier(.16,.84,.24,1), background .5s ease, border-color .5s ease",
      }}
    >
      <Link
        href="/"
        aria-label="KARMAURA HOME"
        className="flex shrink-0 items-center gap-[11px]"
      >
        <span
          className="grid size-[52px] shrink-0 place-items-center rounded-full border border-gold bg-cream"
          style={{ boxShadow: "0 0 22px -4px rgba(198,161,91,.5)" }}
        >
          <Image
            src="/brand/emblem.png"
            alt=""
            width={340}
            height={380}
            priority
            className="h-[32px] w-auto"
          />
        </span>
        <Image
          src="/brand/wordmark.png"
          alt="KARMAURA HOME"
          width={880}
          height={300}
          priority
          className="h-[30px] w-auto opacity-95"
        />
      </Link>

      <nav className="hidden items-center gap-[clamp(16px,2.6cqw,36px)] min-[760px]:flex">
        {LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className="km-label border-b border-transparent py-1.5 text-cream transition-[color,border-color] duration-300 hover:border-b-gold hover:text-gold-bright aria-[current=page]:border-b-gold aria-[current=page]:text-gold-bright"
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-0.5">
        <Link
          href="/account"
          aria-label="My profile"
          className="grid size-[42px] place-items-center rounded-lg text-cream transition-[background,color] duration-300 hover:bg-gold/15 hover:text-gold-bright"
        >
          <User size={21} weight="light" />
        </Link>

        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={`Bag${hydrated && count ? `, ${count} pieces` : ""}`}
          className="relative grid size-[42px] place-items-center rounded-lg text-cream transition-[background,color] duration-300 hover:bg-gold/15 hover:text-gold-bright"
        >
          <span
            key={bagPulse}
            className={bagPulse > 0 ? "block animate-bag" : "block"}
          >
            <Handbag size={21} weight="light" />
          </span>
          {hydrated && count > 0 && (
            <span className="absolute top-1 right-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-[9px] bg-gold px-1 text-[10px] font-medium tracking-[.02em] text-forest">
              {count}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Menu"
          className="grid size-[42px] place-items-center rounded-lg text-cream transition-[background] duration-300 hover:bg-gold/15 min-[760px]:hidden"
        >
          <List size={22} weight="light" />
        </button>
      </div>
    </header>
  );
}
