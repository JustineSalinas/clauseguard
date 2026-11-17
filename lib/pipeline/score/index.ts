/**
 * The scoring stage. Calls a model, validates its output against
 * ScoreResponseSchema, and classifies the result into exactly one
 * ScoreOutcome. No catch-all: an error shape this function does not
 * recognize is rethrown rather than folded into a bucket, because a wrong
 * label here silently pollutes the Objective 3 ablation data with a
 * miscounted outcome -- see PLAN.md's error map for why that specific
 * failure mode matters more here than in most code.
 *
 * Two entry points: scoreClause (score.v2, one clause per call -- kept, not
 * removed, same reason score.v1 stayed frozen) and scoreClauseBatch
 * (score.v3, up to SCORE_BATCH_SIZE clauses per call -- PLAN.md's batching
 * design, built as its own increment with index-matched results rather than
 * array-position matching; see score.v3.ts's header for why).
 */

import {
  generateObject,
  NoObjectGeneratedError,
  APICallError,
  EmptyResponseBodyError,
  NoContentGeneratedError,
  RetryError,
} from "ai";
import { ScoreResponseSchema, buildScorePrompt, PROMPT_VERSION, type StatutoryProvision } from "@/lib/prompts/score.v2";
import {
  BatchScoreResponseSchema,
  buildBatchScorePrompt,
  PROMPT_VERSION as PROMPT_VERSION_V3,
  SCORE_BATCH_SIZE,
  type ScoreItem,
} from "@/lib/prompts/score.v3";
import { requireApiKeyFor, resolveLanguageModel, type ModelId } from "@/lib/models";
import type { ClauseTypeId } from "@/lib/pipeline/taxonomy";
import type { GroundingArm, RiskLevel, ScoreOutcome } from "@/lib/types";

export { SCORE_BATCH_SIZE };

export type ScoreClauseInput = {
  modelId: ModelId;
  clauseText: string;
  clauseLabel?: string | null;
  suggestedType?: ClauseTypeId | null;
  provisions: StatutoryProvision[];
  groundingArm: GroundingArm;
};

export type ScoreClauseResult = {
  outcome: ScoreOutcome;
  modelId: ModelId;
  promptVersion: string;
  groundingArm: GroundingArm;
  riskLevel: RiskLevel | null;
  confidence: number | null;
  rationale: string | null;
  deviation: string | null;
  provisionsReliedOn: string[];
  injectionSuspected: boolean;
  highlightedPhrases: string[];
  tokensIn: number | null;
  tokensOut: number | null;
  latencyMs: number;
};

/** Phrases a refusal tends to contain when a model declines to score a
 *  clause rather than failing to produce valid JSON. Checked only when the
 *  raw text is available (NoObjectGeneratedError carries it) and finishReason
 *  did not already give a definitive answer -- this is a fallback heuristic,
 *  not the primary signal. */
const REFUSAL_PATTERNS = [
  /\bcannot (provide|give) legal advice\b/i,
  /\bi'?m not able to\b/i,
  /\bi (can|will) not\b.*\b(assist|help|advise)\b/i,
  /\bconsult (a|an|with a) (lawyer|attorney)\b/i,
];

function looksLikeRefusal(text: string | undefined): boolean {
  if (!text) return false;
  return REFUSAL_PATTERNS.some((p) => p.test(text));
}

/**
 * Maps a thrown error to exactly one ScoreOutcome, or rethrows. Grounded in
 * the AI SDK's actual error classes and FinishReason values (verified against
 * the installed ai@7.0.93 package, not assumed) rather than string-matching
 * provider-specific messages.
 */
