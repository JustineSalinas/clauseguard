/**
 * Plan lookup + the upload-quota check. No billing provider exists yet
 * (PayMongo is still Tier 1, deliberately last -- see PLAN.md); this module
 * is the scaffolding billing will plug into: once a webhook can write a
 * userPlans row, documents.create already enforces it.
 *
 * No row in userPlans means DEFAULT_PLAN ("professional", unlimited) --
 * every account today has no row, so this is a no-op in production until
 * billing exists, matching the landing page's "all accounts unlocked at
 * Professional capability, free, while the capstone study runs."
 */

import { query, type QueryCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { DEFAULT_PLAN, checkUploadAllowed, startOfCurrentMonth, type PlanId } from "../lib/plans";

export async function getPlanForOwner(ctx: Pick<QueryCtx, "db">, ownerId: Id<"users">): Promise<PlanId> {
  const row = await ctx.db
    .query("userPlans")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .unique();
  return row?.plan ?? DEFAULT_PLAN;
}

async function countReviewsThisMonth(ctx: Pick<QueryCtx, "db">, ownerId: Id<"users">): Promise<number> {
  const since = startOfCurrentMonth(Date.now());
  const docs = await ctx.db
    .query("documents")
    .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId).gte("createdAt", since))
    .collect();
  return docs.length;
}

/** Called from documents.create before inserting a new document. */
export async function assertUploadAllowed(ctx: Pick<QueryCtx, "db">, ownerId: Id<"users">) {
  const plan = await getPlanForOwner(ctx, ownerId);
  const used = await countReviewsThisMonth(ctx, ownerId);
  const result = checkUploadAllowed(plan, used);
  if (!result.allowed) {
    throw new Error(
      `PLAN_LIMIT_REACHED: ${result.limit} review${result.limit === 1 ? "" : "s"} per month on the ${plan} plan (used ${result.used}). Upgrade to continue.`,
    );
  }
}

/** UI-facing: lets the dashboard show "2 of 3 reviews used this month" etc. */
export const myUsage = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const plan = await getPlanForOwner(ctx, userId);
    const used = await countReviewsThisMonth(ctx, userId);
    return { plan, used };
  },
});
