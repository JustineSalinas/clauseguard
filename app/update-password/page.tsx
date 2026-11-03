import Link from "next/link";
import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/password-forms";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "New password | ClauseGuard",
  description: "Set a new password for your ClauseGuard account.",
};

export default function UpdatePassword() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafbfc] px-4 py-12 select-none">
      <div className="w-full max-w-[420px]">
        {/* Clean Light Card */}
        <main className="rounded-2xl border border-[#e2e4e8] bg-white p-8 shadow-xs sm:p-10">
          <div className="mb-6 flex justify-center">
            <Logo size="md" href="/" theme="light" />
          </div>

          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#08090a]">
              Set New Password
            </h1>
            <p className="mt-1.5 text-sm text-[#525866]">
              Enter the verification code and your new password.
            </p>
          </div>

          <UpdatePasswordForm />

          <p className="mt-6 text-center text-xs text-[#525866]">
            <Link
              href="/login"
              className="font-semibold text-[#b04000] hover:underline underline-offset-4"
            >
              Back to sign in
            </Link>
          </p>
        </main>

        <footer className="mt-6 text-center text-[0.6875rem] text-[#868c98]">
          Protected under RA 10173 (Data Privacy Act of 2012)
        </footer>
      </div>
    </div>
  );
}
