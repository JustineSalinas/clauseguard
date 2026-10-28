import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const insert = internalMutation({
  args: {
    documentId: v.id("documents"),
    ocrEngine: v.string(),
    settings: v.any(),
    pageSizes: v.array(v.any()),
    suppressedTokenCount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("extractions", { ...args, createdAt: Date.now() });
  },
});
