export type DocumentStatus =
  | "uploaded"
  | "extracting"
  | "extracted"
  | "segmenting"
  | "segmented"
  | "scoring"
  | "partial"
  | "complete"
  | "failed";

export type RiskLevel = "low" | "medium" | "high";

export type GroundingArm = "none" | "static" | "rag";

export type ScoreOutcome =
  | "ok"
  | "refusal"
  | "parse_error"
  | "safety_block"
  | "timeout"
  | "rate_limited"
  | "empty"
  | "context_limit";

/**
 * What the reader is actually shown for one clause. Derived, never stored.
 *
 * The database always records risk_level and confidence, because Chapter 4
 * correlates them against ground truth. The UI decides separately whether
 * either is trustworthy enough to render as a verdict.
 */
export type ClauseVerdict = "flagged" | "review" | "unreadable";

/** Below this, a score is not shown as a verdict. Derive it from the
 *  confidence-versus-correctness curve on the annotated set; do not guess it. */
export const CONFIDENCE_THRESHOLD = 0.6;

export type BoundingBox = {
  page: number;
  /** Fractions of page width/height, so rendering is resolution independent. */
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Provision = {
  code: "CIVIL" | "LABOR";
  article: string;
  heading?: string | null;
  text: string;
};

export type ScoredClause = {
  id: string;
  ordinal: number;
  label: string | null;
  clauseType: string | null;
  text: string;
  page: number;
  bboxes: BoundingBox[];
  riskLevel: RiskLevel | null;
  confidence: number | null;
  rationale: string | null;
  deviation: string | null;
  outcome: ScoreOutcome;
  injectionSuspected: boolean;
  provisions: Provision[];
  /** Character offsets of the passages worth marking, relative to `text`. */
  marks?: { start: number; end: number }[];
};

export type ReviewedDocument = {
  id: string;
  filename: string;
  contractType: string | null;
  pageCount: number | null;
  status: DocumentStatus;
  createdAt: string;
  clauses: ScoredClause[];
};

/**
 * One clause, one outcome. A refusal, a parse error, and a safety block are all
 * the same thing to the reader: we could not analyse this. A low-confidence
 * score is a different thing: we read it and will not call it.
 */
export function verdictFor(clause: ScoredClause): ClauseVerdict {
  if (clause.outcome !== "ok" || clause.riskLevel === null) return "unreadable";
  if (clause.confidence === null) return "review";
  if (clause.confidence < CONFIDENCE_THRESHOLD) return "review";
  return "flagged";
}

/** Severity ordering is the service. Document order is just a PDF reader. */
const RISK_WEIGHT: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };

export function bySeverity(a: ScoredClause, b: ScoredClause): number {
  const va = verdictFor(a);
  const vb = verdictFor(b);

  // Anything needing a person outranks a confident low-risk clause, because
  // the unknown is what the reader has to act on.
  const groupWeight = (v: ClauseVerdict, c: ScoredClause) => {
    if (v === "flagged") return RISK_WEIGHT[c.riskLevel ?? "low"];
    if (v === "review") return 1.5;
    return 2.5;
  };

  const d = groupWeight(va, a) - groupWeight(vb, b);
  if (d !== 0) return d;
  return a.ordinal - b.ordinal;
}

export function documentSummary(clauses: ScoredClause[]) {
  let high = 0;
  let medium = 0;
  let low = 0;
  let review = 0;
  let unreadable = 0;

  for (const c of clauses) {
    const v = verdictFor(c);
    if (v === "review") review += 1;
    else if (v === "unreadable") unreadable += 1;
    else if (c.riskLevel === "high") high += 1;
    else if (c.riskLevel === "medium") medium += 1;
    else low += 1;
  }

  const scored = clauses.filter((c) => verdictFor(c) === "flagged");
  const meanConfidence =
    scored.length === 0
      ? null
      : scored.reduce((s, c) => s + (c.confidence ?? 0), 0) / scored.length;

  return {
    total: clauses.length,
    high,
    medium,
    low,
    review,
    unreadable,
    meanConfidence,
    /** True when enough of the document could not be judged that an overall
     *  verdict would be misleading. */
    incomplete: review + unreadable > 0,
  };
}
