import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Routes a signed-out visitor may reach. Everything else redirects to /login. */
const PUBLIC_PREFIXES = [
  "/",
  "/sample",
  "/login",
  "/signup",
  "/reset-password",
  "/auth",
];

function isPublic(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (p) => p !== "/" && (pathname === p || pathname.startsWith(p + "/")),
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Not configured yet. Let public pages render rather than 500 the whole site,
  // but never let an unconfigured deployment expose a protected route.
  if (!supabaseUrl || !supabaseKey) {
    if (isPublic(request.nextUrl.pathname)) return supabaseResponse;
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

  if (!claims && !isPublic(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
