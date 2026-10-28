"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

function GoogleButton({ pending, onClick }: { pending: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="hero"
      className="w-full"
      disabled={pending}
      onClick={onClick}
    >
      <svg viewBox="0 0 18 18" className="size-4" aria-hidden="true">
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
      Continue with Google
    </Button>
  );
}

/**
 * Supabase Auth let this form submit via a server action (useActionState +
 * formAction) -- the whole formNoValidate fix lived there. Convex Auth's
 * client owns its own session/token storage, so sign-in has to happen
 * client-side through useAuthActions() instead; there's no formAction to
 * attach a second provider to, so the Google button is a plain onClick
 * rather than a second submit button sharing the form's required fields --
 * which incidentally means the earlier formNoValidate bug class can't
 * recur here, there's no shared native form validation to collide with.
 */
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
      // Convex Auth throws on bad credentials / duplicate account without a
      // stable machine-readable code yet, same ambiguity Supabase's error
      // had -- stay vague for the same reason the old comment gave: don't
      // let the form be used to discover which addresses are registered.
      setError(
        isSignUp
          ? "That account could not be created. The email may already be in use."
          : "That email and password combination didn't work.",
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
    } catch {
      setError("Google sign-in didn't complete. Try again, or use your email and password.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <Label htmlFor="password">Password</Label>
          {!isSignUp ? (
            <Link
              href="/reset-password"
              className="text-[0.8125rem] text-ink-2 underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          ) : null}
        </div>
        <Input
          id="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={isSignUp ? 8 : undefined}
          placeholder={isSignUp ? "At least 8 characters" : ""}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button type="submit" size="hero" className="w-full" disabled={pending}>
        {pending
          ? isSignUp
            ? "Creating account…"
            : "Signing in…"
          : isSignUp
            ? "Create account"
            : "Sign in"}
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[0.75rem] tracking-wide text-ink-3 uppercase">or</span>
        <Separator className="flex-1" />
      </div>

      <GoogleButton pending={pending} onClick={handleGoogle} />
    </form>
  );
}
