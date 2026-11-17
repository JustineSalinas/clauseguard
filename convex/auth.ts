/**
 * Convex Auth setup. Password provider covers
 * email/password sign-up and sign-in (components/auth/auth-form.tsx);
 * Google covers "Continue with Google" (the same button and formAction).
 *
 * Email verification is enabled only when AUTH_RESEND_KEY is set as a
 * Convex environment variable (see ResendOTP.ts's header for the setup
 * command) -- without it, signup/signin behave exactly as before this was
 * added, same reasoning as the GoogleButton staying disabled until real
 * OAuth credentials exist: a feature that silently can't send its emails is
 * worse than one that isn't offered yet.
 */

import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { ResendOTP } from "./ResendOTP";

const emailVerificationEnabled = !!process.env.AUTH_RESEND_KEY;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({ verify: emailVerificationEnabled ? ResendOTP : undefined }),
    Google,
  ],
});
