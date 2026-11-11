/**
 * Convex Auth setup. Password provider covers
 * email/password sign-up and sign-in (components/auth/auth-form.tsx);
 * Google covers "Continue with Google" (the same button and formAction).
 *
 * Email confirmation and password-reset emails go through Resend or your own
 * SMTP via a provider config. Not wired yet.
 */

import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Google],
});
