import Link from "next/link";
import type { Metadata } from "next";
import { SAMPLE_DOCUMENT } from "@/lib/fixtures/sample-review";
import { ReviewView } from "@/components/review/review-view";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Example review",
  description:
    "A freelance design agreement reviewed by ClauseGuard, readable without an account.",
};

export default function Sample() {
  const doc = SAMPLE_DOCUMENT;

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#f2f2f2] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Logo size="md" href="/" />
          <Button asChild size="default" variant="default">
            <Link href="/signup">Review your own contract</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-[4px] bg-[#eefaf4] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-[#0c8c5e] border border-[#bbf0d6]">
            <span className="size-1.5 rounded-full bg-[#0c8c5e]" />
            Live Marked-Up Review &middot; No Account Required
          </div>
          <h1 className="mt-4 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a] text-balance">
            A freelance design agreement, marked up.
          </h1>
          <p className="mt-3 text-base text-[#525866] leading-relaxed">
            Seven clauses from a real-world contractor agreement. Two shift severe legal and financial risk onto the designer, one we won&rsquo;t call either way due to uncertainty thresholds, and one couldn&rsquo;t be parsed. All three are shown transparently because a clause we skipped is something you still need to know about.
          </p>
        </div>

        <div className="mt-10">
          <ReviewView doc={doc} />
        </div>

        <section className="mt-12 rounded-[16px] border border-[#dddddd] bg-white p-6 sm:p-8 shadow-[0_2px_4px_rgba(8,9,10,0.02)]">
          <h2 className="font-sans text-xl font-semibold tracking-tight text-[#08090a]">
            Objective 2: Why two clauses have no automated verdict
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="bg-[#fffbeb] p-4 rounded-[6px] border border-[#fde68a]">
              <p className="text-xs font-semibold tracking-[0.05em] text-[#d97706] uppercase">
                Routed to Human Review
              </p>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#525866]">
                Clause 9.1 scored 42% confidence and 12.3 scored 55%. Both are
                below the calibrated threshold where we are willing to put a color on
                a screen you might act on. The score exists underneath;
                we route it to human review rather than pretending certainty.
              </p>
            </div>
            <div className="bg-[#f8f9fa] p-4 rounded-[6px] border border-[#dddddd]">
              <p className="text-xs font-semibold tracking-[0.05em] text-[#868c98] uppercase">
                Model Refusal / Unanalyzed
              </p>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#525866]">
                Clause 16.1 returned a safety refusal. Rather than quietly dropping it or
                guessing, it is listed explicitly as unchecked. A tool that hides clauses
                it struggled with is more dangerous than one that admits it.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 rounded-[16px] border border-[#dddddd] bg-[#f8f9fa] p-5">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#868c98] uppercase">
            Statutory Research Reference
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#525866]">
            Hand-curated for demonstration. Statutory citations are grounded in the Civil Code of the Philippines (R.A. 386) and Labor Code (P.D. 442). ClauseGuard is an issue-spotting tool and does not provide formal legal counsel.
          </p>
        </div>
      </main>
    </div>
  );
}
