import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Standalone MINOXIPLUS assessment: everything is PUBLIC except /admin and
// /login. The public assessment must work for anonymous QR visitors, so we do
// NOT touch Supabase on those routes — that keeps them fast and means a missing
// env var can never take the public app down. Only the internal admin surface
// creates a Supabase client and checks the session.
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith("/login");
  const isAdmin = path === "/admin" || path.startsWith("/admin/");

  // Public route → no auth work at all.
  if (!isAdmin && !isLogin) {
    return NextResponse.next({ request });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Auth not configured yet — don't crash; let the request through (the /admin
  // page's allowlist check will still deny access).
  if (!url || !anon) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guard admin: anonymous → login.
  if (isAdmin && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  // Signed-in user hitting login → send to admin.
  if (isLogin && user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/admin";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return response;
}
