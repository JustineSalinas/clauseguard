import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Link didn't work — ClauseGuard" };

export default function AuthCodeError() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-24">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        That link didn&rsquo;t work.
      </h1>
      <p className="mt-4 leading-relaxed text-ink-2">
        Confirmation links expire after a while, and each one can only be used
        once. Ask for a new one by signing in again.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/login">Back to sign in</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Homepage</Link>
        </Button>
      </div>
    </main>
  );
}
