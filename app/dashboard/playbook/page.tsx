import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PlaybookExplorer } from "@/components/playbook/playbook-explorer";
import { BookMarked, ShieldCheck, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Pushback Playbook | ClauseGuard",
  description: "Tactical counter-proposal negotiation templates for Philippine freelance contracts.",
};

export default async function PlaybookPage() {
  if (!(await isAuthenticatedNextjs())) {
    redirect("/login?next=/dashboard/playbook");
  }

  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.users.me, {}, { token });
  const email = user?.email ?? "your account";

  return (
    <div className="min-h-screen bg-[#fafbfc] lg:flex">
      <Sidebar email={email} activeHref="/dashboard/playbook" />

      <div className="flex-1">
        <main className="mx-auto max-w-5xl px-6 py-8 lg:px-10 lg:py-10">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-rule pb-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-2.5 py-0.5 text-[0.6875rem] font-medium text-ink-2">
                  <BookMarked className="size-3 text-[#b04000]" />
                  Freelancer Negotiation Toolkit
                </span>
                <span className="font-mono text-[0.6875rem] text-ink-3">
                  Top 5 Predatory Covenants
                </span>
              </div>
              <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Pushback Playbook
              </h1>
              <p className="mt-1 text-sm text-ink-2">
                Battle-tested counter-proposals and pre-drafted client emails grounded in Philippine statutory law.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <PlaybookExplorer />
          </div>

          {/* Footer note */}
          <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6 text-xs text-ink-3">
            <div className="flex items-center gap-1.5">
              <Scale className="size-3.5 text-[#b04000]" />
              <span>Grounded in Philippine Civil Code, Labor Code, and Supreme Court jurisprudence.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#0c8c5e]" />
              <span>Contract Negotiation Strategy</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

