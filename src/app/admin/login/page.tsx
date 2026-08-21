import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/db/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; denied?: string }>;
}) {
  const { next, denied } = await searchParams;

  const viewer = await getViewer();
  if (viewer?.isAdmin) redirect(next && next.startsWith("/admin") ? next : "/admin");

  return (
    <div className="grid min-h-screen place-items-center px-6 py-20">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full border border-gold bg-cream">
            <Image
              src="/brand/emblem.png"
              alt=""
              width={340}
              height={380}
              className="h-7 w-auto"
            />
          </span>
          <div>
            <p className="km-eyebrow text-gold-bright">KARMAURA</p>
            <p className="font-serif text-2xl text-cream">The back room</p>
          </div>
        </div>

        {denied && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-gold/40 bg-forest-deep/60 p-4 text-[13px] leading-[1.6] text-gold-bright"
          >
            That account is signed in, but it is not an administrator.
          </p>
        )}

        <LoginForm next={next} />

        <p className="mt-6 text-[11px] leading-[1.7] text-cream/40">
          Administrator accounts are made in Supabase and marked with{" "}
          <code className="text-cream/60">profiles.is_admin</code>. There is no
          sign-up here on purpose.
        </p>
      </div>
    </div>
  );
}
