"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthActions } from "@convex-dev/auth/react";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, ShieldCheck, FileSearch } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      window.history.replaceState(null, "", newMode === "signup" ? `/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}` : `/login${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`);
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
    <div className="flex min-h-full w-full flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-18">
      <div className="mx-auto w-full max-w-[430px]">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="mt-1.5 text-sm text-white/55">
            {isSignUp
              ? "Start reviewing contracts with statutory leverage in seconds."
              : "Ready to continue defending your agreements?"}
          </p>
        </div>

        {/* Tab Switcher - Seamless underline indicator matching user's inspiration image */}
        <div className="relative mb-8 flex border-b border-white/[0.08]">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className={`relative pb-3 text-sm font-semibold transition-colors cursor-pointer mr-8 ${
              !isSignUp ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            <span>Login</span>
            {!isSignUp && (
              <motion.div
                layoutId="authTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#b04000] to-[#f97316]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`relative pb-3 text-sm font-semibold transition-colors cursor-pointer ${
              isSignUp ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            <span>Sign Up</span>
            {isSignUp && (
              <motion.div
                layoutId="authTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#b04000] to-[#f97316]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200 backdrop-blur-md"
          >
            <AlertCircle className="size-4 shrink-0 text-red-400" />
            <AlertDescription className="text-xs leading-relaxed">{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email field with Mail leading icon */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-email" className="text-xs font-medium text-white/75">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                placeholder="hero@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/[0.12] bg-[#12141a]/85 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 transition-all focus:border-[#b04000] focus:outline-none focus:ring-1 focus:ring-[#b04000] hover:border-white/20"
              />
            </div>
          </div>

          {/* Password field with Lock leading icon and Eye trailing toggle */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="auth-password" className="text-xs font-medium text-white/75">
                Password
              </label>
              {!isSignUp && (
                <Link
                  href="/reset-password"
                  className="text-xs text-[#e8c6a8]/80 transition-colors hover:text-[#f97316] hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={isSignUp ? 8 : undefined}
                placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/[0.12] bg-[#12141a]/85 pl-10 pr-10 text-sm text-white placeholder:text-white/30 transition-all focus:border-[#b04000] focus:outline-none focus:ring-1 focus:ring-[#b04000] hover:border-white/20"
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

          {/* Confirm Password field (Sign Up mode only) */}
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-1.5"
            >
              <label htmlFor="auth-confirm-password" className="text-xs font-medium text-white/75">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                <input
                  id="auth-confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/[0.12] bg-[#12141a]/85 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 transition-all focus:border-[#b04000] focus:outline-none focus:ring-1 focus:ring-[#b04000] hover:border-white/20"
                />
              </div>
            </motion.div>
          )}

          {/* Keep me logged in checkbox */}
          <div className="mt-1 flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-xs text-white/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-white/20 bg-white/10 text-[#b04000] accent-[#b04000] focus:ring-0"
              />
              <span>Keep me logged in to ClauseGuard</span>
            </label>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#b04000] via-[#c84805] to-[#dc580f] px-4 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(176,64,0,0.35)] transition-all hover:brightness-110 hover:shadow-[0_6px_28px_rgba(176,64,0,0.45)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>{isSignUp ? "Creating account…" : "Signing in…"}</span>
              </span>
            ) : (
              <span>{isSignUp ? "Create Account" : "Sign In to Workspace"}</span>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-2 flex items-center justify-center">
            <div className="w-full border-t border-white/[0.08]" />
            <span className="absolute bg-[#090b0e] px-3 font-mono text-[0.625rem] font-medium tracking-widest text-white/35 uppercase">
              OR CONTINUE WITH
            </span>
          </div>

          {/* Social / Alternative Access Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google OAuth Button */}
            <button
              type="button"
              disabled={pending}
              onClick={handleGoogle}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 text-xs font-medium text-white transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 18 18" className="size-4 shrink-0" aria-hidden="true">
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
              <span>Google</span>
            </button>

            {/* Live Interactive Sample Demo Button */}
            <Link
              href="/dashboard/sample"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 text-xs font-medium text-white transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.99]"
            >
              <FileSearch className="size-3.5 text-[#f97316]" />
              <span>Live Sample</span>
            </Link>
          </div>

          {/* Footer Tab Switch Link matching user inspo: "Don't have an account yet? Create Account" */}
          <div className="mt-4 text-center text-xs text-white/50">
            {isSignUp ? (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-medium text-white transition-colors hover:text-[#f97316] hover:underline underline-offset-4 cursor-pointer"
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
                  className="font-medium text-white transition-colors hover:text-[#f97316] hover:underline underline-offset-4 cursor-pointer"
                >
                  Create Account
                </button>
              </span>
            )}
          </div>
        </form>

        {/* Legal & Privacy Compliance */}
        <div className="mt-10 border-t border-white/[0.06] pt-4 text-center text-[0.6875rem] text-white/35">
          Philippine Civil Code &middot; Labor Code &middot; RA 10173 Compliant
        </div>
      </div>
    </div>
  );
}

