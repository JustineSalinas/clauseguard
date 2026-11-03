import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const insert = internalMutation({
  args: {
    documentId: v.id("documents"),
    stage: v.union(
      v.literal("extract"),
      v.literal("segment"),
      v.literal("ground"),
      v.literal("score"),
    ),
    modelId: v.optional(v.string()),
    promptVersion: v.optional(v.string()),
    tokensIn: v.optional(v.number()),
    tokensOut: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    outcome: v.union(v.literal("ok"), v.literal("partial"), v.literal("failed")),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stageRuns", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listForDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const doc = await ctx.db.get(documentId);
    if (!doc || doc.ownerId !== userId) return [];

    return await ctx.db
      .query("stageRuns")
      .withIndex("by_document_stage", (q) => q.eq("documentId", documentId))
      .order("asc")
      .collect();
  },
});

