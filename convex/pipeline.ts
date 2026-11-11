"use node";

/**
 * Pipeline orchestration: upload -> extract -> segment -> ground -> score.
 * Convex-native replacement for the legacy pipeline.
 *
 * Reuses lib/pipeline/{extract,segment,score}'s existing pure functions
 * as-is. Stage execution metrics are recorded to `stageRuns` for audit
 * telemetry and research evaluation.
 *
 * Scoring runs with controlled concurrency (chunks of 3-4 parallel LLM calls)
 * to prevent sequential request timeouts while respecting provider rate limits.
 */

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createHash } from "node:crypto";

import { extractPdf, EncryptedDocumentError, NoTextDetectedError } from "../lib/pipeline/extract";
import { extractImageOcr, isOcrSupportedImage, OcrUnreadableError } from "../lib/pipeline/extract/ocr";
import { segmentClauses } from "../lib/pipeline/segment";
import { locateClauses } from "../lib/pipeline/boxes";
import { scoreClause } from "../lib/pipeline/score";
import { SCORE_STAGE_DEFAULT_MODEL } from "../lib/models";
import { PROMPT_VERSION } from "../lib/prompts/score.v1";

// Production default arm is "static", with "rag" and "none" fully supported.
const DEFAULT_GROUNDING_ARM = "static" as const;

// Number of clauses scored in parallel. 3 balances high throughput with rate limit safety.
const SCORING_CONCURRENCY = 3;

/**
 * Public entry point: called from the upload form once the file is in
 * Convex storage. Schedules background pipeline execution.
 */
