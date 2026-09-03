import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to review a contract.",
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

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
          Sign in
        </h1>
        <p className="mt-2 text-ink-2">
          Pick up where you left off, or review something new.
        </p>
      </div>

      {error === "google" ? (
        <p className="rounded-sm border border-rule bg-flag-wash p-3 text-[0.875rem] text-flag">
          Google sign-in didn&rsquo;t complete. Try again, or use your email and
          password.
        </p>
      ) : null}

      <AuthForm mode="signin" next={next ?? "/dashboard"} />

      <p className="text-[0.9375rem] text-ink-2">
        No account yet?{" "}
        <Link
          href="/signup"
          className="text-ink underline underline-offset-4 hover:text-brand"
        >
          Create one
        </Link>
      </p>
    </main>
  );
}
