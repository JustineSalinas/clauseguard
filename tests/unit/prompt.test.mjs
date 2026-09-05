// Confirms the built prompt actually contains the two things it exists to
// guarantee: the injection defense (document text is data, never
// instruction) and the exact response fields clause_scores expects. A prompt
// edit that silently drops either of these would be much easier to miss by
// eye than to catch here.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildScorePrompt, PROMPT_VERSION } from "../../lib/prompts/score.v1.ts";

describe("buildScorePrompt", () => {
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

  test("requests every field clause_scores needs, by name", () => {
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
    ]) {
      assert.ok(prompt.includes(field), `prompt is missing the "${field}" field`);
    }
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

  test("the ungrounded arm states plainly that no context was given", () => {
    const prompt = buildScorePrompt({
      clauseText: "Sample clause.",
      provisions: [],
      groundingArm: "none",
    });
    assert.match(prompt, /No statutory context provided/);
  });

  test("PROMPT_VERSION is a non-empty, stable identifier", () => {
    assert.equal(PROMPT_VERSION, "score.v1");
  });
});
