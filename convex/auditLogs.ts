/**
 * Per-user activity / audit log: which contracts were uploaded, analysed,
 * flagged, opened for review, retried or failed, and when.
 *
 * What is stored: the event, a timestamp, the filename and counts. Never
 * contract text, clause text or scores -- an audit trail should not become a
 * second copy of the sensitive data it describes.
 *
 * Access control (hand-written; Convex has no RLS): every row carries
 * `ownerId`, and the only public functions here (`listMine`, `summaryMine`,
 * `recordReview`) resolve the caller with getAuthUserId and only ever read
 * rows where ownerId === caller, or write for a document the caller owns.
 * There is no public insert for any other event: uploaded / analysed /
 * failed / retried are written by `recordAudit` from inside the
 * mutations that cause them, so a client cannot forge or edit its own history.
 *
 * Rows are removed together with their document (`removeForDocument`, called
 * from documents.remove): deleting a contract leaves no trace of it here.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { CONFIDENCE_THRESHOLD } from "../lib/types";

export type AuditEvent =
  | "uploaded"
  | "analyzed"
  | "failed"
  | "reviewed"
  | "retried";

export type AuditDetail = {
  clauses?: number;
  /** Clauses scored with confidence at/above the threshold at medium or high risk. */
  flagged?: number;
  /** Clauses the reader must check themselves: low confidence or unreadable. */
  needsReview?: number;
  /** "complete" or "partial" for analysed events. */
  status?: string;
  stage?: string;
};

/** Reviews of the same document inside this window count as one. */
const REVIEW_DEDUPE_MS = 30 * 60 * 1000;

/** Delete every audit row for one document. Called by documents.remove. */
export async function removeForDocument(
  ctx: Pick<MutationCtx, "db">,
  ownerId: Id<"users">,
  documentId: string,
) {
  const rows = await ctx.db
    .query("auditLogs")
    .withIndex("by_owner_document", (q) => q.eq("ownerId", ownerId).eq("documentId", documentId))
    .collect();
  for (const r of rows) await ctx.db.delete(r._id);
}

/** Append one event. Called from inside the mutation that caused it. */
export async function recordAudit(
  ctx: Pick<MutationCtx, "db">,
  entry: {
    ownerId: Id<"users">;
    event: AuditEvent;
    documentId: string;
    filename: string;
    detail?: AuditDetail;
  },
) {
  await ctx.db.insert("auditLogs", { ...entry, createdAt: Date.now() });
}

/** Counts for an "analyzed" event: derived from the latest score per clause. */
export async function summariseDocument(
  ctx: Pick<MutationCtx, "db">,
  documentId: Id<"documents">,
): Promise<Required<Pick<AuditDetail, "clauses" | "flagged" | "needsReview">>> {
  const clauses = await ctx.db
    .query("clauses")
    .withIndex("by_document_ordinal", (q) => q.eq("documentId", documentId))
    .collect();

  let flagged = 0;
  let needsReview = 0;
  for (const c of clauses) {
    const score = await ctx.db
      .query("clauseScores")
      .withIndex("by_clause", (q) => q.eq("clauseId", c._id))
      .order("desc")
      .first();
    if (!score || score.outcome !== "ok" || !score.riskLevel) {
      needsReview++;
    } else if ((score.confidence ?? 0) < CONFIDENCE_THRESHOLD) {
      needsReview++;
    } else if (score.riskLevel === "medium" || score.riskLevel === "high") {
      flagged++;
    }
  }
  return { clauses: clauses.length, flagged, needsReview };
}

// ------------------------------------------------------------- public ----

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", userId))
      .order("desc")
      .take(200);
  },
});

export const summaryMine = query({
  args: {},
  handler: async (ctx) => {
    const empty = {
      uploaded: 0,
      analyzed: 0,
      contractsWithFlags: 0,
      flaggedClauses: 0,
      needsReviewClauses: 0,
      reviewed: 0,
      failed: 0,
    };
    const userId = await getAuthUserId(ctx);
    if (!userId) return empty;

    const rows = await ctx.db
      .query("auditLogs")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", userId))
      .order("desc")
      .take(5000);

    const out = { ...empty };
    const reviewedDocs = new Set<string>();
    for (const r of rows) {
      if (r.event === "uploaded") out.uploaded++;
      else if (r.event === "failed") out.failed++;
      else if (r.event === "reviewed") reviewedDocs.add(r.documentId);
      else if (r.event === "analyzed") {
        out.analyzed++;
        const flagged = r.detail?.flagged ?? 0;
        if (flagged > 0) out.contractsWithFlags++;
        out.flaggedClauses += flagged;
        out.needsReviewClauses += r.detail?.needsReview ?? 0;
      }
    }
    out.reviewed = reviewedDocs.size;
    return out;
  },
});

/**
 * The browser reports "the user opened this contract's review". Ownership is
 * checked against the document, and a repeat within REVIEW_DEDUPE_MS is a
 * no-op so a refresh does not inflate the count.
 */
export const recordReview = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const doc = await ctx.db.get(documentId);
    if (!doc || doc.ownerId !== userId) return false;
    // Only a finished analysis can be "reviewed".
    if (doc.status !== "complete" && doc.status !== "partial") return false;

    const latest = await ctx.db
      .query("auditLogs")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", userId))
      .order("desc")
      .filter((q) =>
        q.and(q.eq(q.field("event"), "reviewed"), q.eq(q.field("documentId"), documentId)),
      )
      .first();
    if (latest && Date.now() - latest.createdAt < REVIEW_DEDUPE_MS) return false;

    await recordAudit(ctx, {
      ownerId: userId,
      event: "reviewed",
      documentId,
      filename: doc.filename,
    });
    return true;
  },
});
