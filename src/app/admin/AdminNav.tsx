"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { SignOut } from "@phosphor-icons/react/ssr";
import { adminSignOut } from "@/app/actions/admin";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Rooms" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const [pending, start] = useTransition();

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-forest-night/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-[clamp(16px,3vw,40px)] py-4">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full border border-gold bg-cream">
            <Image
              src="/brand/emblem.png"
              alt=""
              width={340}
              height={380}
              className="h-5 w-auto"
            />
          </span>
          <span className="text-[11px] tracking-[.24em] text-cream/70 uppercase">
            Admin
          </span>
        </Link>

        <nav className="order-3 flex w-full flex-wrap gap-1 md:order-2 md:w-auto md:flex-1">
          {LINKS.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3.5 py-2 text-[11px] tracking-[.14em] uppercase transition-[background,color] duration-300 ${
                  active
                    ? "bg-gold text-forest"
                    : "text-cream/60 hover:bg-gold/12 hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="order-2 ml-auto flex items-center gap-3 md:order-3">
          <span className="hidden text-right text-[11px] leading-tight text-cream/50 sm:block">
            {name}
            <br />
            {email}
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => start(() => void adminSignOut())}
            className="flex items-center gap-2 rounded-lg border border-gold/35 px-3 py-2 text-[11px] tracking-[.14em] text-cream/80 uppercase transition-[background,color] duration-300 hover:bg-gold hover:text-forest disabled:opacity-50"
          >
            <SignOut size={15} weight="light" />
            {pending ? "…" : "Sign out"}
          </button>
        </div>
      </div>
    </header>
  );
}
