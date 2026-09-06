/**
 * Pipeline orchestration: upload -> extract -> segment -> score.
 *
 * A thin persistence wrapper around the pure stage functions, which is what
 * lib/pipeline/segment's header comment anticipated. Everything that decides
 * anything -- how text splits into clauses, how a model's failure is
 * classified -- lives in those pure modules and is unit tested without a
 * database. What lives here is only the part that genuinely needs Supabase:
 * writing rows and advancing status under the state machine's guard.
 *
 * Every stage writes its results and advances the document in the same step,
 * and each transition is guarded on the status it is allowed to move from, so
 * a stage cannot run twice or skip forward.
 *
 * Runs as the service role, because the pipeline writes rows a user is
 * deliberately forbidden to write: risk_level and confidence must never be
 * client-writable or every number in the results chapters is worthless. The
 * document's owner is read from the row, never accepted from a caller.
 */

import "server-only";
import { createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { advance, fail, TRANSITIONS } from "@/lib/pipeline/state";
import {
  extractPdf,
  EncryptedDocumentError,
  NoTextDetectedError,
} from "@/lib/pipeline/extract";
import { segmentClauses } from "@/lib/pipeline/segment";
import { locateClauses } from "@/lib/pipeline/boxes";
import { scoreClause } from "@/lib/pipeline/score";
import { SCORE_STAGE_DEFAULT_MODEL } from "@/lib/models";
import { PROMPT_VERSION } from "@/lib/prompts/score.v1";
import type { GroundingArm } from "@/lib/types";

/** The first pass is ungrounded and single-clause on purpose. Batching (T9)
 *  and the grounding arms (T8/Objective 4) are separate increments; wiring
 *  them in alongside first-light orchestration would make a failure here
 *  ambiguous between three causes. */
const FIRST_PASS_ARM: GroundingArm = "none";

export type RunResult = {
  documentId: string;
  clauseCount: number;
  scoredCount: number;
  failedCount: number;
  suppressedTokenCount: number;
  status: "complete" | "partial" | "segmented" | "failed";
};

/** Content hashes, never clause text: PLAN.md section 3.4 keeps contract
 *  content out of anything stored for diagnostics. */
function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

export async function runPipeline(documentId: string): Promise<RunResult> {
  const db = createServiceClient();

  const { data: doc, error: docError } = await db
    .from("documents")
    .select("id, owner_id, storage_path, status")
    .eq("id", documentId)
    .single();

  if (docError || !doc) {
    throw new Error(`Document ${documentId} not found: ${docError?.message}`);
  }

  // ---------------------------------------------------------- extract ----

  if (!(await advance(db, documentId, [...TRANSITIONS.extract.from], TRANSITIONS.extract.working))) {
    // Another invocation already claimed this document. Not an error.
    return summarize(documentId, doc.status);
  }

  const { data: file, error: downloadError } = await db.storage
    .from("contracts")
    .download(doc.storage_path);

  if (downloadError || !file) {
    await fail(db, documentId, "extract", "The uploaded file could not be read back from storage.");
    return summarize(documentId, "failed");
  }

  let extraction;
  try {
    extraction = await extractPdf(new Uint8Array(await file.arrayBuffer()));
  } catch (error) {
    // Each named failure gets the actionable message PLAN.md's error map
    // specifies. An unrecognised error is not folded in with them -- it is
    // recorded as itself, so it stays visible instead of masquerading as a
    // scanned document.
    if (error instanceof EncryptedDocumentError) {
      await fail(db, documentId, "extract", "This PDF is password protected. Remove the password and upload it again.");
    } else if (error instanceof NoTextDetectedError) {
      await fail(db, documentId, "extract", "No readable text found. This looks like a scan or a photo; ClauseGuard needs a PDF with a text layer.");
    } else {
      await fail(db, documentId, "extract", "This file could not be read.");
      console.error(`[extract] ${documentId} unrecognized failure`, error);
    }
    return summarize(documentId, "failed");
  }

  const { data: extractionRow, error: extractionError } = await db
    .from("extractions")
    .insert({
      document_id: documentId,
      ocr_engine: extraction.engine,
      settings: { grounding_arm: FIRST_PASS_ARM },
      page_sizes: extraction.pageSizes,
      suppressed_token_count: extraction.suppressedTokenCount,
    })
    .select("id")
    .single();

  if (extractionError || !extractionRow) {
    await fail(db, documentId, "extract", "The extraction could not be saved.");
    return summarize(documentId, "failed");
  }

  await db
    .from("documents")
    .update({ page_count: extraction.pageSizes.length })
    .eq("id", documentId);

  await advance(db, documentId, [TRANSITIONS.extract.working], TRANSITIONS.extract.done);

  // A document made entirely of hidden text is a finding, not a fault, so it
  // is logged rather than failed. The count is the reportable number.
  if (extraction.suppressedTokenCount > 0) {
    console.warn(
      `[extract] ${documentId} suppressed ${extraction.suppressedTokenCount} hidden token(s)`,
    );
  }

  // ---------------------------------------------------------- segment ----

  await advance(db, documentId, [...TRANSITIONS.segment.from], TRANSITIONS.segment.working);

  const segmented = segmentClauses(extraction.text);
  const locations = locateClauses(
    segmented.map((c) => c.text),
    extraction.tokens,
  );

  if (segmented.length === 0) {
    // Terminal, not a crash: the UI renders an empty state and offers a
    // re-upload. PLAN.md's failure registry treats zero clauses this way.
    await advance(db, documentId, [TRANSITIONS.segment.working], TRANSITIONS.segment.done);
    return {
      documentId,
      clauseCount: 0,
      scoredCount: 0,
      failedCount: 0,
      suppressedTokenCount: extraction.suppressedTokenCount,
      status: "segmented",
    };
  }

  const { data: clauseRows, error: clauseError } = await db
    .from("clauses")
    .insert(
      segmented.map((clause, i) => ({
        document_id: documentId,
        // Boxes are only valid for the extraction that produced them, so the
        // extraction id travels with every clause. A re-extraction can then
        // never render a stale overlay over a newly rendered page.
        extraction_id: extractionRow.id,
        ordinal: clause.ordinal,
        label: clause.label,
        clause_type: clause.suggestedType,
        text: clause.text,
        page: locations[i]?.page ?? 1,
        char_start: locations[i]?.charStart ?? null,
        char_end: locations[i]?.charEnd ?? null,
        bboxes: locations[i]?.boxes ?? [],
      })),
    )
    .select("id, ordinal, text, clause_type, label");

  if (clauseError || !clauseRows) {
    await fail(db, documentId, "segment", "The clauses could not be saved.");
    return summarize(documentId, "failed");
  }

  await advance(db, documentId, [TRANSITIONS.segment.working], TRANSITIONS.segment.done);

  // ------------------------------------------------------------ score ----

  await advance(db, documentId, [...TRANSITIONS.score.from], TRANSITIONS.score.working);

  // One scoring_runs row per pipeline execution. This is what makes
  // Objectives 3 and 4 queries rather than a second codebase: model_id,
  // prompt_version and grounding_arm are recorded here, so a result can
  // always be attributed to the exact configuration that produced it.
  const { data: run, error: runError } = await db
    .from("scoring_runs")
    .insert({
      label: `pipeline:${documentId.slice(0, 8)}`,
      model_id: SCORE_STAGE_DEFAULT_MODEL,
      prompt_version: PROMPT_VERSION,
      grounding_arm: FIRST_PASS_ARM,
      is_production: true,
    })
    .select("id")
    .single();

  if (runError || !run) {
    await fail(db, documentId, "score", "The scoring run could not be started.");
    return summarize(documentId, "failed");
  }

  let scoredCount = 0;
  let failedCount = 0;

  // scoreClause() classifies every *model* failure into an outcome and does
  // not throw. An exception escaping this loop therefore means something
  // structural went wrong before a call could be made -- a missing provider
  // key is the likely one -- which would otherwise park the document in
  // `scoring` forever, with no sweeper built yet to rescue it. Failing the
  // stage explicitly is what keeps the state machine honest.
  try {
    for (const clause of clauseRows) {
      const result = await scoreClause({
        modelId: SCORE_STAGE_DEFAULT_MODEL,
        clauseText: clause.text,
        clauseLabel: clause.label,
        suggestedType: clause.clause_type,
        provisions: [],
        groundingArm: FIRST_PASS_ARM,
      });

      // Every clause gets a row, including the ones that failed. A clause
      // that could not be scored is a clause at maximum uncertainty and
      // routes to human review -- the same path Objective 2 needs -- and its
      // outcome is an Objective 3 column. Dropping the row would erase both.
      const { error: scoreError } = await db.from("clause_scores").insert({
        clause_id: clause.id,
        run_id: run.id,
        risk_level: result.riskLevel,
        confidence: result.confidence,
        rationale: result.rationale,
        deviation: result.deviation,
        provisions_relied_on: result.provisionsReliedOn,
        injection_suspected: result.injectionSuspected,
        outcome: result.outcome,
        tokens_in: result.tokensIn,
        tokens_out: result.tokensOut,
        latency_ms: result.latencyMs,
      });

      if (scoreError) {
        console.error(`[score] clause ${clause.id} row rejected: ${scoreError.message}`);
      }

      if (result.outcome === "ok") {
        scoredCount++;
      } else {
        failedCount++;
        // Clause id and a content hash, never the clause text itself.
        console.warn(
          `[score] ${documentId} clause=${clause.id} hash=${hash(clause.text)} outcome=${result.outcome}`,
        );
      }
    }
  } catch (error) {
    await fail(
      db,
      documentId,
      "score",
      "The clauses couldn't be checked. The review service isn't configured.",
    );
    console.error(`[score] ${documentId} stage aborted`, error);
    return summarize(documentId, "failed");
  }

  // `partial` is a first-class state, not an error: the reader sees the
  // clauses that scored and the ones that did not, rather than nothing.
  //
  // Note that every clause failing still lands on `partial` rather than
  // failed(score). The clauses exist and are worth showing, each marked as
  // unanalysed -- that is the human-review path Objective 2 needs, and it is
  // more use than a banner that hides them. failed(score) is reserved for the
  // stage not running at all, which is handled in the catch above.
  const finalStatus = failedCount === 0 && scoredCount > 0 ? "complete" : "partial";

  await advance(db, documentId, [TRANSITIONS.score.working], finalStatus);

  return {
    documentId,
    clauseCount: clauseRows.length,
    scoredCount,
    failedCount,
    suppressedTokenCount: extraction.suppressedTokenCount,
    status: finalStatus,
  };
}

function summarize(documentId: string, status: string): RunResult {
  return {
    documentId,
    clauseCount: 0,
    scoredCount: 0,
    failedCount: 0,
    suppressedTokenCount: 0,
    status: status as RunResult["status"],
  };
}
