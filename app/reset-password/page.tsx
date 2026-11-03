import Link from "next/link";
import type { Metadata } from "next";
import { RequestResetForm } from "@/components/auth/password-forms";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Reset password | ClauseGuard",
  description: "Reset your ClauseGuard account password.",
};

export default function ResetPassword() {
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
              Reset Password
            </h1>
            <p className="mt-1.5 text-sm text-[#525866]">
              Enter your email to receive a verification code.
            </p>
          </div>

          <RequestResetForm />

          <p className="mt-6 text-center text-xs text-[#525866]">
            Remembered your credentials?{" "}
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
