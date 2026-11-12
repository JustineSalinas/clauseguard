// computeMarks turns the model's verbatim quoted phrases (score.v2's
// highlighted_phrases) into character offsets the in-situ heat-map view
// marks in place. Never asks the model for raw offsets directly -- models
// are unreliable at counting characters but reliable at copying text, so
// this is a plain string search instead.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeMarks } from "../../lib/types.ts";

describe("computeMarks", () => {
  test("returns an empty array when there are no phrases", () => {
    assert.deepEqual(computeMarks("Some clause text.", undefined), []);
    assert.deepEqual(computeMarks("Some clause text.", []), []);
  });

  test("finds a single verbatim phrase and returns its character offsets", () => {
    const text = "The Client may terminate at will for any reason.";
    const marks = computeMarks(text, ["terminate at will"]);
    assert.deepEqual(marks, [{ start: 15, end: 32 }]);
    assert.equal(text.slice(15, 32), "terminate at will");
  });

  test("finds multiple distinct phrases and returns them in text order", () => {
    const text = "Contractor waives minimum wage and waives overtime pay entirely.";
    const marks = computeMarks(text, ["waives overtime pay", "waives minimum wage"]);
    assert.equal(marks.length, 2);
    assert.ok(marks[0].start < marks[1].start, "marks should be sorted by position in text");
    assert.equal(text.slice(marks[0].start, marks[0].end), "waives minimum wage");
    assert.equal(text.slice(marks[1].start, marks[1].end), "waives overtime pay");
  });

  test("drops a phrase that doesn't match verbatim, rather than guessing a span", () => {
    const text = "The Client may terminate at will.";
    const marks = computeMarks(text, ["terminate whenever they like"]);
    assert.deepEqual(marks, []);
  });

  test("drops phrases shorter than 3 characters -- too short to be a meaningful highlight", () => {
    const text = "A short clause with an it in it.";
    const marks = computeMarks(text, ["it"]);
    assert.deepEqual(marks, []);
  });

  test("merges overlapping or duplicate matches into one range", () => {
    const text = "uncapped indemnity for any and all losses whatsoever";
    const marks = computeMarks(text, ["uncapped indemnity", "indemnity for any and all losses"]);
    assert.equal(marks.length, 1);
    assert.equal(marks[0].start, 0);
    assert.equal(marks[0].end, text.indexOf("losses") + "losses".length);
  });

  test("trims surrounding whitespace on each phrase before searching", () => {
    const text = "This clause is clearly one-sided.";
    const marks = computeMarks(text, ["  clearly one-sided  "]);
    assert.deepEqual(marks, [{ start: 15, end: 32 }]);
  });
});
