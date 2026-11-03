import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/dashboard/sidebar";
import { CorpusExplorer } from "@/components/corpus/corpus-explorer";
import { Scale, BookOpen, Database, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Philippine Legal Corpus | ClauseGuard",
  description: "Browse 320 Philippine Civil Code and Labor Code provisions indexed for live RAG contract grounding.",
};

export default async function CorpusPage() {
  if (!(await isAuthenticatedNextjs())) {
    redirect("/login?next=/dashboard/corpus");
  }

  const token = await convexAuthNextjsToken();
  const [user, provisions] = await Promise.all([
    fetchQuery(api.users.me, {}, { token }),
    fetchQuery(api.corpus.listAll, {}, { token }),
  ]);

  const email = user?.email ?? "your account";

  return (
    <div className="min-h-screen bg-[#fafbfc] lg:flex">
      <Sidebar email={email} activeHref="/dashboard/corpus" />

      <div className="flex-1">
        <main className="mx-auto max-w-5xl px-6 py-8 lg:px-10 lg:py-10">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-rule pb-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-2.5 py-0.5 text-[0.6875rem] font-medium text-ink-2">
                  <Database className="size-3 text-[#b04000]" />
                  Statutory Vector Database
                </span>
                <span className="font-mono text-[0.6875rem] text-ink-3">
                  768-dim Embeddings · v2.4
                </span>
              </div>
              <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Philippine Legal Corpus
              </h1>
              <p className="mt-1 text-sm text-ink-2">
                Search and inspect the 320 statutory provisions used to ground risk scoring and negotiate fair contracts.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <CorpusExplorer provisions={provisions as any[]} />
          </div>

          {/* Footer citation note */}
          <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6 text-xs text-ink-3">
            <div className="flex items-center gap-1.5">
              <Scale className="size-3.5 text-[#b04000]" />
              <span>
                Based on official texts of Republic Act No. 386 and Presidential Decree No. 442.
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#0c8c5e]" />
              <span>Live Grounding Arm: Active</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

