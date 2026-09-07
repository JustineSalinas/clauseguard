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
    return "border-l-4 border-l-[#868c98]";
  if (verdict === "review")
    return "border-l-4 border-l-[#d97706]";
  const risk = clause.riskLevel ?? "low";
  if (risk === "high") return "border-l-4 border-l-[#dc2626]";
  if (risk === "medium") return "border-l-4 border-l-[#d97706]";
  return "border-l-4 border-l-[#0c8c5e]";
}

export function ClauseCard({ clause }: { clause: ScoredClause }) {
  const verdict = verdictFor(clause);

  return (
    <article
      id={`clause-${clause.id}`}
      className={`rounded-[16px] border border-[#dddddd] bg-white p-6 shadow-[0_2px_4px_rgba(8,9,10,0.02)] ${frameFor(clause)}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          {clause.label ? (
            <span className="font-sans text-[15px] font-semibold text-[#08090a]">
              {clause.label}
            </span>
          ) : null}
          {clause.clauseType ? (
            <span className="font-sans text-[11px] font-semibold tracking-[0.05em] text-[#868c98] uppercase">
              {clause.clauseType.replace(/\./g, " · ")}
            </span>
          ) : null}
          <span className="text-xs text-[#868c98] font-mono">p.{clause.page}</span>
        </div>
        <VerdictBadge clause={clause} />
      </div>

      <p className="font-contract mt-4 text-[15px] leading-[1.8] text-[#08090a] bg-[#fafbfc] p-4 rounded-[6px] border border-[#f2f2f2]">
        <ClauseText clause={clause} />
      </p>

      {verdict === "unreadable" ? (
        <p className="mt-4 border-t border-[#f2f2f2] pt-3 text-sm leading-relaxed text-[#525866]">
          {outcomeCopy(clause.outcome)} It hasn&rsquo;t been checked, so
          don&rsquo;t treat the silence as approval.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3.5 border-t border-[#f2f2f2] pt-3.5">
          {clause.rationale ? (
            <p className="text-sm leading-relaxed text-[#08090a]">
              {clause.rationale}
            </p>
          ) : null}

          <ConfidenceNote clause={clause} />

          {clause.provisions.length > 0 ? (
            <div className="bg-[#f8f9fa] p-3.5 rounded-[4px] border border-[#dddddd]">
              <p className="text-[11px] font-semibold tracking-[0.05em] text-[#b04000] uppercase">
                Checked against Philippine Statutes
              </p>
              {clause.provisions.map((p) => (
                <div key={`${p.code}-${p.article}`} className="mt-2">
                  <p className="font-sans text-xs font-semibold text-[#08090a]">
                    {p.code === "CIVIL" ? "Civil Code of the Philippines" : "Labor Code of the Philippines"}, Art.{" "}
                    {p.article}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#525866]">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {clause.deviation ? (
            <div className="bg-[#fbeee4] p-3.5 rounded-[4px] border border-[#e8c6a8]">
              <p className="text-[11px] font-semibold tracking-[0.05em] text-[#b04000] uppercase">
                Actionable Redline / Fair Version
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#08090a]">
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
