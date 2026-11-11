/**
 * provisions + provisionMappings accessors. Public law, not user data --
 * same "readable by any authenticated user" posture the old
 * `provisions_select` / `provision_mappings_select` RLS policies gave with
 * `using (true)`.
 */

import { v } from "convex/values";
import { query, internalQuery, internalMutation, action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { CLAUSE_TYPE } from "./schema";

export const listForClauseType = query({
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
// the project is provisioned -- Upserts by (code, article) so it's safe to re-run.

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

// ---------------------------------------------------- RAG vector search --

export const getById = internalQuery({
  args: { id: v.id("provisions") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getManyByIds = internalQuery({
  args: { ids: v.array(v.id("provisions")) },
  handler: async (ctx, { ids }) => {
    const provisions = await Promise.all(ids.map((id) => ctx.db.get(id)));
    return provisions.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});

export const saveEmbeddingsBatch = internalMutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("provisions"),
        embedding: v.array(v.float64()),
        embeddingModel: v.string(),
      }),
    ),
  },
  handler: async (ctx, { updates }) => {
    for (const { id, embedding, embeddingModel } of updates) {
      await ctx.db.patch(id, { embedding, embeddingModel });
    }
    return updates.length;
  },
});

export const listNeedingEmbeddings = internalQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("provisions").collect();
    return all
      .filter((p) => !p.embedding || p.embedding.length !== 768)
      .map((p) => ({
        _id: p._id,
        code: p.code,
        article: p.article,
        heading: p.heading,
        text: p.text,
      }));
  },
});

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMS = 768;

async function embedText(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: EMBEDDING_DIMS,
      }),
    },
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini embedding failed (${res.status}): ${errText}`);
  }
  const data = (await res.json()) as { embedding: { values: number[] } };
  return data.embedding.values;
}

export type SearchMatch = {
  provisionId: Id<"provisions">;
  code: "CIVIL" | "LABOR";
  article: string;
  heading?: string;
  text: string;
  similarity: number;
  rank: number;
};

export const searchProvisions = action({
  args: {
    text: v.string(),
    limit: v.optional(v.number()),
    minSimilarity: v.optional(v.number()),
  },
  handler: async (ctx, { text, limit = 3, minSimilarity = 0.55 }): Promise<SearchMatch[]> => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set.");

    const embedding = await embedText(text, apiKey);

    const matches = await ctx.vectorSearch("provisions", "by_embedding", {
      vector: embedding,
      limit: Math.max(limit * 2, 5),
    });

    const filtered = matches.filter((m) => m._score >= minSimilarity).slice(0, limit);
    if (filtered.length === 0) return [];

    const provisions: any[] = await ctx.runQuery(internal.corpus.getManyByIds, {
      ids: filtered.map((m) => m._id),
    });

    const provisionMap = new Map<string, any>(provisions.map((p: any) => [p._id, p]));

    return filtered
      .map((match, idx): SearchMatch | null => {
        const p = provisionMap.get(match._id);
        if (!p) return null;
        return {
          provisionId: p._id as Id<"provisions">,
          code: p.code,
          article: p.article,
          heading: p.heading,
          text: p.text,
          similarity: match._score,
          rank: idx + 1,
        };
      })
      .filter((item): item is SearchMatch => item !== null);
  },
});

export const embedAllProvisions = action({
  args: {},
  handler: async (ctx): Promise<{ total: number; embedded: number; message?: string }> => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set.");

    const provisions: any[] = await ctx.runQuery(internal.corpus.listNeedingEmbeddings);
    if (provisions.length === 0) {
      return { total: 0, embedded: 0, message: "All provisions already have embeddings." };
    }

    const batchSize = 50;
    let totalEmbedded = 0;

    for (let i = 0; i < provisions.length; i += batchSize) {
      const chunk: any[] = provisions.slice(i, i + batchSize);
      const requests = chunk.map((p: any) => ({
        model: `models/${EMBEDDING_MODEL}`,
        content: {
          parts: [{ text: `${p.code} Code Article ${p.article}${p.heading ? ` (${p.heading})` : ""}: ${p.text}` }],
        },
        outputDimensionality: EMBEDDING_DIMS,
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requests }),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Embedding batch failed at index ${i}: ${errText}`);
      }

      const data = (await res.json()) as { embeddings: Array<{ values: number[] }> };
      const updates = chunk.map((p: any, idx: number) => ({
        id: p._id as Id<"provisions">,
        embedding: data.embeddings[idx].values,
        embeddingModel: EMBEDDING_MODEL,
      }));

      await ctx.runMutation(internal.corpus.saveEmbeddingsBatch, { updates });
      totalEmbedded += updates.length;
    }

    return { total: provisions.length, embedded: totalEmbedded };
  },
});
