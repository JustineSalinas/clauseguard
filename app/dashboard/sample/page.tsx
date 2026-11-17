import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { getSample } from "@/lib/fixtures/sample-contracts";
import { SamplePicker } from "@/components/review/sample-picker";
import { SampleMethodology } from "@/components/review/sample-methodology";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ReviewView } from "@/components/review/review-view";
import { ContractHealthCard } from "@/components/review/contract-health-card";
import { ArrowLeft, FileSearch, ShieldCheck, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Sample Contract Review | ClauseGuard",
  description: "A reference freelance contract review grounded in Philippine statutory law.",
};

export default async function DashboardSamplePage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  if (!(await isAuthenticatedNextjs())) {
    redirect("/login?next=/dashboard/sample");
  }

  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.users.me, {}, { token });
  const email = user?.email ?? "your account";
  const sample = getSample(c);
  const doc = sample.doc;

  return (
    <div className="min-h-screen bg-[#fafbfc] lg:flex">
      <Sidebar email={email} activeHref="/dashboard/sample" />

      <div className="flex-1">
        <main className="mx-auto max-w-5xl px-6 py-8 lg:px-10 lg:py-10">
          {/* Header */}
          <div className="border-b border-rule pb-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-2.5 py-0.5 text-[0.6875rem] font-medium text-ink-2">
                <FileSearch className="size-3 text-[#b04000]" />
                Reference Agreement · {sample.category}
              </span>
              <span className="font-mono text-[0.6875rem] text-ink-3">
                {doc.clauses.length} Clauses · Full Statutory Annotation
              </span>
            </div>

            <div className="mt-2.5 flex flex-col justify-between gap-3 sm:flex-row sm:items-baseline">
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {sample.title}
              </h1>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#b04000] hover:underline"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to your contracts</span>
              </Link>
            </div>

            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-2">{sample.summary}</p>
            <div className="mt-4">
              <SamplePicker basePath="/dashboard/sample" activeSlug={sample.slug} />
            </div>
          </div>

          {/* Interactive Review with Health Card */}
          <div className="mt-8 flex flex-col gap-8">
            <ContractHealthCard clauses={doc.clauses} />
            <ReviewView doc={doc} />
          </div>

          <div className="mt-12">
            <SampleMethodology doc={doc} />
          </div>

          {/* Footer note */}
          <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6 text-xs text-ink-3">
            <div className="flex items-center gap-1.5">
              <Scale className="size-3.5 text-[#b04000]" />
              <span>Grounded in Philippine Civil Code and Labor Code statutory articles.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#0c8c5e]" />
              <span>Reference sample demonstration</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

