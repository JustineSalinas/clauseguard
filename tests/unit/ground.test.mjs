// Unit tests for the grounding stage. The `static` arm's only external
// dependency is the database read, so these pass a tiny fake implementing
// just the GroundingDb surface rather than a real Supabase client.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { groundClause, RagNotReadyError } from "../../lib/pipeline/ground/index.ts";

/** Builds a fake GroundingDb that returns `rows` for any clause_type, or
 *  a single query-level error if `error` is set. */
function fakeDb({ rows = [], error = null } = {}) {
  return {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                order() {
                  return Promise.resolve({ data: error ? null : rows, error });
                },
              };
            },
          };
        },
      };
    },
  };
}

describe("groundClause", () => {
  test("arm 'none' returns no provisions without touching the db", async () => {
    const db = fakeDb({ rows: [{ rank: 1, provisions: { code: "CIVIL", article: "1308", text: "x" } }] });
    const result = await groundClause({ db, clauseType: "termination.unilateral", arm: "none" });
    assert.deepEqual(result, { arm: "none", provisions: [] });
  });

  test("arm 'rag' throws RagNotReadyError", async () => {
    const db = fakeDb();
    await assert.rejects(
      () => groundClause({ db, clauseType: "force.majeure", arm: "rag" }),
      RagNotReadyError,
    );
  });

  test("arm 'static' with no clause type returns no provisions (NoRelevantProvision)", async () => {
    const db = fakeDb();
    const result = await groundClause({ db, clauseType: null, arm: "static" });
    assert.deepEqual(result, { arm: "static", provisions: [] });
  });

  test("arm 'static' with clause type 'other' returns no provisions", async () => {
    const db = fakeDb();
    const result = await groundClause({ db, clauseType: "other", arm: "static" });
    assert.deepEqual(result, { arm: "static", provisions: [] });
  });

  test("arm 'static' returns provisions ranked by the db query", async () => {
    const db = fakeDb({
      rows: [
        { rank: 1, provisions: { code: "CIVIL", article: "1308", text: "Mutuality of contracts." } },
        { rank: 2, provisions: { code: "CIVIL", article: "1159", text: "Force of law." } },
      ],
    });
    const result = await groundClause({ db, clauseType: "termination.unilateral", arm: "static" });
    assert.equal(result.arm, "static");
    assert.deepEqual(result.provisions, [
      { code: "CIVIL", article: "1308", text: "Mutuality of contracts." },
      { code: "CIVIL", article: "1159", text: "Force of law." },
    ]);
  });

  test("arm 'static' normalizes a provisions relation returned as an array", async () => {
    const db = fakeDb({
      rows: [{ rank: 1, provisions: [{ code: "CIVIL", article: "1174", text: "Fortuitous event." }] }],
    });
    const result = await groundClause({ db, clauseType: "force.majeure", arm: "static" });
    assert.deepEqual(result.provisions, [{ code: "CIVIL", article: "1174", text: "Fortuitous event." }]);
  });

  test("arm 'static' throws on a query error instead of returning an empty result", async () => {
    const db = fakeDb({ error: { message: "connection refused" } });
    await assert.rejects(
      () => groundClause({ db, clauseType: "warranty", arm: "static" }),
      /connection refused/,
    );
  });
});
