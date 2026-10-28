import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// Replaces lib/supabase/middleware.ts's updateSession: refreshes the Convex
// Auth session cookie on every matched request, same job the Supabase
// version did for its session.
export default convexAuthNextjsMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
