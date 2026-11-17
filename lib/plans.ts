/**
 * Plan limits. Pure config + pure check functions, no Convex imports, so
 * they're testable without a deployment and can eventually be read by the
 * pricing page too (numbers below are copied from app/page.tsx's pricing
 * section -- keep both in sync by hand, same caveat as taxonomy.ts).
 *
 * Billing (PayMongo) is deliberately not built yet -- see PLAN.md's Tier 1
 * list. Until a subscription actually assigns a plan, every account reads
 * as "professional" (unlimited): the landing page promises "all accounts
 * unlocked at Professional capability, free, while the capstone study
 * runs," so enforcement must never regress a real user during the study.
 * This module exists so wiring billing later is "assign a plan to the
 * user" rather than "invent the limit logic under deadline."
 */

export type PlanId = "starter" | "professional" | "agency";

export type PlanLimits = {
  /** null = unlimited */
  reviewsPerMonth: number | null;
  /** null = unlimited */
  maxPagesPerDocument: number | null;
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  starter: { reviewsPerMonth: 3, maxPagesPerDocument: 15 },
  professional: { reviewsPerMonth: null, maxPagesPerDocument: null },
  agency: { reviewsPerMonth: null, maxPagesPerDocument: null },
};

/** The plan an account has when no subscription row exists for it. */
export const DEFAULT_PLAN: PlanId = "professional";

export function startOfCurrentMonth(now: number): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

export type UploadLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "reviews_per_month"; limit: number; used: number };

/**
 * Pure decision function: given a plan and how many reviews this account
 * has already started this month, is one more allowed? Kept separate from
 * the Convex query that counts `used` so the limit logic itself is
 * unit-testable without a database.
 */
export function checkUploadAllowed(plan: PlanId, usedThisMonth: number): UploadLimitResult {
  const limit = PLAN_LIMITS[plan].reviewsPerMonth;
  if (limit === null) return { allowed: true };
  if (usedThisMonth < limit) return { allowed: true };
  return { allowed: false, reason: "reviews_per_month", limit, used: usedThisMonth };
}
