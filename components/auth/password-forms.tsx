"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Mail, Lock, KeyRound } from "lucide-react";

export function RequestResetForm() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn("password", { email, flow: "reset" });
      setSent(true);
    } catch {
      setError(
        "Password reset email delivery is not configured yet. Please contact support or your capstone administrator."
      );
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4">
        <Alert className="border-[#e8c6a8]/40 bg-[#fbeee4]/10 p-3 text-white backdrop-blur-md">
          <AlertDescription className="text-xs text-[#e8c6a8]">
            If that email has an account, a verification code is on its way. Enter it below along with your new password.
          </AlertDescription>
        </Alert>
        <UpdatePasswordForm email={email} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert
          variant="destructive"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200 backdrop-blur-md"
        >
          <AlertCircle className="size-4 shrink-0 text-red-400" />
          <AlertDescription className="text-xs leading-relaxed">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-xs font-medium text-white/80">
          Email address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/[0.12] bg-[#12141a]/85 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 transition-all focus:border-[#b04000] focus:outline-none focus:ring-1 focus:ring-[#b04000] hover:border-white/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#b04000] via-[#c84805] to-[#dc580f] px-4 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(176,64,0,0.35)] transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span>Sending code…</span>
          </span>
        ) : (
          <span>Send reset code</span>
        )}
      </button>
    </form>
  );
}

export function UpdatePasswordForm({ email: initialEmail }: { email?: string }) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn("password", {
        email,
        code,
        newPassword: password,
        flow: "reset-verification",
      });
      router.push("/dashboard");
    } catch {
      setError("That verification code is invalid or has expired. Please request a new code.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <Alert
          variant="destructive"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200 backdrop-blur-md"
        >
          <AlertCircle className="size-4 shrink-0 text-red-400" />
          <AlertDescription className="text-xs leading-relaxed">{error}</AlertDescription>
        </Alert>
      )}

      {!initialEmail && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reset-email" className="text-xs font-medium text-white/80">
            Email address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/[0.12] bg-[#12141a]/85 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 transition-all focus:border-[#b04000] focus:outline-none focus:ring-1 focus:ring-[#b04000] hover:border-white/20"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="code" className="text-xs font-medium text-white/80">
          Verification code
        </Label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            placeholder="Code from your email"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/[0.12] bg-[#12141a]/85 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 transition-all focus:border-[#b04000] focus:outline-none focus:ring-1 focus:ring-[#b04000] hover:border-white/20"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-xs font-medium text-white/80">
          New password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/[0.12] bg-[#12141a]/85 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 transition-all focus:border-[#b04000] focus:outline-none focus:ring-1 focus:ring-[#b04000] hover:border-white/20"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#b04000] via-[#c84805] to-[#dc580f] px-4 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(176,64,0,0.35)] transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span>Saving new password…</span>
          </span>
        ) : (
          <span>Save new password</span>
        )}
      </button>
    </form>
  );
}
