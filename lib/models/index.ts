/**
 * Model configuration, keyed by pipeline stage. The entire Objective 3
 * ablation should be a config change here, never a code change in
 * lib/pipeline/score -- if swapping a model touches more than this file,
 * the study will not get run three times under deadline.
 *
 * Model strings are plain "provider/model" gateway ids per Vercel's AI SDK
 * convention (ai@7's `generateObject` accepts these directly as its `model`
 * option), not provider-specific client instances. This keeps the ablation's
 * three models -- Gemini Flash, Gemini Flash-Lite, and a Groq-hosted open
 * model -- interchangeable at the config layer.
 *
 * UPDATED 2026-11-05: the original ablation trio (gemini-2.0-flash,
 * gemini-2.0-flash-lite, llama-3.3-70b-versatile on Groq) all stopped
 * working -- verified against the live APIs, not assumed:
 *   - Both gemini-2.0-* models now 404 ("no longer available").
 *   - Groq has removed every Meta Llama chat model from its catalog
 *     entirely (checked /v1/models -- not renamed, just gone). Objective
 *     3's "Llama 3.3 70B on Groq" leg literally cannot be reproduced on
 *     Groq any more.
 * Replacements below were each confirmed with a real API call before being
 * set here, not picked from a deprecation notice alone:
 *   - gemini-2.0-flash-lite -> gemini-3.5-flash-lite (confirmed)
 *   - gemini-2.0-flash -> gemini-3.8-flash is Google's suggested successor
 *     and a real listed model, but returned "high demand" capacity errors
 *     on every attempt during verification. gemini-3.5-flash (same
 *     generation as the flash-lite replacement, so the pair stays
 *     internally consistent) was used instead and confirmed working.
 *   - llama-3.3-70b-versatile -> openai/gpt-oss-120b on Groq (confirmed).
 *     Not a Llama model -- note this substitution in the Objective 3
 *     methodology writeup, since it changes what the ablation's third leg
 *     actually is, not just its version number.
 */

import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

export type ModelId =
  | "google/gemini-3.5-flash"
  | "google/gemini-3.5-flash-lite"
  | "groq/gpt-oss-120b";

export type ModelDef = {
  id: ModelId;
  label: string;
  /** Which env var must be set for this model's provider to work. Checked at
   *  startup by requireApiKeyFor(), not scattered across call sites. */
  envVar: "GOOGLE_GENERATIVE_AI_API_KEY" | "GROQ_API_KEY";
};

export const MODELS: Record<ModelId, ModelDef> = {
  "google/gemini-3.5-flash": {
    id: "google/gemini-3.5-flash",
    label: "Gemini Flash",
    envVar: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  "google/gemini-3.5-flash-lite": {
    id: "google/gemini-3.5-flash-lite",
    label: "Gemini Flash-Lite",
    envVar: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  "groq/gpt-oss-120b": {
    id: "groq/gpt-oss-120b",
    label: "GPT-OSS 120B (Groq)",
    envVar: "GROQ_API_KEY",
  },
};

/** The three models Objective 3 ablates across. Order matters only for
 *  display; the harness runs all three regardless of order. */
export const ABLATION_MODELS: readonly ModelId[] = [
  "google/gemini-3.5-flash",
  "google/gemini-3.5-flash-lite",
  "groq/gpt-oss-120b",
];

/**
 * Production default for the scoring stage: the cheap model first, per the
 * cascade design in PLAN.md section 7. Re-scoring flagged/low-confidence
 * clauses with the stronger model is the caller's job (lib/pipeline/score),
 * not this config's -- this constant names only the first pass.
 */
export const SCORE_STAGE_DEFAULT_MODEL: ModelId = "google/gemini-3.5-flash-lite";

/** The stronger model used for the cascade's second pass. */
export const SCORE_STAGE_CASCADE_MODEL: ModelId = "google/gemini-3.5-flash";

/**
 * Vision OCR fallback for a photographed or otherwise image-only upload --
 * never for a normal PDF, which always goes through the text-layer path in
 * lib/pipeline/extract instead.
 */
export const OCR_MODEL: ModelId = "google/gemini-3.5-flash";

export function requireApiKeyFor(modelId: ModelId): string {
  const { envVar, label } = MODELS[modelId];
  const key = process.env[envVar];
  if (!key) {
    throw new Error(
      `${envVar} is not set. ${label} needs it -- add it to .env.local (see .env.example).`,
    );
  }
  return key;
}

export function resolveLanguageModel(modelId: ModelId): LanguageModel {
  requireApiKeyFor(modelId);
  switch (modelId) {
    case "google/gemini-3.5-flash":
      return google("gemini-3.5-flash") as unknown as LanguageModel;
    case "google/gemini-3.5-flash-lite":
      return google("gemini-3.5-flash-lite") as unknown as LanguageModel;
    case "groq/gpt-oss-120b":
      return groq("openai/gpt-oss-120b") as unknown as LanguageModel;
    default:
      return google("gemini-3.5-flash-lite") as unknown as LanguageModel;
  }
}
