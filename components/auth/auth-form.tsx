"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

function GoogleButton({ pending, onClick }: { pending: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 text-sm font-medium text-white transition-all hover:bg-white/[0.1] hover:border-white/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg viewBox="0 0 18 18" className="size-4.5 shrink-0" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
        />
        <path
          fill="#FBBC05"
          d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}

export function AuthForm({
  mode,
  next = "/dashboard",
}: {
  mode: "signin" | "signup";
  next?: string;
}) {
  const isSignUp = mode === "signup";
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      await signIn("password", {
        email,
        password,
        flow: isSignUp ? "signUp" : "signIn",
      });
      router.push(next);
    } catch {
      setError(
        isSignUp
          ? "Unable to create account. This email may already be registered."
          : "Invalid email or password combination. Please double-check your credentials."
      );
    } finally {
      setPending(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setPending(true);
    try {
      await signIn("google", { redirectTo: next });
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Google sign-in is not configured yet. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in Convex to enable Google OAuth. Please sign in with email and password.";
      setError(
        message.includes("AUTH_GOOGLE")
          ? message
          : "Google sign-in is not configured yet. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in Convex to enable Google OAuth. Please use your email and password."
      );
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

      {/* Email input */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-xs font-medium text-white/80">
          Email address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border border-white/[0.12] bg-white/[0.06] pl-10 text-sm text-white placeholder:text-white/35 transition-colors hover:border-white/20 focus-visible:border-[#b04000] focus-visible:ring-1 focus-visible:ring-[#b04000]"
          />
        </div>
      </div>

      {/* Password input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-medium text-white/80">
            Password
          </Label>
          {!isSignUp && (
            <Link
              href="/reset-password"
              className="text-xs text-white/50 transition-colors hover:text-[#e8c6a8]"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            minLength={isSignUp ? 8 : undefined}
            placeholder={isSignUp ? "At least 8 characters" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl border border-white/[0.12] bg-white/[0.06] pl-10 pr-10 text-sm text-white placeholder:text-white/35 transition-colors hover:border-white/20 focus-visible:border-[#b04000] focus-visible:ring-1 focus-visible:ring-[#b04000]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {/* Submit button in ClauseGuard signature copper */}
      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-11 w-full cursor-pointer rounded-xl bg-[#b04000] text-sm font-semibold text-white shadow-lg shadow-[#b04000]/25 transition-all hover:bg-[#8a3300] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <span>{isSignUp ? "Creating account…" : "Signing in…"}</span>
          </span>
        ) : (
          <span>{isSignUp ? "Sign up" : "Sign in"}</span>
        )}
      </Button>

      {/* Subtle Hairline Divider */}
      <div className="relative my-1 flex items-center justify-center">
        <div className="w-full border-t border-white/[0.08]" />
        <span className="absolute bg-[#121316] px-3 font-mono text-[0.625rem] font-medium tracking-widest text-white/40 uppercase">
          OR
        </span>
      </div>

      {/* Google OAuth button */}
      <GoogleButton pending={pending} onClick={handleGoogle} />
    </form>
  );
}
