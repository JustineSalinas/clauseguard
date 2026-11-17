// lib/plans.ts's pure decision logic -- no Convex, no database. The Convex
// side (convex/plans.ts) only counts `usedThisMonth` and looks up the plan;
// the actual allow/deny decision lives here so it's testable without a
// deployment.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { checkUploadAllowed, startOfCurrentMonth, PLAN_LIMITS, DEFAULT_PLAN } from "../../lib/plans.ts";

describe("checkUploadAllowed", () => {
  test("starter plan allows uploads under the monthly limit", () => {
    const result = checkUploadAllowed("starter", 2);
    assert.equal(result.allowed, true);
  });

  test("starter plan blocks the upload that would exceed the monthly limit", () => {
    const result = checkUploadAllowed("starter", 3);
    assert.equal(result.allowed, false);
    assert.equal(result.reason, "reviews_per_month");
    assert.equal(result.limit, 3);
    assert.equal(result.used, 3);
  });

  test("professional plan is unlimited regardless of usage", () => {
    assert.equal(checkUploadAllowed("professional", 0).allowed, true);
    assert.equal(checkUploadAllowed("professional", 10_000).allowed, true);
  });

  test("agency plan is unlimited regardless of usage", () => {
    assert.equal(checkUploadAllowed("agency", 10_000).allowed, true);
  });

  test("DEFAULT_PLAN (no subscription row) is unlimited -- the research-preview promise", () => {
    assert.equal(PLAN_LIMITS[DEFAULT_PLAN].reviewsPerMonth, null);
  });
});

describe("startOfCurrentMonth", () => {
  test("returns midnight UTC on the 1st of the month containing the given timestamp", () => {
    const mid = Date.UTC(2026, 10, 18, 15, 30); // Nov 18 2026, 15:30 UTC
    const start = startOfCurrentMonth(mid);
    assert.equal(start, Date.UTC(2026, 10, 1, 0, 0, 0, 0));
  });

  test("a timestamp on the 1st itself still returns that month's start", () => {
    const firstOfMonth = Date.UTC(2026, 2, 1, 23, 59);
    assert.equal(startOfCurrentMonth(firstOfMonth), Date.UTC(2026, 2, 1, 0, 0, 0, 0));
  });
});
