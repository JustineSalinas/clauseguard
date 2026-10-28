/**
 * ClauseGuard schema, translated from supabase/migrations/0001_init.sql and
 * 0002_stage_runs_and_retrievals.sql. Table-for-table, same shape and same
 * reasoning (see those files' comments for *why* each table is split the
 * way it is -- that reasoning doesn't change just because the storage
 * engine did).
 *
 * What does NOT carry over, because Convex has no equivalent primitive:
 *
 * - **RLS.** Every ownership check the old migrations expressed as a
 *   `using (auth.uid() = owner_id)` policy is now written by hand inside
 *   each query/mutation in convex/documents.ts, convex/clauses.ts, etc.
 *   There is no database-level backstop here -- a missing check in a
 *   function body is a missing check, full stop. Read convex/README.md
 *   before touching any function that reads or writes a row scoped to a
 *   document's owner.
 * - **ground_truth_labels being unreadable to every authenticated role.**
 *   Convex's equivalent is defining its accessors as `internalQuery` /
 *   `internalMutation` only -- functions no client can call at all, not
 *   even an authenticated one. Never add a public query or mutation over
 *   this table.
 * - **Unique constraints.** (extraction_id, ordinal), (clause_id, run_id),
 *   (code, article), etc. are enforced by a lookup-before-insert in the
 *   mutation, not by the schema. Noted on each table below.
 * - **The `clause_types` reference table.** Postgres used it for a foreign
 *   key so a typo'd clause_type fails loudly on insert. Convex's version of
 *   that guarantee is the `CLAUSE_TYPE` literal union below, checked by
 *   TypeScript at compile time -- arguably stronger, since it fails at
 *   build time instead of at write time. Keep it in sync BY HAND with
 *   lib/pipeline/taxonomy.ts; nothing enforces the two lists match.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// Mirrors lib/pipeline/taxonomy.ts's ClauseTypeId exactly. Convex functions
// run in a separate deployment from the Next.js app and can't import from
// lib/, so this is a hand-kept duplicate, not a shared source of truth.
// CI should eventually assert the two lists match (todo, not built yet).
export const CLAUSE_TYPE = v.union(
  v.literal("term.duration"),
  v.literal("termination.unilateral"),
  v.literal("termination.mutual"),
  v.literal("payment.terms"),
  v.literal("payment.penalty"),
  v.literal("ip.assignment.broad"),
  v.literal("ip.assignment.limited"),
  v.literal("indemnity.uncapped"),
  v.literal("indemnity.capped"),
  v.literal("liability.limitation"),
  v.literal("non.compete"),
  v.literal("non.solicitation"),
  v.literal("confidentiality"),
  v.literal("force.majeure"),
  v.literal("dispute.arbitration"),
  v.literal("dispute.venue"),
  v.literal("warranty"),
  v.literal("assignment.rights"),
  v.literal("amendment"),
  v.literal("severability"),
  v.literal("entire.agreement"),
  v.literal("other"),
);

const DOCUMENT_STATUS = v.union(
  v.literal("uploaded"),
  v.literal("extracting"),
  v.literal("extracted"),
  v.literal("segmenting"),
  v.literal("segmented"),
  v.literal("scoring"),
  v.literal("partial"),
  v.literal("complete"),
  v.literal("failed"),
);

const RISK_LEVEL = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));

export const GROUNDING_ARM = v.union(v.literal("none"), v.literal("static"), v.literal("rag"));

const SCORE_OUTCOME = v.union(
  v.literal("ok"),
  v.literal("refusal"),
  v.literal("parse_error"),
  v.literal("safety_block"),
  v.literal("timeout"),
  v.literal("rate_limited"),
  v.literal("empty"),
  v.literal("context_limit"),
);

const PIPELINE_STAGE = v.union(
  v.literal("extract"),
  v.literal("segment"),
  v.literal("ground"),
  v.literal("score"),
);

const STAGE_RUN_OUTCOME = v.union(v.literal("ok"), v.literal("partial"), v.literal("failed"));

const PROVISION_CODE = v.union(v.literal("CIVIL"), v.literal("LABOR"));

export default defineSchema({
  // Convex Auth's own tables (users, authAccounts, authSessions, ...).
  // `users` is what documents.ownerId references below.
  ...authTables,

  // ---------------------------------------------------------- documents ----
  documents: defineTable({
    ownerId: v.id("users"),
    filename: v.string(),
    storagePath: v.string(), // Convex storage id as a string, set after upload
    contentHash: v.optional(v.string()),
    contractType: v.optional(v.string()),
    pageCount: v.optional(v.number()),
    status: DOCUMENT_STATUS,
    failedStage: v.optional(v.string()),
    failedReason: v.optional(v.string()),
    // Set when a stage begins; a sweeper (not built yet, same as the
    // Postgres version) marks anything older than the stage timeout failed.
    stageStartedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_status", ["status", "stageStartedAt"]),

  // --------------------------------------------------------- extractions ---
  // Versioned per document -- bounding boxes are only valid for the
  // extraction that produced them. No unique constraint to enforce here.
  extractions: defineTable({
    documentId: v.id("documents"),
    ocrEngine: v.string(),
    settings: v.any(),
    pageSizes: v.array(v.any()),
    suppressedTokenCount: v.number(),
    createdAt: v.number(),
  }).index("by_document", ["documentId"]),

  // ------------------------------------------------------------- clauses ---
  // Unique (extractionId, ordinal) enforced in the mutation, not here.
  clauses: defineTable({
    documentId: v.id("documents"),
    extractionId: v.id("extractions"),
    ordinal: v.number(),
    label: v.optional(v.string()),
    clauseType: v.optional(CLAUSE_TYPE),
    text: v.string(),
    page: v.number(),
    charStart: v.optional(v.number()),
    charEnd: v.optional(v.number()),
    bboxes: v.array(v.any()),
    createdAt: v.number(),
  })
    .index("by_document_ordinal", ["documentId", "ordinal"])
    .index("by_extraction_ordinal", ["extractionId", "ordinal"])
    .index("by_type", ["clauseType"]),

  // ----------------------------------------------- ground_truth_labels ----
  // Service-role-only in the old schema (RLS enabled, zero policies -- every
  // authenticated read denied). Here that's enforced by NEVER exposing a
  // public query/mutation over this table -- see convex/groundTruth.ts,
  // which only defines internalQuery/internalMutation. Unique
  // (clauseId, annotatorId) enforced in the mutation.
  groundTruthLabels: defineTable({
    clauseId: v.id("clauses"),
    annotatorId: v.string(),
    riskLevel: RISK_LEVEL,
    clauseType: v.optional(CLAUSE_TYPE),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clause", ["clauseId"]),

  // --------------------------------------------------------- scoring_runs -
  // One row per (model x prompt version x grounding arm) pass. No user data
  // -- readable by any authenticated user, same as the old `using (true)`
  // policy.
  scoringRuns: defineTable({
    label: v.optional(v.string()),
    modelId: v.string(),
    promptVersion: v.string(),
    groundingArm: GROUNDING_ARM,
    temperature: v.optional(v.number()),
    isProduction: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_dims", ["modelId", "groundingArm", "promptVersion"]),

  // ------------------------------------------------------- clause_scores --
  // Unique (clauseId, runId) enforced in the mutation.
  clauseScores: defineTable({
    clauseId: v.id("clauses"),
    runId: v.id("scoringRuns"),
    riskLevel: v.optional(RISK_LEVEL),
    // 0 to 1. Written even when the UI won't show a verdict -- Objective 2
    // correlates it against ground truth regardless.
    confidence: v.optional(v.number()),
    rationale: v.optional(v.string()),
    deviation: v.optional(v.string()),
    provisionsReliedOn: v.array(v.string()),
    injectionSuspected: v.boolean(),
    outcome: SCORE_OUTCOME,
    tokensIn: v.optional(v.number()),
    tokensOut: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    // Denormalized from clause_retrievals, same reasoning as the Postgres
    // migration: every results-chapter query filters on this, so computing
    // it via join every time is the kind of query nobody writes twice.
    retrievalHit: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_run", ["runId"])
    .index("by_clause", ["clauseId"]),

  // ------------------------------------------------------------ provisions
  // Civil Code / Labor Code text. Public law, not user data -- readable by
  // any authenticated user. Unique (code, article) enforced in the mutation
  // (see convex/corpus.ts, the seed path).
  provisions: defineTable({
    code: PROVISION_CODE,
    article: v.string(),
    heading: v.optional(v.string()),
    text: v.string(),
    // Populated by the embedding-generation step, not the corpus seed --
    // same "build after the corpus is loaded" rule the old
    // provisions_embedding_idx comment enforced. 768 dims, matching the
    // frozen vector(768) column -- pick an embedding model that actually
    // outputs that width.
    embedding: v.optional(v.array(v.float64())),
    embeddingModel: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_code_article", ["code", "article"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["code"],
    }),

  // ---------------------------------------------------- provision_mappings
  // ARM 2 (static grounding). Hand-curated against primary sources -- see
  // corpus/mapping/README.md. Unique (clauseType, provisionId) enforced in
  // the mutation.
  provisionMappings: defineTable({
    clauseType: CLAUSE_TYPE,
    provisionId: v.id("provisions"),
    rank: v.number(),
  }).index("by_type_rank", ["clauseType", "rank"]),

  // ----------------------------------------------------------- stage_runs -
  // One row per stage invocation per document -- per-stage wall-clock
  // duration, which documents.stageStartedAt alone can't give you since
  // every stage overwrites it.
  stageRuns: defineTable({
    documentId: v.id("documents"),
    stage: PIPELINE_STAGE,
    // Null for extract/segment, which don't call a model today.
    modelId: v.optional(v.string()),
    promptVersion: v.optional(v.string()),
    tokensIn: v.optional(v.number()),
    tokensOut: v.optional(v.number()),
    latencyMs: v.optional(v.number()),
    outcome: STAGE_RUN_OUTCOME,
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_document_stage", ["documentId", "stage"]),

  // ----------------------------------------------------- clause_retrievals
  // Objective 4's retrieval dataset: what was fetched, at what rank and
  // similarity, before the model saw it. Zero rows for a (clauseId, runId)
  // pair is the NoRelevantProvision case -- a legitimate result, not a
  // failure. Unique (clauseId, runId, provisionId) enforced in the mutation.
  clauseRetrievals: defineTable({
    clauseId: v.id("clauses"),
    runId: v.id("scoringRuns"),
    provisionId: v.id("provisions"),
    rank: v.number(),
    similarity: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_clause_run_rank", ["clauseId", "runId", "rank"]),
});
