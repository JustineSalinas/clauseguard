/**
 * Convex Auth setup, replacing Supabase Auth. Password provider covers
 * email/password sign-up and sign-in (components/auth/auth-form.tsx);
 * Google covers "Continue with Google" (the same button, formAction, and
 * formNoValidate fix carry over unchanged -- only what's behind the
 * formAction changes).
 *
 * Email confirmation and password-reset emails (the branded templates we
 * built for Supabase) need to be re-created here -- Convex Auth calls out
 * to Resend/your own SMTP via a provider config, it doesn't have Supabase's
 * built-in templated-email system. Not wired yet; see convex/README.md.
 */

import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Google],
});
