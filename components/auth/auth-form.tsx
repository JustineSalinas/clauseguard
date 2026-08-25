"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  signIn,
  signUp,
  signInWithGoogle,
  type AuthState,
} from "@/app/auth/actions";

function Submit({ label, pending }: { label: string; pending: string }) {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      size="hero"
      className="w-full"
      disabled={status.pending}
    >
      {status.pending ? pending : label}
    </Button>
  );
}

function GoogleButton({ next }: { next: string }) {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      size="hero"
      className="w-full"
      disabled={status.pending}
      formAction={signInWithGoogle}
      name="next"
      value={next}
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

export function AuthForm({
  mode,
  next = "/dashboard",
}: {
  mode: "signin" | "signup";
  next?: string;
}) {
  const isSignUp = mode === "signup";
  const action = isSignUp ? signUp : signIn;
  const [state, formAction] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      {state?.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      {state?.notice ? (
        <Alert>
          <AlertDescription>{state.notice}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
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
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={isSignUp ? 8 : undefined}
          placeholder={isSignUp ? "At least 8 characters" : ""}
        />
      </div>

      <Submit
        label={isSignUp ? "Create account" : "Sign in"}
        pending={isSignUp ? "Creating account…" : "Signing in…"}
      />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[0.75rem] tracking-wide text-ink-3 uppercase">
          or
        </span>
        <Separator className="flex-1" />
      </div>

      <GoogleButton next={next} />
    </form>
  );
}
