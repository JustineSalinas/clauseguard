/**
 * clauses + clauseScores read accessors. Ownership is two hops away (clause
 * -> document -> owner), same join the old `clauses_select_own` /
 * `clause_scores_select_own` RLS policies made -- done here as two
 * `ctx.db.get` calls instead of a SQL join.
 */

import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function assertOwnsDocument(ctx: { db: any }, userId: string, documentId: any) {
  const doc = await ctx.db.get(documentId);
  return !!doc && doc.ownerId === userId;
}

export const listForDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || !(await assertOwnsDocument(ctx, userId, documentId))) return [];

    return await ctx.db
      .query("clauses")
      .withIndex("by_document_ordinal", (q) => q.eq("documentId", documentId))
      .order("asc")
      .collect();
  },
});

// Latest score per clause, for the document's active (most recent
// production) scoring run. A document can have scores from multiple runs
// (Objective 3 ablation re-scores the same clauses); the review UI only
// ever wants the production one.
export const listScoresForDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId || !(await assertOwnsDocument(ctx, userId, documentId))) return [];

    const clauses = await ctx.db
      .query("clauses")
      .withIndex("by_document_ordinal", (q) => q.eq("documentId", documentId))
      .collect();

    const scores = await Promise.all(
      clauses.map((c: any) =>
        ctx.db
          .query("clauseScores")
          .withIndex("by_clause", (q: any) => q.eq("clauseId", c._id))
          .order("desc")
          .first(),
      ),
    );

    return clauses.map((clause: any, i: number) => ({ clause, score: scores[i] ?? null }));
  },
});

// -------------------------------------------------- pipeline-internal ----

export const insertMany = internalMutation({
  args: {
    documentId: v.id("documents"),
    extractionId: v.id("extractions"),
    clauses: v.array(
      v.object({
        ordinal: v.number(),
        label: v.optional(v.string()),
        clauseType: v.optional(v.string()),
        text: v.string(),
        page: v.number(),
        charStart: v.optional(v.number()),
        charEnd: v.optional(v.number()),
        bboxes: v.array(v.any()),
      }),
    ),
  },
  handler: async (ctx, { documentId, extractionId, clauses }) => {
    const now = Date.now();
    const ids = [];
    for (const c of clauses) {
      ids.push(
        await ctx.db.insert("clauses", {
          documentId,
          extractionId,
          ordinal: c.ordinal,
          label: c.label,
          clauseType: c.clauseType as never,
          text: c.text,
          page: c.page,
          charStart: c.charStart,
          charEnd: c.charEnd,
          bboxes: c.bboxes,
          createdAt: now,
        }),
      );
    }
    return ids;
  },
});

export const insertScore = internalMutation({
  args: {
    clauseId: v.id("clauses"),
    runId: v.id("scoringRuns"),
    riskLevel: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    confidence: v.optional(v.number()),
    rationale: v.optional(v.string()),
    deviation: v.optional(v.string()),
    provisionsReliedOn: v.array(v.string()),
    injectionSuspected: v.boolean(),
    outcome: v.string(),
    tokensIn: v.optional(v.number()),
    tokensOut: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    retrievalHit: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clauseScores", {
      ...args,
      outcome: args.outcome as never,
      createdAt: Date.now(),
    });
  },
});
