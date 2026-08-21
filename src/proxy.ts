import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session on every request that renders a page, so a
 * signed-in visitor's token never goes stale mid-browse, and guards /admin
 * before any of its code runs.
 *
 * (Next 16 renamed the `middleware` convention to `proxy`.)
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /* Without credentials the site still serves — it just has no session to
     refresh. Keeps `next build` and a fresh clone from exploding. */
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        for (const { name, value } of list) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touching getUser() is what performs the refresh — do not remove it.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  /* The admin gate. The definitive check is re-run server-side inside the
     admin pages and every /api/admin route; this is the cheap first door so
     an anonymous visitor never even reaches that code. */
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const to = request.nextUrl.clone();
      to.pathname = "/admin/login";
      to.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(to);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /* Everything except static assets and image files — those never carry a
       session worth refreshing. */
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)",
  ],
};
