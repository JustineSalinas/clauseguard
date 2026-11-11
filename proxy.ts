import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

// Refreshes the Convex Auth session cookie on every matched request.
export default convexAuthNextjsMiddleware();

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
