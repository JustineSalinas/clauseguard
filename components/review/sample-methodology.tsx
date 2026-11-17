import { CONFIDENCE_THRESHOLD, verdictFor, type ReviewedDocument } from "@/lib/types";

const pct = (n: number | null) => (n === null ? "" : `${Math.round(n * 100)}%`);

function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Explains the sample's two "no verdict" outcomes from the document itself. */
export function SampleMethodology({ doc }: { doc: ReviewedDocument }) {
  const review = doc.clauses.filter((c) => verdictFor(c) === "review");
  const unreadable = doc.clauses.filter((c) => verdictFor(c) === "unreadable");
  if (review.length === 0 && unreadable.length === 0) return null;

  return (
    <section className="rounded-xl border border-rule-2 bg-surface p-5 shadow-xs sm:p-8">
      <h2 className="font-display text-base font-semibold tracking-tight text-ink">
        Why some clauses have no automated verdict
      </h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {review.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-[#fffbeb] p-4">
            <p className="text-xs font-semibold tracking-wider text-amber-800 uppercase">
              Routed to human review
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-amber-900 sm:text-sm">
              {joinList(review.map((c) => `Clause ${c.label} scored ${pct(c.confidence)}`))}, below
              the {pct(CONFIDENCE_THRESHOLD)} confidence we need before putting a verdict on screen.
              The score is still recorded, but we route these to a person rather than pretend to be
              sure.
            </p>
          </div>
        )}
        {unreadable.length > 0 && (
          <div className="rounded-lg border border-rule-2 bg-[#fafbfc] p-4">
            <p className="text-xs font-semibold tracking-wider text-ink-3 uppercase">
              Couldn&rsquo;t be analysed
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-2 sm:text-sm">
              {joinList(unreadable.map((c) => `Clause ${c.label}`))} could not be read or scored.
              Rather than dropping the text or guessing, we keep it on the document and say it was
              not checked.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
