"use node";

/**
 * Pipeline orchestration: upload -> extract -> segment -> ground -> score.
 * The Convex-native replacement for lib/pipeline/run.ts, which did this
 * same job against Supabase.
 *
 * Reuses lib/pipeline/{extract,segment,score}'s existing pure functions
 * as-is -- they don't know or care what database is behind them, so there
 * was nothing to rewrite there. What changes is only the orchestration:
 * every `db.from(...)` call becomes `ctx.runMutation` / `ctx.runQuery`
 * against the functions in convex/documents.ts and convex/clauses.ts.
 *
 * "use node" at the top because extractPdf (pdfjs-dist) and scoreClause
 * (the `ai` SDK, real network calls to Gemini/Groq) both need the Node
 * runtime, not Convex's default V8 isolate -- same reason actions, not
 * mutations, are the right primitive here: this talks to the outside
 * world and is not deterministic.
 */

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createHash } from "node:crypto";

import { extractPdf, EncryptedDocumentError, NoTextDetectedError } from "../lib/pipeline/extract";
import { extractImageOcr, isOcrSupportedImage, OcrUnreadableError } from "../lib/pipeline/extract/ocr";
import { segmentClauses } from "../lib/pipeline/segment";
import { locateClauses } from "../lib/pipeline/boxes";
import { scoreClause } from "../lib/pipeline/score";
import { SCORE_STAGE_DEFAULT_MODEL } from "../lib/models";
import { PROMPT_VERSION } from "../lib/prompts/score.v1";

// Same as the old FIRST_PASS_ARM in lib/pipeline/run.ts, now actually
// "static" since the corpus and provision_mappings equivalent are seeded
// (see corpus/README.md for how). "rag" still isn't wired -- no embedding
// step has been built against the Convex vector index yet either.
const GROUNDING_ARM = "static" as const;

// Public entry point: called from the upload form once the file is in
// Convex storage and documents.create has returned an id. Kicks off the
// internal action that does the real work -- scheduled rather than run
// inline so the upload mutation returns immediately and the dashboard can
// show "reading your contract" from the document's own status field
// instead of blocking the HTTP response on a multi-stage pipeline run.
export const start = action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in.");

    const doc = await ctx.runQuery(internal.documents.getForPipeline, { id: documentId });
    if (!doc || doc.ownerId !== userId) throw new Error("Document not found.");

    await ctx.scheduler.runAfter(0, internal.pipeline.run, { documentId });
  },
});

export const run = internalAction({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const doc = await ctx.runQuery(internal.documents.getForPipeline, { id: documentId });
    if (!doc) return;

    // ---------------------------------------------------------- extract --
    const claimed = await ctx.runMutation(internal.documents.advanceStatus, {
      id: documentId,
      from: ["uploaded"],
      to: "extracting",
    });
    if (!claimed) return; // another run already has it

    const blob = await ctx.storage.get(doc.storagePath as never);
    if (!blob) {
      await ctx.runMutation(internal.documents.failStage, {
        id: documentId,
        stage: "extract",
        reason: "The uploaded file could not be read back from storage.",
      });
      return;
    }

    const bytes = new Uint8Array(await blob.arrayBuffer());
    const isImage = isOcrSupportedImage(blob.type);

    let extraction;
    try {
      // A photographed/scanned image never has a PDF text layer to read, so
      // it goes straight to vision OCR -- never through extractPdf, which
      // would just throw NoTextDetectedError on image bytes anyway. A real
      // PDF always goes through the text-layer path; see ocr.ts's header
      // for why that split is never optional.
      extraction = isImage ? await extractImageOcr(bytes, blob.type) : await extractPdf(bytes);
    } catch (error) {
      if (error instanceof EncryptedDocumentError) {
        await ctx.runMutation(internal.documents.failStage, {
          id: documentId,
          stage: "extract",
          reason: "This PDF is password protected. Remove the password and upload it again.",
        });
      } else if (error instanceof NoTextDetectedError) {
        await ctx.runMutation(internal.documents.failStage, {
          id: documentId,
          stage: "extract",
          // A scanned/image-only PDF (as opposed to a plain photo upload,
          // which goes through OCR successfully above) still has no OCR
          // fallback -- rasterizing PDF pages to images isn't wired up yet.
          // Say that plainly rather than implying a photo wouldn't work.
          reason: "No readable text found. This PDF looks like a scan with no text layer -- try uploading it as a photo (JPG/PNG) instead, or a PDF exported from a document.",
        });
      } else if (error instanceof OcrUnreadableError) {
        await ctx.runMutation(internal.documents.failStage, {
          id: documentId,
          stage: "extract",
          reason: error.message,
        });
      } else {
        await ctx.runMutation(internal.documents.failStage, {
          id: documentId,
          stage: "extract",
          reason: "This file could not be read.",
        });
        console.error(`[extract] ${documentId} unrecognized failure`, error);
      }
      return;
    }

    const extractionId = await ctx.runMutation(internal.extractions.insert, {
      documentId,
      ocrEngine: extraction.engine,
      settings: { grounding_arm: GROUNDING_ARM },
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

    if (extraction.suppressedTokenCount > 0) {
      console.warn(`[extract] ${documentId} suppressed ${extraction.suppressedTokenCount} hidden token(s)`);
    }

    // ---------------------------------------------------------- segment --
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

    await ctx.runMutation(internal.documents.advanceStatus, {
      id: documentId,
      from: ["segmenting"],
      to: "segmented",
    });

    // ------------------------------------------------------------ score --
    await ctx.runMutation(internal.documents.advanceStatus, {
      id: documentId,
      from: ["segmented"],
      to: "scoring",
    });

    const runId = await ctx.runMutation(internal.scoringRuns.insert, {
      label: `pipeline:${documentId.slice(0, 8)}`,
      modelId: SCORE_STAGE_DEFAULT_MODEL,
      promptVersion: PROMPT_VERSION,
      groundingArm: GROUNDING_ARM,
      isProduction: true,
    });

    let scoredCount = 0;
    let failedCount = 0;

    try {
      for (let i = 0; i < segmented.length; i++) {
        const clause = segmented[i];
        const clauseId = clauseIds[i];

        const provisions = await ctx.runQuery(internal.corpus.listForClauseType, {
          clauseType: clause.suggestedType ?? undefined,
        });

        const result = await scoreClause({
          modelId: SCORE_STAGE_DEFAULT_MODEL,
          clauseText: clause.text,
          clauseLabel: clause.label,
          suggestedType: clause.suggestedType,
          provisions,
          groundingArm: GROUNDING_ARM,
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

        if (result.outcome === "ok") scoredCount++;
        else failedCount++;
      }
    } catch (error) {
      await ctx.runMutation(internal.documents.failStage, {
        id: documentId,
        stage: "score",
        reason: "Scoring could not complete.",
      });
      console.error(`[score] ${documentId} structural failure`, error);
      return;
    }

    const finalStatus = failedCount === 0 ? "complete" : scoredCount > 0 ? "partial" : "failed";
    await ctx.runMutation(internal.documents.advanceStatus, {
      id: documentId,
      from: ["scoring"],
      to: finalStatus,
    });
  },
});

// content hash helper, same as the old lib/pipeline/run.ts -- never stores
// contract text for diagnostics, only its hash.
export function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}
