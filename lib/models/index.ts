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
 *
 * UPDATED 2026-11-18: production scoring/OCR moved off Gemini onto Claude
 * (Haiku 5.5 / Sonnet 5.5) -- SCORE_STAGE_DEFAULT_MODEL,
 * SCORE_STAGE_CASCADE_MODEL and OCR_MODEL below, by explicit instruction.
 * ABLATION_MODELS is deliberately UNCHANGED: Objective 3's three-model
 * comparison (Gemini Flash / Flash-Lite / the Groq-hosted model) is one of
 * the five committed objectives in the approved proposal -- per CLAUDE.md,
 * changing which models it ablates needs adviser sign-off, which this
 * change doesn't have. Gemini stays wired up and working for that reason,
 * not because it was left behind by accident.
 */

import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

export type ModelId =
  | "google/gemini-3.5-flash"
  | "google/gemini-3.5-flash-lite"
  | "groq/gpt-oss-120b"
  | "anthropic/claude-haiku-5-5"
  | "anthropic/claude-sonnet-5-5";

export type ModelDef = {
  id: ModelId;
  label: string;
  /** Which env var must be set for this model's provider to work. Checked at
   *  startup by requireApiKeyFor(), not scattered across call sites. */
  envVar: "GOOGLE_GENERATIVE_AI_API_KEY" | "GROQ_API_KEY" | "ANTHROPIC_API_KEY";
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
  "anthropic/claude-haiku-5-5": {
    id: "anthropic/claude-haiku-5-5",
    label: "Claude Haiku 5.5",
    envVar: "ANTHROPIC_API_KEY",
  },
  "anthropic/claude-sonnet-5-5": {
    id: "anthropic/claude-sonnet-5-5",
    label: "Claude Sonnet 5.5",
    envVar: "ANTHROPIC_API_KEY",
  },
};

/** The three models Objective 3 ablates across -- frozen, see the 2026-11-18
 *  note above. Order matters only for display; the harness runs all three
 *  regardless of order. */
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
export const SCORE_STAGE_DEFAULT_MODEL: ModelId = "anthropic/claude-haiku-5-5";

/** The stronger model used for the cascade's second pass. */
export const SCORE_STAGE_CASCADE_MODEL: ModelId = "anthropic/claude-sonnet-5-5";

/**
 * Vision OCR fallback for a photographed or otherwise image-only upload --
 * never for a normal PDF, which always goes through the text-layer path in
 * lib/pipeline/extract instead.
 *
 * Stays on Gemini, not Claude, on purpose: the upload flow explicitly
 * accepts HEIC/HEIF photos (lib/pipeline/extract/ocr.ts's
 * SUPPORTED_IMAGE_TYPES), and Claude's vision input only accepts
 * image/jpeg, image/png, image/gif and image/webp -- a HEIC/HEIF photo
 * would 400 on every call. Converting HEIC to JPEG before this call would
 * fix that, but that's a real pipeline change, not a model-config swap;
 * flagging it rather than silently breaking iPhone photo uploads.
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
    case "anthropic/claude-haiku-5-5":
      return anthropic("claude-haiku-5-5") as unknown as LanguageModel;
    case "anthropic/claude-sonnet-5-5":
      return anthropic("claude-sonnet-5-5") as unknown as LanguageModel;
    default:
      return anthropic("claude-haiku-5-5") as unknown as LanguageModel;
  }
}
