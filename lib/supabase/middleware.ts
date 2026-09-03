import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes that require a signed-in session. Everything else is public by
 * default.
 *
 * This used to be an allowlist -- every public route had to be added by
 * hand. It silently broke robots.txt, sitemap.xml, the generated icon and OG
 * image routes, and the custom 404 page: none were in the list, so a
 * signed-out visitor hitting any of them, or any nonexistent URL, was
 * redirected to /login instead of getting the actual response. A denylist
 * only needs updating when something genuinely new goes behind auth, which is
 * the rarer and more deliberate event -- the next public page anyone adds
 * (a metadata route, a future /pricing) just works.
 *
 * /update-password is protected on purpose: it is reachable only after the
 * password-reset link has established a session via /auth/confirm, and
 * treating it as public would let anyone who guesses the URL land on a form
 * with no session behind it.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/update-password"];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Not configured yet. Let public pages render rather than 500 the whole site,
  // but never let an unconfigured deployment expose a protected route.
  if (!supabaseUrl || !supabaseKey) {
    if (!isProtected(request.nextUrl.pathname)) return supabaseResponse;
    const to = request.nextUrl.clone();
    to.pathname = "/login";
    return NextResponse.redirect(to);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Nothing may run between createServerClient and this call. Any await in
  // between can leave the session unrefreshed and log users out at random.
  // getClaims validates the JWT signature against the project's published
  // keys; getSession reads local storage and must not be trusted server-side.
  let claims: unknown = null;
  try {
    const { data } = await supabase.auth.getClaims();
    claims = data?.claims ?? null;
  } catch {
    // Auth server unreachable. Public pages still render; protected routes
    // fall through to the redirect below rather than failing open.
    claims = null;
  }

  if (!claims && isProtected(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
