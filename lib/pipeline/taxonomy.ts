/**
 * The clause taxonomy. Shared by segmentation (assigns clause_type),
 * scoring (the prompt names the type it's judging), and corpus/mapping
 * (Objective 4's static grounding arm keys off exactly these strings).
 *
 * Sized to PLAN.md's estimate of 15-20 clause types. Changing a `type` string
 * here after annotation has started is expensive: ground_truth_labels and
 * corpus/mapping both reference it by value, not by a foreign key, so a
 * rename silently orphans existing rows instead of erroring. Add new types
 * freely; rename or remove only before Day 4-5 annotation begins.
 */

export type ClauseTypeId =
  | "term.duration"
  | "termination.unilateral"
  | "termination.mutual"
  | "payment.terms"
  | "payment.penalty"
  | "ip.assignment.broad"
  | "ip.assignment.limited"
  | "indemnity.uncapped"
  | "indemnity.capped"
  | "liability.limitation"
  | "non.compete"
  | "non.solicitation"
  | "confidentiality"
  | "force.majeure"
  | "dispute.arbitration"
  | "dispute.venue"
  | "warranty"
  | "assignment.rights"
  | "amendment"
  | "severability"
  | "entire.agreement"
  | "other";

export type ClauseTypeDef = {
  id: ClauseTypeId;
  label: string;
  description: string;
};

export const CLAUSE_TAXONOMY: readonly ClauseTypeDef[] = [
  { id: "term.duration", label: "Term / duration", description: "When the agreement starts and ends." },
  { id: "termination.unilateral", label: "Unilateral termination", description: "Only one party can end the agreement, or on unequal terms." },
  { id: "termination.mutual", label: "Mutual termination", description: "Either party can end the agreement on comparable terms." },
  { id: "payment.terms", label: "Payment terms", description: "When and how payment is due." },
  { id: "payment.penalty", label: "Payment penalty", description: "Late fees, interest, or penalties tied to payment." },
  { id: "ip.assignment.broad", label: "Broad IP assignment", description: "Assigns work product beyond what was actually delivered or accepted." },
  { id: "ip.assignment.limited", label: "Limited IP assignment", description: "Assigns only the accepted deliverable." },
  { id: "indemnity.uncapped", label: "Uncapped indemnity", description: "One party covers the other's losses with no ceiling." },
  { id: "indemnity.capped", label: "Capped indemnity", description: "Indemnity limited to fees paid or another stated cap." },
  { id: "liability.limitation", label: "Limitation of liability", description: "Caps or excludes categories of damages." },
  { id: "non.compete", label: "Non-compete", description: "Restricts working in a competing line of business." },
  { id: "non.solicitation", label: "Non-solicitation", description: "Restricts soliciting clients or staff after the engagement." },
  { id: "confidentiality", label: "Confidentiality", description: "What must be kept confidential, and for how long." },
  { id: "force.majeure", label: "Force majeure", description: "Excuses non-performance for events outside either party's control." },
  { id: "dispute.arbitration", label: "Dispute resolution / arbitration", description: "How disputes are resolved and where." },
  { id: "dispute.venue", label: "Governing law / venue", description: "Which jurisdiction's law and courts apply." },
  { id: "warranty", label: "Warranty", description: "Promises about the quality or fitness of the work." },
  { id: "assignment.rights", label: "Assignment of the agreement", description: "Whether either party can transfer the agreement to someone else." },
  { id: "amendment", label: "Amendment", description: "How the agreement can be changed after signing." },
  { id: "severability", label: "Severability", description: "What happens if one clause is found unenforceable." },
  { id: "entire.agreement", label: "Entire agreement", description: "States this document is the whole deal, superseding prior discussions." },
  { id: "other", label: "Other", description: "Doesn't fit an existing type. Flag for the taxonomy owner rather than force-fitting it." },
] as const;

const TAXONOMY_BY_ID = new Map(CLAUSE_TAXONOMY.map((t) => [t.id, t]));

export function isKnownClauseType(id: string): id is ClauseTypeId {
  return TAXONOMY_BY_ID.has(id as ClauseTypeId);
}

export function clauseTypeLabel(id: string): string {
  return TAXONOMY_BY_ID.get(id as ClauseTypeId)?.label ?? id;
}
