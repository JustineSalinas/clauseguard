import Link from "next/link";
import type { Metadata } from "next";
import { RequestResetForm } from "@/components/auth/password-forms";

export const metadata: Metadata = { title: "Reset password — ClauseGuard" };

export default function ResetPassword() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div>
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          Clause<span className="text-flag">Guard</span>
        </Link>
        <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="mt-2 text-ink-2">
          We&rsquo;ll email you a link to set a new one.
        </p>
      </div>

      <RequestResetForm />

      <p className="text-[0.9375rem] text-ink-2">
        Remembered it?{" "}
        <Link
          href="/login"
          className="text-ink underline underline-offset-4 hover:text-flag"
        >
          Back to sign in
        </Link>
      </p>
    </main>
  );
}
