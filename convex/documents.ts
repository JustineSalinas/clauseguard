/**
 * documents table accessors. Every ownership check the old
 * `documents_select_own` / `_insert_own` / `_delete_own` RLS policies made
 * is written here by hand -- `getAuthUserId(ctx)` plus an explicit
 * `doc.ownerId === userId` check on every read/write. There is no RLS
 * backstop in Convex: a missing check here is a cross-tenant leak, full
 * stop, the same failure Navarro's old Postgres cross-tenant tests existed
 * to catch. tests/security needs a Convex-native equivalent -- not built
 * yet, see convex/README.md.
 *
 * No `update` mutation is exposed to the client, same as the old schema's
 * "no UPDATE policy -- status transitions belong to the pipeline." Status
 * changes go through internalMutation functions the pipeline action calls,
 * never through something a signed-in browser can invoke directly.
 */

import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const PROCESSING_STATUSES = new Set([
  "uploaded",
  "extracting",
  "extracted",
  "segmenting",
  "segmented",
  "scoring",
]);

export const statsForMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, inProgress: 0, needsReview: 0, complete: 0 };

    const docs = await ctx.db
      .query("documents")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", userId))
      .collect();

    let inProgress = 0;
    let needsReview = 0;
    let complete = 0;
    for (const d of docs) {
      if (PROCESSING_STATUSES.has(d.status)) inProgress++;
      else if (d.status === "partial" || d.status === "failed") needsReview++;
      else if (d.status === "complete") complete++;
    }

    return { total: docs.length, inProgress, needsReview, complete };
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("documents")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const doc = await ctx.db.get(id);
    // Returning null for "exists but not yours" (not an error, not the
    // row) is the Convex-function equivalent of RLS returning an empty
    // result on denial -- never distinguish "not found" from "not yours"
    // in the response, or the ownership check becomes an enumeration oracle.
    if (!doc || doc.ownerId !== userId) return null;

    return doc;
  },
});

// Called after the client uploads the file to Convex storage (see
// components/upload/upload-form.tsx) with the storageId that upload
// returned. This is the one write a signed-in user genuinely makes
// directly -- everything past "uploaded" is the pipeline's job.
export const create = mutation({
  args: {
    filename: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { filename, storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in.");

    const now = Date.now();
    return await ctx.db.insert("documents", {
      ownerId: userId,
      filename,
      storagePath: storageId,
      status: "uploaded",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in.");

    const doc = await ctx.db.get(id);
    if (!doc || doc.ownerId !== userId) {
      // Same shape as get(): don't reveal whether the id exists at all.
      throw new Error("Document not found.");
    }

    await ctx.storage.delete(doc.storagePath as never);
    await ctx.db.delete(id);
  },
});

// -------------------------------------------------- pipeline-internal ----
// Nothing below this line is reachable from the browser. The pipeline
// action (convex/pipeline.ts, not built yet) calls these the same way
// lib/pipeline/run.ts used the Supabase service-role client -- except here
// "service role" just means "this is an internalMutation," not a separate
// key that could leak.

export const getForPipeline = internalQuery({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const advanceStatus = internalMutation({
  args: {
    id: v.id("documents"),
    from: v.array(v.string()),
    to: v.string(),
  },
  handler: async (ctx, { id, from, to }) => {
    const doc = await ctx.db.get(id);
    if (!doc) return false;
    // Guarded transition, same intent as the Postgres state machine's
    // TRANSITIONS table: a document can't run a stage twice or skip one.
    if (!from.includes(doc.status)) return false;

    await ctx.db.patch(id, {
      status: to as typeof doc.status,
      stageStartedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const failStage = internalMutation({
  args: {
    id: v.id("documents"),
    stage: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, { id, stage, reason }) => {
    await ctx.db.patch(id, {
      status: "failed",
      failedStage: stage,
      failedReason: reason,
      updatedAt: Date.now(),
    });
  },
});

export const setPageCount = internalMutation({
  args: { id: v.id("documents"), pageCount: v.number() },
  handler: async (ctx, { id, pageCount }) => {
    await ctx.db.patch(id, { pageCount, updatedAt: Date.now() });
  },
});
