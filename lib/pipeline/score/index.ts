/**
 * The scoring stage. Calls a model, validates its output against
 * ScoreResponseSchema, and classifies the result into exactly one
 * ScoreOutcome. No catch-all: an error shape this function does not
 * recognize is rethrown rather than folded into a bucket, because a wrong
 * label here silently pollutes the Objective 3 ablation data with a
 * miscounted outcome -- see PLAN.md's error map for why that specific
 * failure mode matters more here than in most code.
 *
 * Single-clause only for now. PLAN.md's batching design (5-10 clauses per
 * call) is the next increment on top of this, not built yet -- batching
 * changes the response schema to an array and introduces a real bug surface
 * (matching output array positions back to input clauses) that deserves its
 * own attention rather than being rushed in alongside outcome classification.
 */

import {
  generateObject,
  NoObjectGeneratedError,
  APICallError,
  EmptyResponseBodyError,
  NoContentGeneratedError,
} from "ai";
import { ScoreResponseSchema, buildScorePrompt, PROMPT_VERSION, type StatutoryProvision } from "@/lib/prompts/score.v1";
import { requireApiKeyFor, type ModelId } from "@/lib/models";
import type { ClauseTypeId } from "@/lib/pipeline/taxonomy";
import type { GroundingArm, RiskLevel, ScoreOutcome } from "@/lib/types";

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
      model: input.modelId,
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
      tokensIn: null,
      tokensOut: null,
      latencyMs: Date.now() - started,
    };
  }
}

export { classifyError, looksLikeRefusal };
