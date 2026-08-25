import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create account — ClauseGuard" };

export default function Signup() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-24">
      <p className="font-body text-[0.6875rem] tracking-[0.14em] text-ink-3 uppercase">
        Not built yet
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-balance">
        Creating an account lands here.
      </h1>
      <p className="mt-5 leading-relaxed text-ink-2">
        Email and password, plus Google. Supabase Auth, with email verification
        required before a contract can be uploaded.
      </p>
      <Link
        href="/"
        className="mt-8 self-start rounded border border-rule-2 px-5 py-3 font-medium transition-colors hover:bg-raised"
      >
        Back to the homepage
      </Link>
    </main>
  );
}
