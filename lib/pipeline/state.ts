/**
 * The document state machine.
 *
 *     uploaded -> extracting -> extracted -> segmenting -> segmented
 *                     |                          |
 *                     v                          v
 *                 failed(extract)            failed(segment)
 *
 *     segmented -> scoring -> complete
 *                     |
 *                     +-> partial        some clauses scored, some failed
 *                     +-> failed(score)
 *
 * The guard is the point of this module. Every transition states the set of
 * statuses it is allowed to move *from*, and that check happens inside the
 * UPDATE's WHERE clause rather than as a read-then-write in application code.
 * A read-then-write has a race: two stage invocations both read `segmented`,
 * both decide they may proceed, and the document gets scored twice --
 * double the model spend, and duplicate clause_scores rows that quietly skew
 * an ablation average. Postgres settles it instead: whichever UPDATE lands
 * first changes the row, and the second matches nothing.
 *
 * So "zero rows updated" is not an error here. It means another worker got
 * there first, and the correct response is to stop, not to retry or throw.
 */

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentStatus } from "@/lib/types";

/** Which stage a failure belongs to. Written to documents.failed_stage so a
 *  failure is attributable without parsing a message. */
export type PipelineStage = "extract" | "segment" | "score";

/** True when this process now owns the transition, false when someone else
 *  already made it. Deliberately not a thrown error: losing the race is the
 *  guard working, not a fault. */
export type Advanced = boolean;

/**
 * Moves a document from any of `from` to `to`, atomically.
 *
 * `stage_started_at` is stamped on every transition. T11's stalled-stage
 * sweeper reads exactly that column to find jobs that entered a stage and
 * never left it, so it has to be written here rather than by each caller --
 * a stage that forgets to stamp it is a stage the sweeper cannot rescue.
 */
export async function advance(
  db: SupabaseClient,
  documentId: string,
  from: DocumentStatus[],
  to: DocumentStatus,
): Promise<Advanced> {
  const { data, error } = await db
    .from("documents")
    .update({
      status: to,
      stage_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .in("status", from)
    .select("id");

  // A real error (constraint, connectivity) is not the same as losing the
  // race, and must not be swallowed into a quiet `false`.
  if (error) {
    throw new Error(
      `Could not advance document ${documentId} to ${to}: ${error.message}`,
    );
  }

  return (data ?? []).length > 0;
}

/**
 * Marks a document failed within a stage.
 *
 * Unguarded on purpose: a failure has to be recordable from whatever status
 * the document is currently in, including one this module did not put it in.
 * A guard here could leave a document stuck in `scoring` forever because the
 * failure path was itself refused.
 *
 * `reason` is shown to the user, so it says what to do about it. It must
 * never carry clause text or a provider payload -- PLAN.md section 3.4 keeps
 * contract content out of stored diagnostics.
 */
export async function fail(
  db: SupabaseClient,
  documentId: string,
  stage: PipelineStage,
  reason: string,
): Promise<void> {
  const { error } = await db
    .from("documents")
    .update({
      status: "failed" satisfies DocumentStatus,
      failed_stage: stage,
      failed_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId);

  if (error) {
    throw new Error(
      `Could not mark document ${documentId} failed(${stage}): ${error.message}`,
    );
  }
}

/**
 * The legal predecessors of each stage's working status. Exported so the
 * orchestrator names a transition once instead of repeating status literals,
 * and so a test can assert the shape of the machine without a database.
 */
export const TRANSITIONS = {
  extract: { from: ["uploaded"], working: "extracting", done: "extracted" },
  segment: { from: ["extracted"], working: "segmenting", done: "segmented" },
  score: { from: ["segmented"], working: "scoring", done: "complete" },
} as const satisfies Record<
  PipelineStage,
  { from: readonly DocumentStatus[]; working: DocumentStatus; done: DocumentStatus }
>;
