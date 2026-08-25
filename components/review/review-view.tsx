import type { ReviewedDocument, ScoredClause } from "@/lib/types";
import { bySeverity, documentSummary, verdictFor } from "@/lib/types";
import { ClauseCard } from "@/components/review/clause-card";
import { ClauseText, VerdictBadge } from "@/components/review/verdict";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function SummaryStat({
  n,
  label,
  tone,
}: {
  n: number;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <span className={`font-body text-2xl font-semibold tabular-nums ${tone}`}>
        {n}
      </span>
      <span className="text-[0.75rem] leading-tight text-ink-2">{label}</span>
    </div>
  );
}

function Summary({ clauses }: { clauses: ScoredClause[] }) {
  const s = documentSummary(clauses);

  return (
    <div className="rounded-sm border border-rule bg-surface">
      <div className="grid grid-cols-2 divide-x divide-y divide-rule sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
        <SummaryStat n={s.high} label="High risk" tone="text-flag" />
        <SummaryStat n={s.medium} label="Worth checking" tone="text-caution" />
        <SummaryStat n={s.low} label="Look standard" tone="text-clear" />
        <SummaryStat n={s.review} label="Need a person" tone="text-caution" />
        <SummaryStat
          n={s.unreadable}
          label="Couldn't analyse"
          tone="text-ink-3"
        />
      </div>

      {s.incomplete ? (
        <p className="border-t border-rule bg-raised px-4 py-3 text-[0.875rem] leading-relaxed text-ink-2">
          <span className="font-semibold text-ink">
            This isn&rsquo;t a complete picture.
          </span>{" "}
          {s.review + s.unreadable} of {s.total} clauses weren&rsquo;t called,
          either because confidence was too low or because they couldn&rsquo;t
          be read. Silence on those is not approval.
        </p>
      ) : null}
    </div>
  );
}

/** The whole contract in reading order, marked in place. This is the
 *  list-view fallback the plan requires when page geometry is unavailable or
 *  wrong, and it is what renders until page images exist. */
function DocumentView({ clauses }: { clauses: ScoredClause[] }) {
  const inOrder = [...clauses].sort((a, b) => a.ordinal - b.ordinal);

  return (
    <div className="rounded-sm border border-rule bg-surface p-7 sm:p-10">
      <div className="font-contract mx-auto max-w-[68ch] space-y-5 text-[1.0625rem] leading-[1.85]">
        {inOrder.map((c) => {
          const dimmed = verdictFor(c) === "flagged" && c.riskLevel === "low";
          return (
            <p key={c.id} className={dimmed ? "text-ink-2" : "text-ink"}>
              {c.label ? (
                <a
                  href={`#clause-${c.id}`}
                  className="font-bold no-underline hover:text-flag"
                >
                  {c.label}
                </a>
              ) : null}
              {c.label ? "  " : null}
              <ClauseText clause={c} />
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewView({ doc }: { doc: ReviewedDocument }) {
  const ranked = [...doc.clauses].sort(bySeverity);

  return (
    <div className="flex flex-col gap-8">
      <Summary clauses={doc.clauses} />

      <Tabs defaultValue="clauses" className="gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="clauses">By severity</TabsTrigger>
            <TabsTrigger value="document">Whole document</TabsTrigger>
          </TabsList>
          <p className="text-[0.8125rem] text-ink-3">
            {doc.clauses.length} clauses &middot; {doc.pageCount ?? "?"} pages
          </p>
        </div>

        <TabsContent value="clauses" className="flex flex-col gap-3">
          {ranked.map((c) => (
            <ClauseCard key={c.id} clause={c} />
          ))}
        </TabsContent>

        <TabsContent value="document">
          <DocumentView clauses={doc.clauses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { Summary as ReviewSummary, VerdictBadge };
