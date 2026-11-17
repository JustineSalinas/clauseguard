// matchBatchResults is the function that carries the actual risk batching
// introduced -- lib/pipeline/score's own header and score.v3.ts's header
// both call it out by name: "matching output array positions back to input
// clauses." This tests it directly against constructed response shapes
// (dropped clause, duplicate index, out-of-order, reordered array) rather
// than only exercising it indirectly through a live or mocked network call.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { matchBatchResults } from "../../lib/pipeline/score/index.ts";

function makeItem(overrides = {}) {
  return {
    modelId: "google/gemini-3.5-flash-lite",
    clauseText: "Sample clause text.",
    provisions: [],
    groundingArm: "none",
    ...overrides,
  };
}

function makeResult(index, overrides = {}) {
  return {
    clause_index: index,
    clause_type: "termination.unilateral",
    risk: "high",
    confidence: 0.9,
    rationale: "Test rationale.",
    provisions_relied_on: [],
    deviation: "Test deviation.",
    injection_suspected: false,
    highlighted_phrases: [],
    ...overrides,
  };
}

describe("matchBatchResults", () => {
  test("matches each result to its clause by clause_index, not array position", () => {
    const items = [makeItem({ clauseText: "Clause A" }), makeItem({ clauseText: "Clause B" })];
    // Results arrive in REVERSED order relative to the items array -- if
    // this were position-matched instead of index-matched, clause A would
    // wrongly get clause B's verdict and vice versa.
    const results = [makeResult(1, { risk: "low" }), makeResult(0, { risk: "high" })];

    const out = matchBatchResults(items, results, {}, 100);

    assert.equal(out.length, 2);
    assert.equal(out[0].riskLevel, "high", "clause 0 (Clause A) must get the result tagged clause_index 0");
    assert.equal(out[1].riskLevel, "low", "clause 1 (Clause B) must get the result tagged clause_index 1");
  });

  test("always returns exactly items.length results, regardless of what the model returned", () => {
    const items = [makeItem(), makeItem(), makeItem()];
    const results = [makeResult(0)]; // model only scored 1 of 3
    const out = matchBatchResults(items, results, {}, 100);
    assert.equal(out.length, 3, "caller contract: one result per input clause, always");
  });

  test("a clause the model dropped gets parse_error, not a crash or a silent gap", () => {
    const items = [makeItem(), makeItem(), makeItem()];
    const results = [makeResult(0), makeResult(2)]; // index 1 missing
    const out = matchBatchResults(items, results, {}, 100);

    assert.equal(out[0].outcome, "ok");
    assert.equal(out[1].outcome, "parse_error", "the dropped clause must be its own distinct failure, not silently absent");
    assert.equal(out[1].riskLevel, null);
    assert.equal(out[2].outcome, "ok");
  });

  test("other clauses in the batch are unaffected when one is dropped", () => {
    const items = [makeItem({ clauseText: "A" }), makeItem({ clauseText: "B" }), makeItem({ clauseText: "C" })];
    const results = [makeResult(0, { risk: "high" }), makeResult(2, { risk: "low" })];
    const out = matchBatchResults(items, results, {}, 100);
    assert.equal(out[0].riskLevel, "high");
    assert.equal(out[2].riskLevel, "low");
  });

  test("a duplicate clause_index keeps the last occurrence rather than crashing", () => {
    const items = [makeItem()];
    const results = [makeResult(0, { risk: "low" }), makeResult(0, { risk: "high" })];
    const out = matchBatchResults(items, results, {}, 100);
    assert.equal(out.length, 1);
    assert.equal(out[0].riskLevel, "high", "last occurrence wins, deterministically");
  });

  test("an out-of-range clause_index from the model is simply ignored, not matched to anything", () => {
    const items = [makeItem()];
    const results = [makeResult(0), makeResult(99)]; // index 99 doesn't correspond to any input clause
    const out = matchBatchResults(items, results, {}, 100);
    assert.equal(out.length, 1);
    assert.equal(out[0].outcome, "ok");
  });

  test("splits token usage evenly across matched clauses, not per the full batch size", () => {
    const items = [makeItem(), makeItem(), makeItem(), makeItem()];
    const results = [makeResult(0), makeResult(1)]; // only 2 of 4 matched
    const out = matchBatchResults(items, results, { inputTokens: 200, outputTokens: 100 }, 100);
    assert.equal(out[0].tokensIn, 100, "200 tokens / 2 matched clauses, not / 4 total clauses");
    assert.equal(out[0].tokensOut, 50);
    assert.equal(out[2].tokensIn, null, "the unmatched (dropped) clause gets no token estimate");
  });

  test("every result carries promptVersion score.v3 and the batch's shared modelId/groundingArm", () => {
    const items = [makeItem({ modelId: "groq/gpt-oss-120b", groundingArm: "rag" })];
    const out = matchBatchResults(items, [makeResult(0)], {}, 100);
    assert.equal(out[0].promptVersion, "score.v3");
    assert.equal(out[0].modelId, "groq/gpt-oss-120b");
    assert.equal(out[0].groundingArm, "rag");
  });

  test("passes through highlighted_phrases and all other fields for a matched clause", () => {
    const items = [makeItem()];
    const results = [
      makeResult(0, {
        highlighted_phrases: ["shall not be liable"],
        provisions_relied_on: ["CIVIL 1308"],
        injection_suspected: true,
      }),
    ];
    const out = matchBatchResults(items, results, {}, 100);
    assert.deepEqual(out[0].highlightedPhrases, ["shall not be liable"]);
    assert.deepEqual(out[0].provisionsReliedOn, ["CIVIL 1308"]);
    assert.equal(out[0].injectionSuspected, true);
  });
});
