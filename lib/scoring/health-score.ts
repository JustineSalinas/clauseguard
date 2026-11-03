import type { ScoredClause } from "@/lib/types";
import { verdictFor } from "@/lib/types";

export interface ContractHealthReport {
  score: number; // 0 - 100
  grade: "A" | "B" | "C" | "D";
  label: string;
  tone: "clear" | "caution" | "flag";
  summary: string;
  totalClauses: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  reviewCount: number;
  unreadableCount: number;
}

export function computeContractHealth(clauses: ScoredClause[]): ContractHealthReport {
  if (!clauses || clauses.length === 0) {
    return {
      score: 100,
      grade: "A",
      label: "No clauses to evaluate",
      tone: "clear",
      summary: "No clauses have been evaluated for this document yet.",
      totalClauses: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      reviewCount: 0,
      unreadableCount: 0,
    };
  }

  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;
  let reviewCount = 0;
  let unreadableCount = 0;

  for (const c of clauses) {
    const verdict = verdictFor(c);
    if (verdict === "unreadable") {
      unreadableCount++;
    } else if (verdict === "review") {
      reviewCount++;
    } else if (c.riskLevel === "high") {
      highRiskCount++;
    } else if (c.riskLevel === "medium") {
      mediumRiskCount++;
    } else {
      lowRiskCount++;
    }
  }

  // Deduct from 100 based on severity
  let rawScore = 100;
  rawScore -= highRiskCount * 18;
  rawScore -= mediumRiskCount * 7;
  rawScore -= reviewCount * 4;
  rawScore -= unreadableCount * 5;

  const score = Math.max(0, Math.min(100, rawScore));

  let grade: "A" | "B" | "C" | "D" = "A";
  let label = "Favorable Terms";
  let tone: "clear" | "caution" | "flag" = "clear";
  let summary = "The contract stipulations appear balanced and conform to standard Philippine contracting norms.";

  if (score < 50 || highRiskCount >= 2) {
    grade = "D";
    label = "High Risk / Predatory Covenants";
    tone = "flag";
    summary = `This agreement shifts significant legal and financial liability onto you (${highRiskCount} high-risk clause${
      highRiskCount > 1 ? "s" : ""
    } flagged). Critical terms violate mutuality under Civil Code Art. 1308. Renegotiation strongly advised.`;
  } else if (score < 75 || highRiskCount === 1) {
    grade = "C";
    label = "Unfavorable / Needs Revision";
    tone = "caution";
    summary = `The contract contains ${highRiskCount > 0 ? "1 high-risk covenant" : `${mediumRiskCount} non-standard terms`} that should be amended before signing. Use our counter-proposal drafts to adjust liability.`;
  } else if (score < 90 || mediumRiskCount > 0) {
    grade = "B";
    label = "Moderate Risk / Review Covenants";
    tone = "caution";
    summary = `Overall balanced with ${mediumRiskCount} clause${mediumRiskCount > 1 ? "s" : ""} worth reviewing. Standard protections are in place with minor ambiguities.`;
  }

  return {
    score,
    grade,
    label,
    tone,
    summary,
    totalClauses: clauses.length,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    reviewCount,
    unreadableCount,
  };
}

