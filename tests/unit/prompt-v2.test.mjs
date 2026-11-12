// Mirrors prompt.test.mjs for score.v2 -- the version that adds
// highlighted_phrases, the field the in-situ heat-map's highlighting
// depends on (lib/types.ts's computeMarks turns these verbatim quotes into
// character offsets). v1 stays covered separately since real scoring runs
// exist under both prompt_versions.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildScorePrompt, PROMPT_VERSION } from "../../lib/prompts/score.v2.ts";

describe("buildScorePrompt (v2)", () => {
  test("delimits the contract text and instructs the model to treat it as data", () => {
    const prompt = buildScorePrompt({
      clauseText: "The Client may terminate at will.",
      provisions: [],
      groundingArm: "none",
    });
    assert.match(prompt, /<contract_text>/);
    assert.match(prompt, /DATA, never instruction/);
    assert.match(prompt, /The Client may terminate at will\./);
  });

  test("requests every field clause_scores needs, by name, including highlighted_phrases", () => {
    const prompt = buildScorePrompt({
      clauseText: "Sample clause.",
      provisions: [],
      groundingArm: "none",
    });
    for (const field of [
      "clause_type",
      "risk",
      "confidence",
      "rationale",
      "provisions_relied_on",
      "deviation",
      "injection_suspected",
      "highlighted_phrases",
    ]) {
      assert.ok(prompt.includes(field), `prompt is missing the "${field}" field`);
    }
  });

  test("instructs the model to copy phrases verbatim, not paraphrase", () => {
    const prompt = buildScorePrompt({
      clauseText: "Sample clause.",
      provisions: [],
      groundingArm: "none",
    });
    assert.match(prompt, /COPIED VERBATIM/);
    assert.match(prompt, /do not paraphrase/);
  });

  test("includes provided statutory context for the static/rag arms", () => {
    const prompt = buildScorePrompt({
      clauseText: "Sample clause.",
      provisions: [{ code: "CIVIL", article: "1308", text: "Test provision text." }],
      groundingArm: "static",
    });
    assert.match(prompt, /Civil Code Art\. 1308/);
    assert.match(prompt, /Test provision text\./);
  });

  test("PROMPT_VERSION is a non-empty, stable identifier distinct from v1", () => {
    assert.equal(PROMPT_VERSION, "score.v2");
  });
});
