import Link from "next/link";
import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/password-forms";
import { LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "New password | ClauseGuard",
  description: "Set a new password for your ClauseGuard account.",
};

export default function UpdatePassword() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#08090a] px-4 py-12 select-none">
      {/* Directional Light Beam from Top-Right */}
      <div
        className="pointer-events-none absolute -top-40 -right-20 h-[700px] w-[700px] opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.45) 0%, rgba(176, 64, 0, 0.25) 35%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(176, 64, 0, 0.5) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Glassmorphic Card */}
        <main className="rounded-[28px] border border-white/[0.12] bg-[#121316]/75 p-8 shadow-[0_24px_64px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-2xl sm:p-10">
          <div className="mb-5 flex justify-center">
            <Link href="/" className="transition-transform hover:scale-105" title="ClauseGuard">
              <LogoMark size="xl" />
            </Link>
          </div>

          <div className="mb-6 text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-[1.625rem]">
              New Password
            </h1>
            <p className="mt-1.5 text-sm text-white/60">
              Enter the verification code and your new password.
            </p>
          </div>

          <UpdatePasswordForm />

          <p className="mt-6 text-center text-xs text-white/50">
            <Link
              href="/login"
              className="font-medium text-white transition-colors hover:text-[#e8c6a8] hover:underline underline-offset-4"
            >
              Back to sign in
            </Link>
          </p>
        </main>

        <footer className="mt-6 text-center text-[0.6875rem] text-white/35">
          Protected under RA 10173 (Data Privacy Act of 2012)
        </footer>
      </div>
    </div>
  );
}
