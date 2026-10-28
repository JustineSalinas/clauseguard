import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { GROUNDING_ARM } from "./schema";

export const insert = internalMutation({
  args: {
    label: v.optional(v.string()),
    modelId: v.string(),
    promptVersion: v.string(),
    groundingArm: GROUNDING_ARM,
    isProduction: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scoringRuns", { ...args, createdAt: Date.now() });
  },
});
