/**
 * provisions + provisionMappings accessors. Public law, not user data --
 * same "readable by any authenticated user" posture the old
 * `provisions_select` / `provision_mappings_select` RLS policies gave with
 * `using (true)`.
 */

import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";
import { CLAUSE_TYPE } from "./schema";

export const listForClauseType = internalQuery({
  args: { clauseType: v.optional(CLAUSE_TYPE) },
  handler: async (ctx, { clauseType }) => {
    if (!clauseType || clauseType === "other") return [];

    const mappings = await ctx.db
      .query("provisionMappings")
      .withIndex("by_type_rank", (q) => q.eq("clauseType", clauseType))
      .collect();

    const provisions = await Promise.all(mappings.map((m) => ctx.db.get(m.provisionId)));

    return provisions
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map((p) => ({ code: p.code, article: p.article, text: p.text }));
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("provisions").collect(),
});

// -------------------------------------------------- corpus seed (admin) --
// Run once from the dashboard's Functions tab (or a one-off script) after
// the project is provisioned -- replaces npm run seed:corpus /
// seed:corpus:mappings. Upserts by (code, article) so it's safe to re-run.

export const upsertProvision = internalMutation({
  args: {
    code: v.union(v.literal("CIVIL"), v.literal("LABOR")),
    article: v.string(),
    heading: v.optional(v.string()),
    text: v.string(),
  },
  handler: async (ctx, { code, article, heading, text }) => {
    const existing = await ctx.db
      .query("provisions")
      .withIndex("by_code_article", (q) => q.eq("code", code).eq("article", article))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { heading, text });
      return existing._id;
    }
    return await ctx.db.insert("provisions", { code, article, heading, text, createdAt: Date.now() });
  },
});

export const seedMappings = internalMutation({
  args: {
    entries: v.array(
      v.object({
        clauseType: v.string(),
        code: v.union(v.literal("CIVIL"), v.literal("LABOR")),
        article: v.string(),
        rank: v.number(),
      }),
    ),
  },
  handler: async (ctx, { entries }) => {
    let written = 0;
    for (const { clauseType, code, article, rank } of entries) {
      const provision = await ctx.db
        .query("provisions")
        .withIndex("by_code_article", (q) => q.eq("code", code).eq("article", article))
        .unique();
      if (!provision) throw new Error(`No provision ${code} ${article} -- seed provisions first.`);

      const existing = await ctx.db
        .query("provisionMappings")
        .withIndex("by_type_rank", (q) => q.eq("clauseType", clauseType as never))
        .filter((q) => q.eq(q.field("provisionId"), provision._id))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { rank });
      } else {
        await ctx.db.insert("provisionMappings", { clauseType: clauseType as never, provisionId: provision._id, rank });
      }
      written++;
    }
    return written;
  },
});

export const upsertMapping = internalMutation({
  args: { clauseType: CLAUSE_TYPE, code: v.union(v.literal("CIVIL"), v.literal("LABOR")), article: v.string(), rank: v.number() },
  handler: async (ctx, { clauseType, code, article, rank }) => {
    const provision = await ctx.db
      .query("provisions")
      .withIndex("by_code_article", (q) => q.eq("code", code).eq("article", article))
      .unique();
    if (!provision) throw new Error(`No provision ${code} ${article} -- seed provisions first.`);

    const existing = await ctx.db
      .query("provisionMappings")
      .withIndex("by_type_rank", (q) => q.eq("clauseType", clauseType))
      .filter((q) => q.eq(q.field("provisionId"), provision._id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { rank });
    } else {
      await ctx.db.insert("provisionMappings", { clauseType, provisionId: provision._id, rank });
    }
  },
});
