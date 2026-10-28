"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Convex Auth's Password provider reset flow is code-based, not
 * link-based: "reset" emails a short code, "reset-verification" takes that
 * code plus the new password in one call. That's a real UX difference from
 * Supabase's magic-link flow (which is why /auth/confirm and the branded
 * reset-password email template existed) -- not a drop-in swap.
 *
 * KNOWN GAP: no email provider (e.g. Resend) is configured on the Password
 * provider yet (see convex/auth.ts), so `flow: "reset"` below will not
 * actually send an email until that's wired up. The form is correct for
 * when it is; right now it fails honestly (shows an error) rather than
 * pretending to have sent something.
 */
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
        "Couldn't send a reset code right now. Password-reset email isn't fully configured yet -- contact support if this persists.",
      );
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-5">
        <Alert className="border-[#e8c6a8] bg-[#fbeee4] px-4 py-3">
          <AlertDescription className="text-[#8a3300]">
            If that email has an account, a reset code is on its way. Enter it below along with your new password.
          </AlertDescription>
        </Alert>
        <UpdatePasswordForm email={email} />
      </div>
    );
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

      <Button type="submit" size="hero" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset code"}
      </Button>
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
      setError("That code didn't work. It may have expired -- request a new one.");
    } finally {
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

      {!initialEmail ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Reset code</Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          placeholder="Code from your email"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button type="submit" size="hero" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
