import type { ScoredClause, RiskLevel } from "@/lib/types";
import { verdictFor } from "@/lib/types";

/** Human wording for every non-ok outcome. The reader learns what was missed. */
const OUTCOME_COPY: Record<string, string> = {
  refusal: "The model declined to judge this clause.",
  parse_error: "The model's answer came back malformed.",
  safety_block: "The model's safety filter blocked this clause.",
  timeout: "This clause timed out before it could be scored.",
  rate_limited: "We ran out of quota before reaching this clause.",
  empty: "The model returned nothing for this clause.",
  context_limit: "This clause was too long to score in one piece.",
};

export function outcomeCopy(outcome: string) {
  return OUTCOME_COPY[outcome] ?? "This clause could not be analysed.";
}

const RISK_LABEL: Record<RiskLevel, string> = {
  high: "High risk",
  medium: "Worth checking",
  low: "Looks standard",
};

export function VerdictBadge({ clause }: { clause: ScoredClause }) {
  const verdict = verdictFor(clause);
  const base =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-body text-[0.6875rem] font-semibold tracking-[0.06em] uppercase border";

  if (verdict === "unreadable") {
    return (
      <span className={`${base} border-dashed border-rule-2 bg-raised text-ink-3`}>
        Couldn&rsquo;t analyse
      </span>
    );
  }

  if (verdict === "review") {
    return (
      <span className={`${base} border-amber-300 bg-amber-50 text-amber-800`}>
        Needs human review
      </span>
    );
  }

  const risk = clause.riskLevel ?? "low";
  const tone =
    risk === "high"
      ? "bg-red-50 text-red-700 border-red-200"
      : risk === "medium"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-emerald-50 text-emerald-800 border-emerald-200";

  return <span className={`${base} ${tone}`}>{RISK_LABEL[risk]}</span>;
}

/** Confidence is shown only where it can be acted on, and never as a bare
 *  percentage next to a verdict the reader might over-trust. */
export function ConfidenceNote({ clause }: { clause: ScoredClause }) {
  const verdict = verdictFor(clause);
  if (verdict === "unreadable") return null;
  if (clause.confidence === null) return null;

  const pct = Math.round(clause.confidence * 100);

  if (verdict === "review") {
    return (
      <p className="text-[0.8125rem] leading-relaxed text-caution">
        We&rsquo;re only {pct}% sure about this one. Take it to someone before
        you act on it.
      </p>
    );
  }

  return (
    <p className="text-xs font-mono text-ink-3">Confidence {pct}%</p>
  );
}

function markClass(clause: ScoredClause) {
  const verdict = verdictFor(clause);
  if (verdict === "unreadable") return "mk mk-unreadable";
  if (verdict === "review") return "mk mk-review";
  return `mk mk-${clause.riskLevel ?? "low"}`;
}

/** Renders clause text with the flagged passages marked in place. */
export function ClauseText({
  clause,
  className = "",
}: {
  clause: ScoredClause;
  className?: string;
}) {
  const marks = [...(clause.marks ?? [])].sort((a, b) => a.start - b.start);

  if (marks.length === 0) {
    return <span className={className}>{clause.text}</span>;
  }

  const cls = markClass(clause);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  marks.forEach((m, i) => {
    const start = Math.max(cursor, m.start);
    const end = Math.min(clause.text.length, m.end);
    if (start > cursor) {
      parts.push(
        <span key={`t${i}`}>{clause.text.slice(cursor, start)}</span>,
      );
    }
    if (end > start) {
      parts.push(
        <mark key={`m${i}`} className={cls}>
          {clause.text.slice(start, end)}
        </mark>,
      );
    }
    cursor = Math.max(cursor, end);
  });

  if (cursor < clause.text.length) {
    parts.push(<span key="tail">{clause.text.slice(cursor)}</span>);
  }

  return <span className={className}>{parts}</span>;
}
