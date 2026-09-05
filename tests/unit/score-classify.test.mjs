// Unit tests for lib/pipeline/score's error->outcome classification. No
// network, no API key, no database -- these construct real instances of the
// AI SDK's own error classes (not mocks) so the test exercises the actual
// .isInstance() checks classifyError relies on, verified against the
// installed ai@7.0.93 package rather than assumed.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { NoObjectGeneratedError, APICallError, EmptyResponseBodyError } from "ai";
import { classifyError, looksLikeRefusal } from "../../lib/pipeline/score/index.ts";

function fakeNoObjectError({ finishReason, text }) {
  return new NoObjectGeneratedError({
    message: "test",
    text,
    response: { id: "test", timestamp: new Date(), modelId: "test" },
    usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
    finishReason,
  });
}

function fakeApiCallError({ statusCode }) {
  return new APICallError({
    message: "test",
    url: "https://example.test",
    requestBodyValues: {},
    statusCode,
  });
}

describe("classifyError", () => {
  test("content-filter finish reason -> safety_block", () => {
    const err = fakeNoObjectError({ finishReason: "content-filter", text: undefined });
    assert.equal(classifyError(err), "safety_block");
  });

  test("length finish reason -> context_limit", () => {
    const err = fakeNoObjectError({ finishReason: "length", text: undefined });
    assert.equal(classifyError(err), "context_limit");
  });

  test("refusal-shaped text with no definitive finish reason -> refusal", () => {
    const err = fakeNoObjectError({
      finishReason: "stop",
      text: "I cannot provide legal advice on this clause.",
    });
    assert.equal(classifyError(err), "refusal");
  });

  test("genuinely malformed output with no refusal language -> parse_error", () => {
    const err = fakeNoObjectError({ finishReason: "stop", text: "{not valid json" });
    assert.equal(classifyError(err), "parse_error");
  });

  test("429 status code -> rate_limited", () => {
    const err = fakeApiCallError({ statusCode: 429 });
    assert.equal(classifyError(err), "rate_limited");
  });

  test("other API call failures -> timeout (the umbrella for call-level failures)", () => {
    const err = fakeApiCallError({ statusCode: 503 });
    assert.equal(classifyError(err), "timeout");
  });

  test("empty response body -> empty", () => {
    const err = new EmptyResponseBodyError({});
    assert.equal(classifyError(err), "empty");
  });

  test("an unrecognized error is rethrown, never silently bucketed", () => {
    // This is the "no catch-all" requirement: a wrong label here pollutes
    // the Objective 3 ablation data with a miscounted outcome, so an error
    // shape this function doesn't recognize must surface, not disappear.
    class SomeOtherError extends Error {}
    assert.throws(() => classifyError(new SomeOtherError("unexpected")), SomeOtherError);
  });
});

describe("looksLikeRefusal", () => {
  test("recognizes common refusal phrasing", () => {
    assert.ok(looksLikeRefusal("I cannot provide legal advice on this."));
    assert.ok(looksLikeRefusal("Please consult a lawyer for this matter."));
  });

  test("does not flag an ordinary rationale as a refusal", () => {
    assert.ok(!looksLikeRefusal("This clause caps liability at the fees paid, which is standard."));
  });

  test("handles undefined text without throwing", () => {
    assert.equal(looksLikeRefusal(undefined), false);
  });
});
