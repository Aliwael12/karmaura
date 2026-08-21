import type { NextConfig } from "next";

/**
 * Product photography lives in Supabase Storage, on the project's own
 * hostname. next/image refuses any remote host it has not been told about,
 * so the host is derived from the same env var the client uses — no second
 * place to keep in step, and it follows the project if the ref ever changes.
 */
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
