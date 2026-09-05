/**
 * Clause segmentation. Pure function: given extracted page text, produce
 * clause records. No Supabase import here on purpose -- this can be written,
 * run, and unit tested today, entirely independent of a live database. The
 * orchestration layer that persists these to the `clauses` table (owned by
 * whoever wires the pipeline to Supabase) is a thin wrapper around this.
 *
 * Real contracts are almost always numbered ("14.2", "9.1", "5.2"), so that
 * is the primary strategy. A contract with no numbering at all falls back to
 * paragraph splitting, which is worse -- clause labels will be missing --
 * but still produces something scoreable rather than one giant clause.
 */

import { CLAUSE_TAXONOMY, type ClauseTypeId } from "@/lib/pipeline/taxonomy";

export type SegmentedClause = {
  ordinal: number;
  label: string | null;
  text: string;
  /** A cheap keyword guess, confirmed or corrected by the scoring prompt.
   *  Never treated as ground truth -- it exists to give the model a
   *  starting point, not to skip judgment. */
  suggestedType: ClauseTypeId | null;
};

// Matches a clause number at the start of a line: "14.2", "9.1", "5", "12.3.1".
// Requires at least one space/tab after the number so it doesn't match a
// page number or a currency figure like "5.2" mid-sentence.
const CLAUSE_NUMBER = /^(\d{1,3}(?:\.\d{1,3}){0,3})[.)]?[ \t]+/;

/** Keyword -> clause type. Order matters: more specific patterns first, so
 *  "may terminate ... for any reason" matches unilateral before a generic
 *  termination fallback would. This is intentionally simple; it is a hint
 *  for the model, not the classifier of record. */
const TYPE_HINTS: Array<{ pattern: RegExp; type: ClauseTypeId }> = [
  { pattern: /for any reason or no reason|sole discretion.*terminat|terminat.*sole discretion/i, type: "termination.unilateral" },
  { pattern: /either party may terminate/i, type: "termination.mutual" },
  { pattern: /terminat/i, type: "termination.unilateral" },
  { pattern: /indemnify and hold harmless|indemnification/i, type: "indemnity.uncapped" },
  { pattern: /limitation of liability|shall not be liable/i, type: "liability.limitation" },
  { pattern: /work product|derivative.*deliverable|shall vest in the client/i, type: "ip.assignment.broad" },
  { pattern: /payment shall be made|invoice|thirty \(30\) days/i, type: "payment.terms" },
  { pattern: /late (amounts|payment)|interest at/i, type: "payment.penalty" },
  { pattern: /shall not.*compet|line of business/i, type: "non.compete" },
  { pattern: /solicit/i, type: "non.solicitation" },
  { pattern: /confidential/i, type: "confidentiality" },
  { pattern: /force majeure|fortuitous event/i, type: "force.majeure" },
  { pattern: /arbitrat/i, type: "dispute.arbitration" },
  { pattern: /governing law|venue|jurisdiction/i, type: "dispute.venue" },
  { pattern: /warrant/i, type: "warranty" },
  { pattern: /assign this agreement/i, type: "assignment.rights" },
  { pattern: /amend(ed|ment)/i, type: "amendment" },
  { pattern: /severa/i, type: "severability" },
  { pattern: /entire agreement/i, type: "entire.agreement" },
  { pattern: /commences on|effective date|continues until/i, type: "term.duration" },
];

export function suggestClauseType(text: string): ClauseTypeId | null {
  for (const { pattern, type } of TYPE_HINTS) {
    if (pattern.test(text)) return type;
  }
  return null;
}

/** Splits on blank lines / paragraph breaks. Fallback for text with no
 *  clause numbering at all. */
function segmentByParagraph(text: string): SegmentedClause[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return paragraphs.map((p, i) => ({
    ordinal: i + 1,
    label: null,
    text: p,
    suggestedType: suggestClauseType(p),
  }));
}

export function segmentClauses(text: string): SegmentedClause[] {
  const normalized = text.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  type Pending = { label: string | null; lines: string[] };
  const pending: Pending[] = [];
  let current: Pending | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const match = line.match(CLAUSE_NUMBER);
    if (match) {
      if (current) pending.push(current);
      current = { label: match[1], lines: [line.slice(match[0].length)] };
    } else if (current) {
      current.lines.push(line);
    }
    // Text before the first numbered clause (a title, a preamble) is
    // deliberately dropped -- it is not a clause and scoring it would waste
    // a call. If a contract's numbering never starts, segmentByParagraph
    // below is what actually runs, and it keeps everything.
  }
  if (current) pending.push(current);

  if (pending.length === 0) {
    return segmentByParagraph(normalized);
  }

  return pending.map((p, i) => {
    const joined = p.lines.join(" ").replace(/\s+/g, " ").trim();
    return {
      ordinal: i + 1,
      label: p.label,
      text: joined,
      suggestedType: suggestClauseType(joined),
    };
  }).filter((c) => c.text.length > 0);
}

/** True if a suggested type actually exists in the taxonomy. Segmentation
 *  and scoring both import from the same taxonomy module, so this should
 *  never fail in practice -- it exists to catch a typo in TYPE_HINTS during
 *  development, not a runtime condition callers need to branch on. */
export function isValidSuggestion(type: ClauseTypeId | null): boolean {
  if (type === null) return true;
  return CLAUSE_TAXONOMY.some((t) => t.id === type);
}
