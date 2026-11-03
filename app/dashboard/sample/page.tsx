import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { SAMPLE_DOCUMENT } from "@/lib/fixtures/sample-review";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ReviewView } from "@/components/review/review-view";
import { ContractHealthCard } from "@/components/review/contract-health-card";
import { ArrowLeft, FileSearch, ShieldCheck, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Sample Contract Review | ClauseGuard",
  description: "A reference freelance contract review grounded in Philippine statutory law.",
};

export default async function DashboardSamplePage() {
  if (!(await isAuthenticatedNextjs())) {
    redirect("/login?next=/dashboard/sample");
  }

  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.users.me, {}, { token });
  const email = user?.email ?? "your account";
  const doc = SAMPLE_DOCUMENT;

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
                Reference Agreement
              </span>
              <span className="font-mono text-[0.6875rem] text-ink-3">
                7 Clauses · Full Statutory Annotation
              </span>
            </div>

            <div className="mt-2.5 flex flex-col justify-between gap-3 sm:flex-row sm:items-baseline">
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Freelance Design Agreement
              </h1>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#b04000] hover:underline"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to your contracts</span>
              </Link>
            </div>

            <p className="mt-1 text-sm text-ink-2 max-w-3xl leading-relaxed">
              Seven clauses from a real-world contractor agreement. Two shift severe legal and financial risk onto the designer (Arts. 1308 and 1306), one is routed to human review due to calibrated confidence thresholds, and one demonstrates unreadable OCR handling.
            </p>
          </div>

          {/* Interactive Review with Health Card */}
          <div className="mt-8 flex flex-col gap-8">
            <ContractHealthCard clauses={doc.clauses} />
            <ReviewView doc={doc} />
          </div>

          {/* Transparent Edge Case Explanation */}
          <section className="mt-12 rounded-xl border border-rule bg-surface p-6 sm:p-8 shadow-xs">
            <h2 className="font-display text-base font-semibold tracking-tight text-ink">
              Methodology: Why two clauses have no automated verdict
            </h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="rounded-lg border border-amber-200 bg-[#fffbeb] p-4.5">
                <p className="text-xs font-semibold tracking-wider text-amber-800 uppercase">
                  Routed to Human Review
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-amber-900">
                  Clause 9.1 scored 42% confidence and 12.3 scored 55%. Both are below the calibrated
                  threshold where we are willing to put a verdict on screen. We route them to human
                  review rather than pretending certainty.
                </p>
              </div>
              <div className="rounded-lg border border-rule-2 bg-[#fafbfc] p-4.5">
                <p className="text-xs font-semibold tracking-wider text-ink-3 uppercase">
                  Couldn&rsquo;t Be Analysed
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-2">
                  Clause 16 was flagged for an OCR parse failure on a malformed signature block. Rather
                  than silently dropping the text or guessing a verdict, it is retained on the document
                  with an honest explanation so you know it was not checked.
                </p>
              </div>
            </div>
          </section>

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

