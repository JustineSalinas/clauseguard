import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { SAMPLE_DOCUMENT } from "@/lib/fixtures/sample-review";
import { ReviewView } from "@/components/review/review-view";
import { ContractHealthCard } from "@/components/review/contract-health-card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Example review | ClauseGuard",
  description:
    "A freelance design agreement reviewed by ClauseGuard, readable without an account.",
};

export default async function Sample() {
  if (await isAuthenticatedNextjs()) {
    redirect("/dashboard/sample");
  }

  const doc = SAMPLE_DOCUMENT;

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <header className="border-b border-rule bg-surface sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Logo size="md" href="/" />
          <Button asChild size="default" variant="brand">
            <Link href="/signup">Review your own contract</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fbeee4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-[#b04000] border border-[#e8c6a8]">
            <span className="size-1.5 rounded-full bg-[#b04000]" />
            Live Sample Review &middot; No Account Required
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink text-balance">
            A freelance design agreement, marked up.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink-2 leading-relaxed">
            Seven clauses from a real-world contractor agreement. Two shift severe legal and financial risk onto the designer, one we won&rsquo;t call either way due to uncertainty thresholds, and one couldn&rsquo;t be parsed. All three are shown transparently because a clause we skipped is something you still need to know about.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <ContractHealthCard clauses={doc.clauses} />
          <ReviewView doc={doc} />
        </div>

        <section className="mt-12 rounded-xl border border-rule-2 bg-surface p-6 sm:p-8 shadow-xs">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
            Objective 2: Why two clauses have no automated verdict
          </h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div className="bg-[#fffbeb] p-4.5 rounded-lg border border-amber-200">
              <p className="text-xs font-semibold tracking-wider text-amber-800 uppercase">
                Routed to Human Review
              </p>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-amber-900">
                Clause 9.1 scored 42% confidence and 12.3 scored 55%. Both are
                below the calibrated threshold where we are willing to put a color on
                a screen you might act on. The score exists underneath;
                we route it to human review rather than pretending certainty.
              </p>
            </div>
            <div className="bg-[#fafbfc] p-4.5 rounded-lg border border-rule-2">
              <p className="text-xs font-semibold tracking-wider text-ink-3 uppercase">
                Couldn&rsquo;t Be Analysed
              </p>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-ink-2">
                Clause 16 was flagged for an OCR parse failure on a malformed signature line. Rather
                than silently dropping the text or guessing a verdict, it is retained on the document
                with an honest explanation so you know it was not checked.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
