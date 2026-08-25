import type { ScoredClause } from "@/lib/types";
import { verdictFor } from "@/lib/types";
import {
  VerdictBadge,
  ConfidenceNote,
  ClauseText,
  outcomeCopy,
} from "@/components/review/verdict";

/**
 * Border style carries the verdict as much as colour does: solid for a call we
 * stand behind, dashed for one we will not make, dotted for a clause we could
 * not read.
 */
function frameFor(clause: ScoredClause) {
  const verdict = verdictFor(clause);
  if (verdict === "unreadable")
    return "border-l-2 border-l-rule-2 border-dashed";
  if (verdict === "review")
    return "border-l-2 border-l-caution border-dashed";
  const risk = clause.riskLevel ?? "low";
  if (risk === "high") return "border-l-2 border-l-flag";
  if (risk === "medium") return "border-l-2 border-l-caution";
  return "border-l-2 border-l-clear";
}

export function ClauseCard({ clause }: { clause: ScoredClause }) {
  const verdict = verdictFor(clause);

  return (
    <article
      id={`clause-${clause.id}`}
      className={`rounded-sm border border-rule bg-surface p-5 ${frameFor(clause)}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          {clause.label ? (
            <span className="font-contract text-[0.9375rem] font-bold">
              {clause.label}
            </span>
          ) : null}
          {clause.clauseType ? (
            <span className="font-body text-[0.6875rem] tracking-[0.08em] text-ink-3 uppercase">
              {clause.clauseType.replace(/\./g, " · ")}
            </span>
          ) : null}
          <span className="text-[0.75rem] text-ink-3">p.{clause.page}</span>
        </div>
        <VerdictBadge clause={clause} />
      </div>

      <p className="font-contract mt-3 text-[0.9375rem] leading-[1.75]">
        <ClauseText clause={clause} />
      </p>

      {verdict === "unreadable" ? (
        <p className="mt-4 border-t border-rule pt-3 text-[0.875rem] leading-relaxed text-ink-2">
          {outcomeCopy(clause.outcome)} It hasn&rsquo;t been checked, so
          don&rsquo;t treat the silence as approval.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3 border-t border-rule pt-3">
          {clause.rationale ? (
            <p className="text-[0.9375rem] leading-relaxed">
              {clause.rationale}
            </p>
          ) : null}

          <ConfidenceNote clause={clause} />

          {clause.provisions.length > 0 ? (
            <div>
              <p className="font-body text-[0.6875rem] tracking-[0.12em] text-ink-3 uppercase">
                Checked against
              </p>
              {clause.provisions.map((p) => (
                <div key={`${p.code}-${p.article}`} className="mt-1.5">
                  <p className="font-display text-[0.9375rem] italic">
                    {p.code === "CIVIL" ? "Civil Code" : "Labor Code"}, Art.{" "}
                    {p.article}
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-2">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {clause.deviation ? (
            <div>
              <p className="font-body text-[0.6875rem] tracking-[0.12em] text-ink-3 uppercase">
                A fair version
              </p>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-2">
                {clause.deviation}
              </p>
            </div>
          ) : null}

          {clause.injectionSuspected ? (
            <p className="rounded-sm border border-flag/30 bg-flag-wash px-3 py-2 text-[0.8125rem] leading-relaxed text-flag">
              This document contains text that looks like an instruction aimed
              at the analyser rather than a term of the contract. Treat the
              result for this clause with suspicion.
            </p>
          ) : null}
        </div>
      )}
    </article>
  );
}