export const start = action({
  args: {
    documentId: v.id("documents"),
    groundingArm: v.optional(v.union(v.literal("none"), v.literal("static"), v.literal("rag"))),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { documentId, groundingArm, modelId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in.");

    const doc = await ctx.runQuery(internal.documents.getForPipeline, { id: documentId });
    if (!doc || doc.ownerId !== userId) throw new Error("Document not found.");

    await ctx.scheduler.runAfter(0, internal.pipeline.run, {
      documentId,
      groundingArm: groundingArm ?? DEFAULT_GROUNDING_ARM,
      modelId: modelId ?? SCORE_STAGE_DEFAULT_MODEL,
    });
  },
});

/**
 * Retry action: resets any failed or partial document and kicks off the pipeline anew.
 */
export const retry = action({
  args: {
    documentId: v.id("documents"),
    groundingArm: v.optional(v.union(v.literal("none"), v.literal("static"), v.literal("rag"))),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { documentId, groundingArm, modelId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in.");

    const doc = await ctx.runQuery(internal.documents.getForPipeline, { id: documentId });
    if (!doc || doc.ownerId !== userId) throw new Error("Document not found.");

    await ctx.runMutation(internal.documents.resetForRetry, { id: documentId });

    await ctx.scheduler.runAfter(0, internal.pipeline.run, {
      documentId,
      groundingArm: groundingArm ?? DEFAULT_GROUNDING_ARM,
      modelId: modelId ?? SCORE_STAGE_DEFAULT_MODEL,
    });
  },
});

export const run = internalAction({
  args: {
    documentId: v.id("documents"),
    groundingArm: v.optional(v.union(v.literal("none"), v.literal("static"), v.literal("rag"))),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { documentId, groundingArm, modelId }) => {
    const arm = groundingArm ?? DEFAULT_GROUNDING_ARM;
    const activeModel = (modelId as typeof SCORE_STAGE_DEFAULT_MODEL) ?? SCORE_STAGE_DEFAULT_MODEL;

    const doc = await ctx.runQuery(internal.documents.getForPipeline, { id: documentId });
    if (!doc) return;

    // ---------------------------------------------------------- EXTRACT --
    const extractStart = Date.now();
    const claimed = await ctx.runMutation(internal.documents.advanceStatus, {
      id: documentId,
      from: ["uploaded"],
      to: "extracting",
    });
    if (!claimed) return; // another worker already claimed this document

    const blob = await ctx.storage.get(doc.storagePath as never);
    if (!blob) {
      await ctx.runMutation(internal.documents.failStage, {
        id: documentId,
        stage: "extract",
        reason: "The uploaded file could not be read back from storage.",
      });
      await ctx.runMutation(internal.stageRuns.insert, {
        documentId,
        stage: "extract",
        outcome: "failed",
        startedAt: extractStart,
        finishedAt: Date.now(),
        latencyMs: Date.now() - extractStart,
      });
      return;
    }

    const bytes = new Uint8Array(await blob.arrayBuffer());
    const isImage = isOcrSupportedImage(blob.type);

    let extraction;
    try {
      extraction = isImage ? await extractImageOcr(bytes, blob.type) : await extractPdf(bytes);
    } catch (error) {
      const reason =
        error instanceof EncryptedDocumentError
          ? "This PDF is password protected. Remove the password and upload it again."
          : error instanceof NoTextDetectedError
          ? "No readable text found. This PDF looks like an unlayered scan. Try uploading it as a photo (JPG/PNG) instead."
          : error instanceof OcrUnreadableError
          ? error.message
          : "This file could not be read.";

      await ctx.runMutation(internal.documents.failStage, {
        id: documentId,
        stage: "extract",
        reason,
      });
      await ctx.runMutation(internal.stageRuns.insert, {
        documentId,
        stage: "extract",
        outcome: "failed",
        startedAt: extractStart,
        finishedAt: Date.now(),
        latencyMs: Date.now() - extractStart,
      });
      console.error(`[extract] ${documentId} failure:`, error);
      return;
    }

    const extractEnd = Date.now();
    const extractionId = await ctx.runMutation(internal.extractions.insert, {
      documentId,
      ocrEngine: extraction.engine,
      settings: { grounding_arm: arm },
      pageSizes: extraction.pageSizes,
      suppressedTokenCount: extraction.suppressedTokenCount,
    });

    await ctx.runMutation(internal.documents.setPageCount, {
      id: documentId,
      pageCount: extraction.pageSizes.length,
    });
    await ctx.runMutation(internal.documents.advanceStatus, {
      id: documentId,
      from: ["extracting"],
      to: "extracted",
    });

    // Record extract stage metrics
    await ctx.runMutation(internal.stageRuns.insert, {
      documentId,
      stage: "extract",
      outcome: "ok",
      startedAt: extractStart,
      finishedAt: extractEnd,
      latencyMs: extractEnd - extractStart,
    });

    if (extraction.suppressedTokenCount > 0) {
      console.warn(`[extract] ${documentId} suppressed ${extraction.suppressedTokenCount} hidden token(s)`);
    }

    // ---------------------------------------------------------- SEGMENT --
    const segmentStart = Date.now();
    await ctx.runMutation(internal.documents.advanceStatus, {
      id: documentId,
      from: ["extracted"],
      to: "segmenting",
    });

    const segmented = segmentClauses(extraction.text);
    const locations = locateClauses(segmented.map((c) => c.text), extraction.tokens);

    if (segmented.length === 0) {
      await ctx.runMutation(internal.documents.advanceStatus, {
        id: documentId,
        from: ["segmenting"],
        to: "segmented",
      });
      await ctx.runMutation(internal.stageRuns.insert, {
        documentId,
        stage: "segment",
        outcome: "ok",
        startedAt: segmentStart,
        finishedAt: Date.now(),
        latencyMs: Date.now() - segmentStart,
      });
      await ctx.runMutation(internal.documents.advanceStatus, {
        id: documentId,
        from: ["segmented"],
        to: "complete",
      });
      return;
    }

    const clauseIds = await ctx.runMutation(internal.clauses.insertMany, {
      documentId,
      extractionId,
      clauses: segmented.map((clause, i) => ({
        ordinal: clause.ordinal,
        label: clause.label ?? undefined,
        clauseType: clause.suggestedType ?? undefined,
        text: clause.text,
        page: locations[i]?.page ?? 1,
        charStart: locations[i]?.charStart ?? undefined,
        charEnd: locations[i]?.charEnd ?? undefined,
        bboxes: locations[i]?.boxes ?? [],
      })),
    });

    const segmentEnd = Date.now();
    await ctx.runMutation(internal.documents.advanceStatus, {
      id: documentId,
      from: ["segmenting"],
      to: "segmented",
    });

    // Record segment stage metrics
    await ctx.runMutation(internal.stageRuns.insert, {
      documentId,
      stage: "segment",
      outcome: "ok",
      startedAt: segmentStart,
      finishedAt: segmentEnd,
      latencyMs: segmentEnd - segmentStart,
    });

    // ------------------------------------------------------------ SCORE --
    const scoreStart = Date.now();
    await ctx.runMutation(internal.documents.advanceStatus, {
      id: documentId,
      from: ["segmented"],
      to: "scoring",
    });

    const runId = await ctx.runMutation(internal.scoringRuns.insert, {
      label: `pipeline:${documentId.slice(0, 8)}`,
      modelId: activeModel,
      promptVersion: PROMPT_VERSION,
      groundingArm: arm,
      isProduction: true,
    });

    let scoredCount = 0;
    let failedCount = 0;
    let totalTokensIn = 0;
    let totalTokensOut = 0;

    try {
      // Controlled concurrency: score in parallel batches of SCORING_CONCURRENCY
      for (let i = 0; i < segmented.length; i += SCORING_CONCURRENCY) {
        const chunk = segmented.slice(i, i + SCORING_CONCURRENCY);

        await Promise.all(
          chunk.map(async (clause, chunkOffset) => {
            const index = i + chunkOffset;
            const clauseId = clauseIds[index];

            let provisions: Array<{ code: "CIVIL" | "LABOR"; article: string; text: string }> = [];

            try {
              if (arm === "rag") {
                const matches: any[] = await ctx.runAction(api.corpus.searchProvisions, {
                  text: clause.text,
                  limit: 2,
                  minSimilarity: 0.55,
                });

                for (const m of matches) {
                  await ctx.runMutation(internal.clauses.insertRetrieval, {
                    clauseId,
                    runId,
                    provisionId: m.provisionId,
                    rank: m.rank,
                    similarity: m.similarity,
                  });
                }

                provisions = matches.map((m: any) => ({
                  code: m.code,
                  article: m.article,
                  text: m.text,
                }));
              } else if (arm === "static") {
                provisions = await ctx.runQuery(api.corpus.listForClauseType, {
                  clauseType: clause.suggestedType ?? undefined,
                });
              }
            } catch (groundErr) {
              console.warn(`[ground] fallback to empty provisions for clause ${index}:`, groundErr);
              provisions = [];
            }

            try {
              const result = await scoreClause({
                modelId: activeModel,
                clauseText: clause.text,
                clauseLabel: clause.label,
                suggestedType: clause.suggestedType,
                provisions,
                groundingArm: arm,
              });

              await ctx.runMutation(internal.clauses.insertScore, {
                clauseId,
                runId,
                riskLevel: result.riskLevel ?? undefined,
                confidence: result.confidence ?? undefined,
                rationale: result.rationale ?? undefined,
                deviation: result.deviation ?? undefined,
                provisionsReliedOn: result.provisionsReliedOn,
                injectionSuspected: result.injectionSuspected,
                outcome: result.outcome,
                tokensIn: result.tokensIn ?? undefined,
                tokensOut: result.tokensOut ?? undefined,
                latencyMs: result.latencyMs,
                retrievalHit: provisions.length > 0,
              });

              if (result.tokensIn) totalTokensIn += result.tokensIn;
              if (result.tokensOut) totalTokensOut += result.tokensOut;

              if (result.outcome === "ok") scoredCount++;
              else failedCount++;
            } catch (clauseScoreErr) {
              console.error(`[score] clause ${index} error:`, clauseScoreErr);
              failedCount++;
            }
          }),
        );
      }
    } catch (error) {
      await ctx.runMutation(internal.documents.failStage, {
        id: documentId,
        stage: "score",
        reason: "Scoring could not complete.",
      });
      await ctx.runMutation(internal.stageRuns.insert, {
        documentId,
        stage: "score",
        modelId: activeModel,
        promptVersion: PROMPT_VERSION,
        outcome: "failed",
        startedAt: scoreStart,
        finishedAt: Date.now(),
        latencyMs: Date.now() - scoreStart,
      });
      console.error(`[score] ${documentId} structural failure:`, error);
      return;
    }

    const scoreEnd = Date.now();
    const finalStatus = failedCount === 0 ? "complete" : scoredCount > 0 ? "partial" : "failed";

    await ctx.runMutation(internal.documents.advanceStatus, {
      id: documentId,
      from: ["scoring"],
      to: finalStatus,
    });

    // Record score stage telemetry
    await ctx.runMutation(internal.stageRuns.insert, {
      documentId,
      stage: "score",
      modelId: activeModel,
      promptVersion: PROMPT_VERSION,
      tokensIn: totalTokensIn > 0 ? totalTokensIn : undefined,
      tokensOut: totalTokensOut > 0 ? totalTokensOut : undefined,
      latencyMs: scoreEnd - scoreStart,
      outcome: finalStatus === "complete" ? "ok" : finalStatus === "partial" ? "partial" : "failed",
      startedAt: scoreStart,
      finishedAt: scoreEnd,
    });
  },
});

// content hash helper, never stores
// contract text for diagnostics, only its hash.
export function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}
