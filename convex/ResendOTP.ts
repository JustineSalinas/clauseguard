/**
 * The email-verification provider Password's `verify` option wraps around:
 * generates a 6-digit code, emails it via Resend's REST API (no `resend`
 * npm dependency -- a single fetch call does the whole job), and Convex
 * Auth's own Email() helper (@convex-dev/auth/providers/Email) handles
 * matching the code back to the account.
 *
 * Needs a real Resend account + API key (ask Salinas -- same credential
 * gap as PayMongo, nothing here can provision one). Set it as a Convex
 * environment variable on BOTH deployments, never in .env.local (Convex
 * functions read their own env, separate from Next.js/.env.local):
 *   npx convex env set AUTH_RESEND_KEY re_xxx           (dev)
 *   npx convex env set AUTH_RESEND_KEY re_xxx --prod     (prod)
 * convex/auth.ts only enables verification when that variable is set, so
 * signup/signin behave exactly as before until it is.
 */

import { Email } from "@convex-dev/auth/providers/Email";

// Convex auth providers run outside the Node.js runtime by default (no
// "use node"), so node:crypto isn't available -- Web Crypto's
// getRandomValues is.
function generateCode(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return (bytes[0] % 1_000_000).toString().padStart(6, "0");
}

export const ResendOTP = Email({
  id: "resend-otp",
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    return generateCode();
  },
  async sendVerificationRequest({ identifier: email, token }) {
    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) {
      throw new Error("AUTH_RESEND_KEY is not set -- email verification should not be enabled without it.");
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ClauseGuard <onboarding@resend.dev>",
        to: [email],
        subject: `${token} is your ClauseGuard verification code`,
        text: `Your ClauseGuard verification code is ${token}. It expires in 15 minutes.`,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Resend API error (${res.status}): ${body}`);
    }
  },
});
