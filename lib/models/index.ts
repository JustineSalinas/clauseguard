/**
 * Model configuration, keyed by pipeline stage. The entire Objective 3
 * ablation should be a config change here, never a code change in
 * lib/pipeline/score -- if swapping a model touches more than this file,
 * the study will not get run three times under deadline.
 *
 * Model strings are plain "provider/model" gateway ids per Vercel's AI SDK
 * convention (ai@7's `generateObject` accepts these directly as its `model`
 * option), not provider-specific client instances. This keeps the ablation's
 * three models -- Gemini Flash, Gemini Flash-Lite, and Llama 3.3 70B on Groq
 * -- interchangeable at the config layer.
 */

export type ModelId =
  | "google/gemini-2.0-flash"
  | "google/gemini-2.0-flash-lite"
  | "groq/llama-3.3-70b-versatile";

export type ModelDef = {
  id: ModelId;
  label: string;
  /** Which env var must be set for this model's provider to work. Checked at
   *  startup by requireApiKeyFor(), not scattered across call sites. */
  envVar: "GOOGLE_GENERATIVE_AI_API_KEY" | "GROQ_API_KEY";
};

export const MODELS: Record<ModelId, ModelDef> = {
  "google/gemini-2.0-flash": {
    id: "google/gemini-2.0-flash",
    label: "Gemini Flash",
    envVar: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  "google/gemini-2.0-flash-lite": {
    id: "google/gemini-2.0-flash-lite",
    label: "Gemini Flash-Lite",
    envVar: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  "groq/llama-3.3-70b-versatile": {
    id: "groq/llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    envVar: "GROQ_API_KEY",
  },
};

/** The three models Objective 3 ablates across. Order matters only for
 *  display; the harness runs all three regardless of order. */
export const ABLATION_MODELS: readonly ModelId[] = [
  "google/gemini-2.0-flash",
  "google/gemini-2.0-flash-lite",
  "groq/llama-3.3-70b-versatile",
];

/**
 * Production default for the scoring stage: the cheap model first, per the
 * cascade design in PLAN.md section 7. Re-scoring flagged/low-confidence
 * clauses with the stronger model is the caller's job (lib/pipeline/score),
 * not this config's -- this constant names only the first pass.
 */
export const SCORE_STAGE_DEFAULT_MODEL: ModelId = "google/gemini-2.0-flash-lite";

/** The stronger model used for the cascade's second pass. */
export const SCORE_STAGE_CASCADE_MODEL: ModelId = "google/gemini-2.0-flash";

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
