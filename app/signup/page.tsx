import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an account to review a contract.",
};

export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div>
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight"
        >
          Clause<span className="text-brand">Guard</span>
        </Link>
        <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-ink-2">
          You&rsquo;ll need to verify your email before uploading a contract.
        </p>
      </div>

      <AuthForm mode="signup" next={next ?? "/dashboard"} />

      <p className="text-[0.9375rem] text-ink-2">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-ink underline underline-offset-4 hover:text-brand"
        >
          Sign in
        </Link>
      </p>

      <p className="text-[0.8125rem] leading-relaxed text-ink-3">
        Contracts you upload are private to your account. ClauseGuard is a
        first-pass review tool and does not give legal advice.
      </p>
    </main>
  );
}
