"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOut } from "@phosphor-icons/react/ssr";
import { useStore } from "@/context/store";
import AuthPanel from "./AuthPanel";

const TABS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/saved", label: "Saved" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/repairs", label: "Repairs" },
];

/**
 * Everything under /account sits behind this. Signed out, it shows the
 * sign-in panel instead of the page — there is no server session to guard.
 */
export default function AccountShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { user, signOut, hydrated } = useStore();
  const pathname = usePathname();

  if (!hydrated) {
    return (
      <div className="km-gutter min-h-[60vh] bg-forest py-24">
        <p className="font-serif text-2xl text-cream/60 italic">
          Finding your account…
        </p>
      </div>
    );
  }

  if (!user) return <AuthPanel />;

  return (
    <div
      className="km-gutter min-h-full bg-forest"
      style={{
        paddingBlock: "clamp(34px,5cqw,80px) clamp(60px,8cqw,120px)",
      }}
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="km-eyebrow mb-3 text-gold-bright">Account</p>
          <h1 className="font-serif text-[clamp(28px,5cqw,48px)] leading-[1.06] text-cream">
            {title}
          </h1>
          <p className="mt-2 text-sm text-cream/60">
            {user.name} · {user.email}
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2.5 rounded-lg border border-gold/35 px-4 py-2.5 text-[11px] tracking-[.16em] text-cream/80 uppercase transition-[background,color] duration-300 hover:bg-gold hover:text-forest"
        >
          <SignOut size={16} weight="light" />
          Sign out
        </button>
      </div>

      <nav className="mb-9 flex flex-wrap gap-1 border-b border-gold/20 pb-4">
        {TABS.map((tab) => {
          const active =
            tab.href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-lg px-4 py-2.5 text-[11px] tracking-[.14em] uppercase transition-[background,color] duration-300 ${
                active
                  ? "bg-gold text-forest"
                  : "text-cream/65 hover:bg-gold/12 hover:text-cream"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