function classifyError(error: unknown): ScoreOutcome {
  if (RetryError.isInstance(error)) {
    // The AI SDK's own retry wrapper, thrown when its internal exponential
    // backoff exhausts every attempt (reason "maxRetriesExceeded") or hits a
    // non-retryable error on the first try (reason "errorNotRetryable").
    // Found live against a real free-tier 503 ("high demand") on Gemini --
    // generateObject retried internally, gave up, and threw this instead of
    // the underlying APICallError, which the checks below never matched,
    // so it fell through to the final rethrow and took the whole batch call
    // down structurally instead of being counted as rate_limited/timeout
    // the way a single unwrapped 503 already is. error.lastError is the
    // real underlying failure (almost always APICallError); classify that
    // instead of the wrapper. This is recognizing a known, common error
    // shape and inspecting its real payload, not a catch-all -- an error
    // this still doesn't recognize after unwrapping still rethrows below.
    return classifyError(error.lastError);
  }

  if (NoObjectGeneratedError.isInstance(error)) {
    if (error.finishReason === "content-filter") return "safety_block";
    if (error.finishReason === "length") return "context_limit";
    if (looksLikeRefusal(error.text)) return "refusal";
    return "parse_error";
  }

  if (APICallError.isInstance(error)) {
    if (error.statusCode === 429) return "rate_limited";
    // Any other API-level failure (5xx, network-adjacent) is bucketed as a
    // timeout for ablation purposes: what matters for Objective 3 is "the
    // call did not complete," not the specific transport reason.
    return "timeout";
  }

  if (EmptyResponseBodyError.isInstance(error) || NoContentGeneratedError.isInstance(error)) {
    return "empty";
  }

  throw error;
}

