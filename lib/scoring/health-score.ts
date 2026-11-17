import type { ScoredClause } from "@/lib/types";
import { verdictFor } from "@/lib/types";

export interface ContractHealthReport {
  score: number; // 0 - 100
  grade: "A" | "B" | "C" | "D";
  /** False when no clause got a confident rating, so score/grade mean nothing. */
  rated: boolean;
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
      score: 0,
      grade: "D",
      rated: false,
      label: "Not rated yet",
      tone: "caution",
      summary: "We haven't checked any clauses in this document yet.",
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

  if (highRiskCount + mediumRiskCount + lowRiskCount === 0) {
    return {
      score: 0,
      grade: "D",
      rated: false,
      label: "Not rated",
      tone: "caution",
      summary:
        "We couldn't confidently rate any clause in this document, so there's no overall score. Check each clause below or ask a lawyer to look it over.",
      totalClauses: clauses.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      reviewCount,
      unreadableCount,
    };
  }

  let grade: "A" | "B" | "C" | "D" = "A";
  let label = "Looks fair";
  let tone: "clear" | "caution" | "flag" = "clear";
  let summary = "The terms we could check look balanced and in line with common practice in the Philippines.";

  if (score < 50 || highRiskCount >= 2) {
    grade = "D";
    label = "High risk";
    tone = "flag";
    summary = `This contract puts a lot of legal and financial risk on you (${highRiskCount} high-risk clause${
      highRiskCount > 1 ? "s" : ""
    }). Some terms are one-sided, which Philippine contract law (Civil Code Art. 1308) doesn't allow. We strongly suggest asking for changes before you sign.`;
  } else if (score < 75 || highRiskCount === 1) {
    grade = "C";
    label = "Needs changes";
    tone = "caution";
    summary = `The contract contains ${highRiskCount > 0 ? "1 high-risk clause" : `${mediumRiskCount} unusual clause${mediumRiskCount > 1 ? "s" : ""}`} that should be changed before you sign. Use the suggested wording on each clause to ask for a fairer version.`;
  } else if (score < 90 || mediumRiskCount > 0) {
    grade = "B";
    label = "Worth a closer look";
    tone = "caution";
    summary = `Overall balanced with ${mediumRiskCount} clause${mediumRiskCount > 1 ? "s" : ""} worth reviewing. Nothing alarming, but some wording is unclear.`;
  }

  return {
    score,
    grade,
    rated: true,
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

