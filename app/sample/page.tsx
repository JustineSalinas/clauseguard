import Link from "next/link";
import type { Metadata } from "next";
import { SAMPLE_DOCUMENT } from "@/lib/fixtures/sample-review";
import { ReviewView } from "@/components/review/review-view";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Example review",
  description:
    "A freelance design agreement reviewed by ClauseGuard, readable without an account.",
};

export default function Sample() {
  const doc = SAMPLE_DOCUMENT;

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Clause<span className="text-brand">Guard</span>
          </Link>
          <Button asChild size="lg">
            <Link href="/signup">Review your own contract</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <p className="font-body text-[0.6875rem] tracking-[0.14em] text-ink-3 uppercase">
          Example review &middot; no account needed
        </p>
        <h1 className="font-display mt-3 text-4xl leading-tight font-semibold tracking-tight text-balance">
          A freelance design agreement, marked up.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
          Seven clauses from a real-shaped contract. Two shift serious risk onto
          the designer, one we won&rsquo;t call either way, and one we
          couldn&rsquo;t read at all. All three of those are shown, because a
          clause we skipped is something you still need to know about.
        </p>

        <div className="mt-10">
          <ReviewView doc={doc} />
        </div>

        <section className="mt-14 rounded-sm border border-rule bg-surface p-7">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Why two clauses have no verdict
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <p className="font-body text-[0.6875rem] font-semibold tracking-[0.1em] text-caution uppercase">
                Needs a person
              </p>
              <p className="mt-2 leading-relaxed text-ink-2">
                Clause 9.1 scored 42% confidence and 12.3 scored 55%. Both are
                below the threshold where we&rsquo;re willing to put a colour on
                a screen you might act on. The score still exists underneath;
                we just don&rsquo;t present it as an answer.
              </p>
            </div>
            <div>
              <p className="font-body text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-3 uppercase">
                Couldn&rsquo;t analyse
              </p>
              <p className="mt-2 leading-relaxed text-ink-2">
                Clause 16.1 came back as a refusal. Rather than hiding it or
                guessing, it&rsquo;s listed as unchecked. A tool that quietly
                drops the clauses it struggled with is worse than one that
                admits to them.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 rounded-sm border border-rule bg-raised p-5">
          <p className="font-body text-[0.6875rem] tracking-[0.12em] text-ink-3 uppercase">
            About this example
          </p>
          <p className="mt-2 max-w-3xl text-[0.875rem] leading-relaxed text-ink-2">
            Hand-written for demonstration, not generated. The statutory
            citations shown here are illustrative and pending verification
            against the official text of the Civil Code. ClauseGuard is a
            first-pass review tool and does not give legal advice.
          </p>
        </div>
      </main>
    </div>
  );
}
