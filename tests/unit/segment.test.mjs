// Unit tests for clause segmentation. Pure functions, no network, no
// database -- these run today regardless of Supabase's status.
//
// Written against the compiled output so this runs with plain `node --test`
// like tests/security does, with no extra build step. Run `npm run build`
// (or `npx tsc`) first if you've edited lib/pipeline/segment since the last
// build -- see the README in this folder for the exact command once one
// exists.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { segmentClauses, suggestClauseType } from "../../lib/pipeline/segment/index.ts";

// The exact clause text already shipped in lib/fixtures/sample-review.ts and
// the landing page hero -- reusing real fixtures instead of inventing new
// text means a segmentation bug here would also show up as a UI bug someone
// has already looked at.
const FREELANCE_CONTRACT = `
14.1 This Agreement commences on the Effective Date and continues until the Final Deliverable is accepted in writing by the Client.

14.2 The Client may terminate this Agreement at any time, for any reason or no reason, effective immediately upon written notice. The Designer may not terminate this Agreement prior to Final Deliverable acceptance, and shall forfeit all accrued but unpaid fees upon any such attempted termination.

14.3 Upon termination, the Designer shall promptly deliver all work product then in progress, whether or not complete.
`;

describe("segmentClauses", () => {
  test("splits a numbered contract into one clause per number", () => {
    const clauses = segmentClauses(FREELANCE_CONTRACT);
    assert.equal(clauses.length, 3);
    assert.deepEqual(
      clauses.map((c) => c.label),
      ["14.1", "14.2", "14.3"],
    );
  });

  test("preserves clause text without the leading number", () => {
    const clauses = segmentClauses(FREELANCE_CONTRACT);
    assert.match(clauses[1].text, /^The Client may terminate/);
    assert.doesNotMatch(clauses[1].text, /^14\.2/);
  });

  test("assigns sequential ordinals starting at 1", () => {
    const clauses = segmentClauses(FREELANCE_CONTRACT);
    assert.deepEqual(clauses.map((c) => c.ordinal), [1, 2, 3]);
  });

  test("falls back to paragraph splitting when nothing is numbered", () => {
    const text = "First paragraph, no numbering at all.\n\nSecond paragraph, still nothing.";
    const clauses = segmentClauses(text);
    assert.equal(clauses.length, 2);
    assert.equal(clauses[0].label, null);
    assert.equal(clauses[1].label, null);
  });

  test("drops preamble text before the first numbered clause", () => {
    const text = "FREELANCE DESIGN AGREEMENT\n\nBetween Client and Designer.\n\n1.1 The term begins today.";
    const clauses = segmentClauses(text);
    assert.equal(clauses.length, 1);
    assert.equal(clauses[0].label, "1.1");
  });

  test("does not treat a mid-sentence decimal as a clause number", () => {
    // "5.2 percent" mid-paragraph should not be read as starting a new
    // clause -- CLAUSE_NUMBER only matches at the start of a line.
    const text = "9.1 The fee is five dollars, not 5.2 percent of anything, and continues on this line.";
    const clauses = segmentClauses(text);
    assert.equal(clauses.length, 1);
    assert.equal(clauses[0].label, "9.1");
    assert.match(clauses[0].text, /5\.2 percent/);
  });

  test("handles an empty document without throwing", () => {
    assert.deepEqual(segmentClauses(""), []);
  });
});

describe("suggestClauseType", () => {
  test("recognizes unilateral termination language", () => {
    assert.equal(
      suggestClauseType("The Client may terminate this Agreement at any time, for any reason or no reason."),
      "termination.unilateral",
    );
  });

  test("recognizes uncapped indemnity language", () => {
    assert.equal(
      suggestClauseType("The Designer shall indemnify and hold harmless the Client against any and all claims."),
      "indemnity.uncapped",
    );
  });

  test("recognizes broad IP assignment language", () => {
    assert.equal(
      suggestClauseType("All work product, whether or not incorporated into the Final Deliverable, shall vest in the Client upon creation."),
      "ip.assignment.broad",
    );
  });

  test("returns null when nothing matches, rather than guessing", () => {
    assert.equal(suggestClauseType("The parties shall meet quarterly for a status update."), null);
  });
});
