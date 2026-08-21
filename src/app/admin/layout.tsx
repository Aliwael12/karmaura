import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/db/auth";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — KARMAURA admin" },
  robots: { index: false, follow: false },
};

/**
 * Everything under /admin is server-rendered behind this guard. The proxy
 * turns away anonymous visitors earlier, but the is_admin flag is only
 * trustworthy when read from the database, which is what happens here on
 * every single request.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewer();

  /* The login page renders inside this layout too, so a signed-out visitor
     must fall through rather than be refused. */
  if (!viewer?.isAdmin) {
    return <div className="min-h-screen bg-forest-black">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-forest-black text-cream">
      <AdminNav name={viewer.name} email={viewer.email} />
      <main className="mx-auto max-w-[1400px] px-[clamp(16px,3vw,40px)] pb-24">
        {children}
      </main>
      <footer className="border-t border-gold/15 px-[clamp(16px,3vw,40px)] py-6">
        <Link
          href="/"
          className="text-[11px] tracking-[.16em] text-cream/40 uppercase transition-colors hover:text-gold-bright"
        >
          ← Back to the shop
        </Link>
      </footer>
    </div>
  );
}