export async function scoreClause(input: ScoreClauseInput): Promise<ScoreClauseResult> {
  requireApiKeyFor(input.modelId);

  const prompt = buildScorePrompt({
    clauseText: input.clauseText,
    clauseLabel: input.clauseLabel,
    suggestedType: input.suggestedType,
    provisions: input.provisions,
    groundingArm: input.groundingArm,
  });

  const started = Date.now();

  try {
    const { object, usage } = await generateObject({
      model: resolveLanguageModel(input.modelId),
      schema: ScoreResponseSchema,
      prompt,
    });

    return {
      outcome: "ok",
      modelId: input.modelId,
      promptVersion: PROMPT_VERSION,
      groundingArm: input.groundingArm,
      riskLevel: object.risk,
      confidence: object.confidence,
      rationale: object.rationale,
      deviation: object.deviation,
      provisionsReliedOn: object.provisions_relied_on,
      injectionSuspected: object.injection_suspected,
      highlightedPhrases: object.highlighted_phrases,
      tokensIn: usage.inputTokens ?? null,
      tokensOut: usage.outputTokens ?? null,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    const outcome = classifyError(error);
    return {
      outcome,
      modelId: input.modelId,
      promptVersion: PROMPT_VERSION,
      groundingArm: input.groundingArm,
      riskLevel: null,
      confidence: null,
      rationale: null,
      deviation: null,
      provisionsReliedOn: [],
      injectionSuspected: false,
      highlightedPhrases: [],
      tokensIn: null,
      tokensOut: null,
      latencyMs: Date.now() - started,
    };
  }
}

function emptyResult(outcome: ScoreOutcome, modelId: ModelId, groundingArm: GroundingArm, latencyMs: number): ScoreClauseResult {
  return {
    outcome,
    modelId,
    promptVersion: PROMPT_VERSION_V3,
    groundingArm,
    riskLevel: null,
    confidence: null,
    rationale: null,
    deviation: null,
    provisionsReliedOn: [],
    injectionSuspected: false,
    highlightedPhrases: [],
    tokensIn: null,
    tokensOut: null,
    latencyMs,
  };
}

/**
 * Matches a batch API call's parsed response back to the clauses that were
 * sent, by clause_index -- never by array position. Pure: no network, no
 * Date.now() of its own (latencyMs is measured by the caller, who knows
 * when the call actually started and ended). This is the function that
 * carries the real risk batching introduces (PLAN.md, lib/pipeline/score's
 * own header), isolated on purpose so it can be unit tested directly
 * against a constructed response shape rather than only through a live or
 * mocked network call.
 *
 * Always returns exactly `items.length` results, in the same order as
 * `items` -- a caller sees "one result per input clause," the same contract
 * calling scoreClause once per item would have given, regardless of what
 * the model's results array actually contained.
 */
export function matchBatchResults(
  items: ScoreClauseInput[],
  results: ScoreItem[],
  usage: { inputTokens?: number; outputTokens?: number },
  latencyMs: number,
): ScoreClauseResult[] {
  const { modelId, groundingArm } = items[0];

  const byIndex = new Map<number, ScoreItem>();
  for (const r of results) {
    if (byIndex.has(r.clause_index)) {
      console.warn(`[score] batch returned clause_index ${r.clause_index} more than once -- keeping the last one`);
    }
    byIndex.set(r.clause_index, r);
  }

  // generateObject reports token usage for the whole call, never per item --
  // there is no way to know which clause actually cost what. Splitting the
  // total evenly across clauses that got a matched result is an estimate,
  // not a measurement; a caller that needs the distinction can tell
  // batched-estimate apart from scoreClause's real per-call figure by the
  // promptVersion on the row (score.v3 batches, score.v2 never does).
  const matchedCount = items.filter((_, i) => byIndex.has(i)).length;
  const tokensInEach = matchedCount > 0 && usage.inputTokens ? Math.round(usage.inputTokens / matchedCount) : null;
  const tokensOutEach = matchedCount > 0 && usage.outputTokens ? Math.round(usage.outputTokens / matchedCount) : null;

  return items.map((_, index) => {
    const r = byIndex.get(index);
    if (!r) {
      // Dropped by the model -- a real failure mode batching introduces
      // that single-clause scoring never had. parse_error is accurate (no
      // parseable result exists for this clause) and avoids adding a new
      // ScoreOutcome value, which would ripple into the frozen
      // SCORE_OUTCOME union in convex/schema.ts for one narrow case.
      console.error(`[score] batch dropped clause_index ${index} of ${items.length} -- model returned ${results.length} result(s)`);
      return emptyResult("parse_error", modelId, groundingArm, latencyMs);
    }
    return {
      outcome: "ok",
      modelId,
      promptVersion: PROMPT_VERSION_V3,
      groundingArm,
      riskLevel: r.risk,
      confidence: r.confidence,
      rationale: r.rationale,
      deviation: r.deviation,
      provisionsReliedOn: r.provisions_relied_on,
      injectionSuspected: r.injection_suspected,
      highlightedPhrases: r.highlighted_phrases,
      tokensIn: tokensInEach,
      tokensOut: tokensOutEach,
      latencyMs,
    };
  });
}

/**
 * Scores up to SCORE_BATCH_SIZE clauses in one call -- the I/O shell around
 * matchBatchResults above. `items` must share one modelId and groundingArm
 * (true of every call site: a single pipeline run always uses one model and
 * one grounding arm for all its clauses) -- taken from the first item
 * rather than threaded through as a separate parameter, so there is exactly
 * one place this invariant could silently drift rather than two parameters
 * a caller could mismatch.
 */
export async function scoreClauseBatch(items: ScoreClauseInput[]): Promise<ScoreClauseResult[]> {
  if (items.length === 0) return [];

  const { modelId, groundingArm } = items[0];
  requireApiKeyFor(modelId);

  const prompt = buildBatchScorePrompt({
    clauses: items.map((it, index) => ({
      index,
      clauseText: it.clauseText,
      clauseLabel: it.clauseLabel,
      suggestedType: it.suggestedType,
      provisions: it.provisions,
    })),
    groundingArm,
  });

  const started = Date.now();

  try {
    const { object, usage } = await generateObject({
      model: resolveLanguageModel(modelId),
      schema: BatchScoreResponseSchema,
      prompt,
    });
    return matchBatchResults(items, object.results, usage, Date.now() - started);
  } catch (error) {
    // A call-level failure (rate limit, safety block, malformed response)
    // has no partial result to salvage -- every clause in this batch gets
    // the same classified outcome, same as scoreClause's own catch path,
    // just applied batch-wide instead of clause-wide.
    const outcome = classifyError(error);
    const latencyMs = Date.now() - started;
    return items.map(() => emptyResult(outcome, modelId, groundingArm, latencyMs));
  }
}

export { classifyError, looksLikeRefusal };
