"use client";

import React, { useState } from "react";
import type { ScoredClause } from "@/lib/types";
import { verdictFor } from "@/lib/types";
import {
  VerdictBadge,
  ConfidenceNote,
  ClauseText,
  outcomeCopy,
} from "@/components/review/verdict";
import { ContractDiffViewer } from "@/components/review/contract-diff-viewer";
import {
  Scale,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquareQuote,
  GitCompare,
} from "lucide-react";

function buildPushbackTemplate(clause: ScoredClause): string {
  const citation =
    clause.provisions && clause.provisions.length > 0
      ? `under Article ${clause.provisions[0].article} of the ${
          clause.provisions[0].code === "CIVIL" ? "Philippine Civil Code" : "Philippine Labor Code"
        }`
      : "under standard Philippine contract principles";

  const label = clause.label || "this clause";
  const fairClause = clause.deviation || "a mutual, balanced stipulation";

  return (
    `Hi Team,\n\n` +
    `Regarding ${label}: we noticed this term imposes significant one-sided liability and risk on our end (${citation}). ` +
    `To ensure our agreement remains fair and compliant, we propose updating the wording to:\n\n` +
    `"${fairClause}"\n\n` +
    `Thank you for understanding and looking forward to moving this project forward!`
  );
}

export function ClauseCard({ clause }: { clause: ScoredClause }) {
  const verdict = verdictFor(clause);
  const [showFullStatute, setShowFullStatute] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [copiedRedline, setCopiedRedline] = useState(false);
  const [copiedPushback, setCopiedPushback] = useState(false);

  const handleCopyRedline = async () => {
    if (!clause.deviation) return;
    await navigator.clipboard.writeText(clause.deviation);
    setCopiedRedline(true);
    setTimeout(() => setCopiedRedline(false), 2000);
  };

  const handleCopyPushback = async () => {
    const text = buildPushbackTemplate(clause);
    await navigator.clipboard.writeText(text);
    setCopiedPushback(true);
    setTimeout(() => setCopiedPushback(false), 2000);
  };

  const isHighOrMedium = clause.riskLevel === "high" || clause.riskLevel === "medium";

  return (
    <article
      id={`clause-${clause.id}`}
      className="rounded-xl border border-rule-2 bg-surface p-6 shadow-xs transition-colors hover:border-[#cccccc]"
    >
      {/* Header: Label, category, page, and verdict badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3.5">
        <div className="flex items-center gap-2.5">
          {clause.label ? (
            <span className="font-display text-sm font-semibold text-ink">
              {clause.label}
            </span>
          ) : null}
          {clause.clauseType ? (
            <span className="rounded bg-raised px-2 py-0.5 font-mono text-[0.6875rem] font-medium tracking-wide text-ink-2 uppercase">
              {clause.clauseType.replace(/\./g, " · ")}
            </span>
          ) : null}
          <span className="font-mono text-xs text-ink-3">p. {clause.page}</span>
        </div>
        <VerdictBadge clause={clause} />
      </div>

      {/* Verbatim contract excerpt in serif */}
      <div className="mt-4 rounded-lg border border-rule bg-[#fafbfc] p-4 font-contract text-[0.9375rem] leading-relaxed text-ink">
        <ClauseText clause={clause} />
      </div>

      {verdict === "unreadable" ? (
        <p className="mt-4 border-t border-rule pt-3 text-sm leading-relaxed text-ink-2">
          {outcomeCopy(clause.outcome)} It hasn&rsquo;t been checked, so don&rsquo;t treat the
          silence as approval.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3.5 border-t border-rule pt-3.5">
          {/* Analysis rationale */}
          {clause.rationale ? (
            <p className="text-sm leading-relaxed text-ink-2">{clause.rationale}</p>
          ) : null}

          <ConfidenceNote clause={clause} />

          {/* Statutory Grounding Section */}
          {clause.provisions && clause.provisions.length > 0 ? (
            <div className="rounded-lg border border-rule bg-[#fafbfc] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="size-4 text-[#b04000]" />
                  <p className="text-xs font-semibold tracking-wide text-[#b04000] uppercase">
                    Philippine Statutory Grounding
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullStatute(!showFullStatute)}
                  className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-ink-2 transition-colors hover:text-ink"
                >
                  <span>{showFullStatute ? "Hide statute text" : "Read official provisions"}</span>
                  {showFullStatute ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                {clause.provisions.map((p) => (
                  <div
                    key={`${p.code}-${p.article}`}
                    className="rounded-lg border border-rule bg-surface p-3.5 shadow-2xs"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-bold text-ink">
                        {p.code === "CIVIL"
                          ? "Civil Code of the Philippines"
                          : "Labor Code of the Philippines"}
                        , Art. {p.article}
                      </p>
                      {p.heading ? (
                        <span className="text-[0.6875rem] font-medium text-ink-3">
                          {p.heading}
                        </span>
                      ) : null}
                    </div>

                    {showFullStatute ? (
                      <p className="mt-2 border-t border-rule pt-2 font-contract text-xs leading-relaxed text-ink-2 italic">
                        &ldquo;{p.text}&rdquo;
                      </p>
                    ) : (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-2">
                        {p.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Actionable Redline & Words to Send Back */}
          {clause.deviation ? (
            <div className="rounded-lg border border-[#e8c6a8] bg-[#fbf6f1] p-4 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-[#b04000] uppercase">
                  Suggested Fair Alternative &middot; Redline
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDiff(!showDiff)}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-ink-2 transition-colors hover:text-ink"
                  >
                    <GitCompare className="size-3.5 text-[#b04000]" />
                    <span>{showDiff ? "Hide word diff" : "Compare word diff"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyRedline}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#b04000] transition-colors hover:text-[#8a3300]"
                  >
                    {copiedRedline ? (
                      <>
                        <Check className="size-3.5 text-[#0c8c5e]" />
                        <span className="font-semibold text-[#0c8c5e]">Copied revision!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy revision</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-2.5 rounded-md border border-[#e8c6a8]/70 bg-surface/90 p-3 font-contract text-xs leading-relaxed font-medium text-ink">
                &ldquo;{clause.deviation}&rdquo;
              </p>

              {/* Interactive Word-level Diff */}
              {showDiff && (
                <div className="mt-3">
                  <ContractDiffViewer originalText={clause.text} revisedText={clause.deviation} />
                </div>
              )}

              {/* Counter-proposal pushback message */}
              {isHighOrMedium ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8c6a8]/60 pt-3">
                  <p className="text-xs text-ink-2">
                    Need wording to send back? Copy a polite, legally grounded counter-proposal.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyPushback}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#b04000] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#8a3300]"
                  >
                    {copiedPushback ? (
                      <>
                        <Check className="size-3.5 text-white" />
                        <span>Copied to clipboard!</span>
                      </>
                    ) : (
                      <>
                        <MessageSquareQuote className="size-3.5" />
                        <span>Copy Pushback Message</span>
                      </>
                    )}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {clause.injectionSuspected ? (
            <p className="rounded-md border border-flag/30 bg-flag-wash px-3 py-2 text-xs leading-relaxed text-flag">
              This document contains text that looks like an instruction aimed at the analyser
              rather than a term of the contract. Treat the result for this clause with suspicion.
            </p>
          ) : null}
        </div>
      )}
    </article>
  );
}
