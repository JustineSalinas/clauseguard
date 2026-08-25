import Link from "next/link";
import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/password-forms";

export const metadata: Metadata = { title: "New password — ClauseGuard" };

export default function UpdatePassword() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
      <div>
        <Link href="/" className="font-display text-xl font-semibold tracking-tight">
          Clause<span className="text-flag">Guard</span>
        </Link>
        <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight">
          Choose a new password
        </h1>
        <p className="mt-2 text-ink-2">
          You&rsquo;ll be signed in once it&rsquo;s saved.
        </p>
      </div>

      <UpdatePasswordForm />
    </main>
  );
}
