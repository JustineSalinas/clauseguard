"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthActions } from "@convex-dev/auth/react";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/brand/logo";

interface InteractiveAuthPanelProps {
  initialMode?: "signin" | "signup";
  next?: string;
  errorQuery?: string;
}

export function InteractiveAuthPanel({
  initialMode = "signin",
  next = "/dashboard",
  errorQuery,
}: InteractiveAuthPanelProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    errorQuery === "google"
      ? "Google sign-in could not be completed. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in Convex, or continue with email and password."
      : null
  );
  const [pending, setPending] = useState(false);

  const { signIn } = useAuthActions();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const isSignUp = mode === "signup";

  function switchMode(newMode: "signin" | "signup") {
    setError(null);
    setMode(newMode);
    startTransition(() => {
      window.history.replaceState(
        null,
        "",
        newMode === "signup"
          ? `/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`
          : `/login${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`
      );
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isSignUp && confirmPassword && password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (isSignUp && password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

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
          : "Google sign-in is not configured yet. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in Convex, or sign in with email and password.";
      setError(
        message.includes("AUTH_GOOGLE")
          ? message
          : "Google sign-in is not configured yet. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in Convex to enable Google OAuth. Please use your email and password."
      );
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-[#e5e7eb] bg-white p-6 sm:p-9 shadow-xs">
      <div className="w-full">
        {/* Brand Logo */}
        <div className="mb-6 flex justify-center">
          <Logo size="md" theme="light" />
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#08090a]">
            {isSignUp ? "Create your account" : "Sign in to ClauseGuard"}
          </h1>
          <p className="mt-1.5 text-sm text-[#525866]">
            {isSignUp
              ? "Start reviewing contracts against Philippine statutory law."
              : "Welcome back. Enter your credentials to access your workspace."}
          </p>
        </div>

        {/* Tab Switcher - Minimalist Underline */}
        <div className="relative mb-6 flex border-b border-[#e5e7eb]">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className={`relative pb-3 text-sm font-semibold transition-colors cursor-pointer mr-8 ${
              !isSignUp ? "text-[#08090a]" : "text-[#868c98] hover:text-[#525866]"
            }`}
          >
            <span>Sign In</span>
            {!isSignUp && (
              <motion.div
                layoutId="authTabUnderlineLight"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#b04000]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`relative pb-3 text-sm font-semibold transition-colors cursor-pointer ${
              isSignUp ? "text-[#08090a]" : "text-[#868c98] hover:text-[#525866]"
            }`}
          >
            <span>Create Account</span>
            {isSignUp && (
              <motion.div
                layoutId="authTabUnderlineLight"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#b04000]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-red-900"
          >
            <AlertCircle className="size-4 shrink-0 text-red-600" />
            <AlertDescription className="text-xs leading-relaxed">{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-email" className="text-xs font-semibold text-[#374151]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#868c98]" />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10.5 w-full rounded-lg border border-[#d1d5db] bg-white pl-10 pr-3.5 text-sm text-[#08090a] placeholder:text-[#9ca3af] transition-all focus:border-[#b04000] focus:outline-none focus:ring-1 focus:ring-[#b04000] hover:border-[#9ca3af]"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="auth-password" className="text-xs font-semibold text-[#374151]">
                Password
              </label>
              {!isSignUp && (
                <Link
                  href="/reset-password"
                  className="text-xs font-medium text-[#b04000] transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#868c98]" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={isSignUp ? 8 : undefined}
                placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10.5 w-full rounded-lg border border-[#d1d5db] bg-white pl-10 pr-10 text-sm text-[#08090a] placeholder:text-[#9ca3af] transition-all focus:border-[#b04000] focus:outline-none focus:ring-1 focus:ring-[#b04000] hover:border-[#9ca3af]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#868c98] transition-colors hover:text-[#08090a]"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up mode only) */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-col gap-1.5"
            >
              <label htmlFor="auth-confirm-password" className="text-xs font-semibold text-[#374151]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#868c98]" />
                <input
                  id="auth-confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10.5 w-full rounded-lg border border-[#d1d5db] bg-white pl-10 pr-3.5 text-sm text-[#08090a] placeholder:text-[#9ca3af] transition-all focus:border-[#b04000] focus:outline-none focus:ring-1 focus:ring-[#b04000] hover:border-[#9ca3af]"
                />
              </div>
            </motion.div>
          )}

          {/* Remember me checkbox */}
          <div className="mt-0.5 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-[#525866] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-[#d1d5db] text-[#b04000] accent-[#b04000] focus:ring-0"
              />
              <span>Keep me signed in</span>
            </label>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={pending}
            className="mt-1 flex h-10.5 w-full cursor-pointer items-center justify-center rounded-lg bg-[#b04000] px-4 text-sm font-semibold text-white shadow-2xs transition-all hover:bg-[#8a3300] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>{isSignUp ? "Creating account…" : "Signing in…"}</span>
              </span>
            ) : (
              <span>{isSignUp ? "Create Free Account" : "Sign In"}</span>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-2 flex items-center justify-center">
            <div className="w-full border-t border-[#e5e7eb]" />
            <span className="absolute bg-white px-3 font-mono text-[0.625rem] font-medium tracking-widest text-[#868c98] uppercase">
              OR
            </span>
          </div>

          {/* Clean Google OAuth Button (Full Width, Live Sample removed per instruction) */}
          <button
            type="button"
            disabled={pending}
            onClick={handleGoogle}
            className="inline-flex h-10.5 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#374151] shadow-2xs transition-all hover:bg-[#f9fafb] hover:border-[#9ca3af] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* Footer toggle */}
          <div className="mt-4 text-center text-xs text-[#525866]">
            {isSignUp ? (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-semibold text-[#b04000] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don&rsquo;t have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-semibold text-[#b04000] hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </span>
            )}
          </div>
        </form>

        {/* Legal & Privacy Compliance */}
        <div className="mt-8 border-t border-[#f2f2f2] pt-4 text-center text-[0.6875rem] text-[#868c98]">
          Philippine Civil Code &middot; Labor Code &middot; RA 10173 Compliant
        </div>
      </div>
    </div>
  );
}
