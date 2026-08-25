import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Your contracts — ClauseGuard" };

export default async function Dashboard() {
  const supabase = await createClient();

  // getClaims validates the JWT signature against the project's published keys.
  // getSession reads storage and is not trustworthy on the server.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login?next=/dashboard");

  const email =
    typeof data.claims.email === "string" ? data.claims.email : "your account";

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Clause<span className="text-flag">Guard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-[0.875rem] text-ink-2 sm:block">
              {email}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="lg">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Your contracts
        </h1>

        <div className="mt-10 rounded-sm border border-dashed border-rule-2 bg-surface p-12 text-center">
          <p className="font-display text-xl font-semibold">
            Nothing here yet.
          </p>
          <p className="mx-auto mt-2 max-w-md leading-relaxed text-ink-2">
            Upload a contract and ClauseGuard will mark the clauses that shift
            risk onto you. Upload is not wired up yet.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button disabled size="hero" variant="flag">
              Upload a contract
            </Button>
            <Button asChild size="hero" variant="outline">
              <Link href="/sample">See an example first</Link>
            </Button>
          </div>
        </div>

        <p className="mt-8 text-[0.8125rem] text-ink-3">
          Signed in as {email}. Contracts you upload are private to this
          account.
        </p>
      </main>
    </div>
  );
}
