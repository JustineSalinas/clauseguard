/**
 * Optional LLM clause segmenter (Muse Spark via the Meta Model API). A second
 * implementation of the same contract as segmentClauses() in ./index.ts:
 * extracted text in, SegmentedClause[] out. Everything downstream (boxes,
 * clauses.insertMany, scoring) is unchanged.
 *
 * Same shape as lib/pipeline/score: a PURE half that is unit tested without a
 * network (buildClausesFromRanges) and a thin I/O shell around it
 * (segmentClausesLlm).
 *
 * The model returns line ranges, never text. Clause text is rebuilt here from
 * the original lines and normalised exactly as segmentClauses() does, so it is
 * verbatim by construction and lib/pipeline/boxes.ts can still locate it. Any
 * failure -- missing key, API error, refusal, malformed or implausible ranges,
 * oversized document -- returns null, and the caller falls back to the
 * rule-based segmenter. This stage must never be the reason a document fails.
 *
 * Pure of Convex/Next imports: convex/pipeline.ts imports this directly.
 */

import { generateObject } from "ai";
import {
  META_PROVIDER_NAME,
  SEGMENT_STAGE_MODEL,
  requireApiKeyFor,
  resolveLanguageModel,
  type ModelId,
} from "@/lib/models";
import {
  SEGMENT_PROMPT_VERSION,
  SegmentResponseSchema,
  buildSegmentPrompt,
  type SegmentItem,
} from "@/lib/prompts/segment.v1";
import { CLAUSE_TAXONOMY, type ClauseTypeId } from "@/lib/pipeline/taxonomy";
import { CLAUSE_NUMBER, suggestClauseType, type SegmentedClause } from "./index";

/** Above this the LLM path is skipped and rules are used. v1 keeps it simple;
 *  chunking long documents is a later change. */
export const MAX_LLM_SEGMENT_CHARS = 60_000;

/** A hung preview API must not hold the pipeline action open. */
export const SEGMENT_TIMEOUT_MS = 60_000;

/** Clauses must account for at least this share of the non-empty lines.
 *  Title, preamble and signature blocks are legitimately skipped, but a result
 *  that skips most of the document is a bad result. */
const MIN_LINE_COVERAGE = 0.5;
/** Plausibility bounds, only applied once a document is long enough for them
 *  to mean something. */
const GIANT_CLAUSE_MIN_LINES = 15;
const EVERY_LINE_MIN_LINES = 6;
const EVERY_LINE_RATIO = 0.9;

const MAX_LABEL_LENGTH = 40;

const TAXONOMY_IDS = new Set<string>(CLAUSE_TAXONOMY.map((t) => t.id));

function isTaxonomyId(value: string | null): value is ClauseTypeId {
  return value !== null && TAXONOMY_IDS.has(value);
}

/** The lines the model sees and the ranges index into: trimmed, empty lines
 *  dropped. Joining and whitespace-collapsing these gives the same normalised
 *  clause text segmentClauses() produces. */
export function toNumberedLines(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Validates the model's ranges against the lines and builds clauses from them.
 * Returns null when the output cannot be trusted; never throws, never repairs.
 * Repairing (clamping, re-sorting) would hide exactly the failures the rule
 * fallback exists to catch.
 */
export function buildClausesFromRanges(
  lines: string[],
  items: SegmentItem[],
): SegmentedClause[] | null {
  if (lines.length === 0 || items.length === 0) return null;

  const clauses: SegmentedClause[] = [];
  let lastEnd = 0; // 1-based line number of the last line already used
  let covered = 0;

  for (const item of items) {
    const start = item.start_line;
    const end = item.end_line;

    if (!Number.isInteger(start) || !Number.isInteger(end)) return null;
    if (start < 1 || end > lines.length || start > end) return null;
    if (start <= lastEnd) return null; // out of order or overlapping
    lastEnd = end;
    covered += end - start + 1;

    const slice = lines.slice(start - 1, end);

    // Same number-stripping as segmentClauses(). A printed number wins over
    // the model's label so both segmenters label the same clause the same way;
    // the model's label is only used for non-numeric ones like "(a)".
    let label: string | null = null;
    const numbered = slice[0].match(CLAUSE_NUMBER);
    if (numbered) {
      label = numbered[1];
      slice[0] = slice[0].slice(numbered[0].length);
    } else if (item.label) {
      const trimmed = item.label.trim();
      if (trimmed.length > 0 && trimmed.length <= MAX_LABEL_LENGTH) label = trimmed;
    }

    const text = slice.join(" ").replace(/\s+/g, " ").trim();
    if (text.length === 0) return null;

    clauses.push({
      ordinal: clauses.length + 1,
      label,
      text,
      suggestedType: isTaxonomyId(item.clause_type) ? item.clause_type : suggestClauseType(text),
    });
  }

  if (covered / lines.length < MIN_LINE_COVERAGE) return null;
  if (lines.length >= GIANT_CLAUSE_MIN_LINES && clauses.length === 1) return null;
  if (lines.length >= EVERY_LINE_MIN_LINES && clauses.length > lines.length * EVERY_LINE_RATIO) {
    return null;
  }

  return clauses;
}

export type LlmSegmentResult = {
  clauses: SegmentedClause[];
  modelId: ModelId;
  promptVersion: string;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs: number;
};

/**
 * Segments with the LLM. Returns null on any failure so the caller can fall
 * back to segmentClauses(); the reason is logged, not thrown.
 */
export async function segmentClausesLlm(text: string): Promise<LlmSegmentResult | null> {
  const lines = toNumberedLines(text);
  if (lines.length === 0) return null;

  if (text.length > MAX_LLM_SEGMENT_CHARS) {
    console.warn(
      `[segment] ${text.length} chars exceeds the LLM segmenter cap (${MAX_LLM_SEGMENT_CHARS}); using rules`,
    );
    return null;
  }

  const started = Date.now();
  try {
    requireApiKeyFor(SEGMENT_STAGE_MODEL);

    const { object, usage } = await generateObject({
      model: resolveLanguageModel(SEGMENT_STAGE_MODEL),
      schema: SegmentResponseSchema,
      prompt: buildSegmentPrompt({ lines }),
      // Segmentation is mechanical; reasoning tokens bill as output, so keep
      // the effort low. The provider-name key is how @ai-sdk/openai-compatible
      // routes this to the request's reasoning_effort.
      providerOptions: { [META_PROVIDER_NAME]: { reasoningEffort: "low" } },
      abortSignal: AbortSignal.timeout(SEGMENT_TIMEOUT_MS),
    });

    const clauses = buildClausesFromRanges(lines, object.clauses);
    if (!clauses) {
      console.warn(
        `[segment] LLM returned ${object.clauses.length} range(s) that failed validation; using rules`,
      );
      return null;
    }

    return {
      clauses,
      modelId: SEGMENT_STAGE_MODEL,
      promptVersion: SEGMENT_PROMPT_VERSION,
      tokensIn: usage.inputTokens,
      tokensOut: usage.outputTokens,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    console.warn("[segment] LLM segmenter failed; using rules:", error);
    return null;
  }
}
