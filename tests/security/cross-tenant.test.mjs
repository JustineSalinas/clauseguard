// Cross-tenant isolation.
//
// The highest severity failure available to this product. A prior project by
// this team shipped exactly this bug: the rules layer only checked that a user
// was authenticated, so any signed-in user could reach any tenant's data.
// ClauseGuard holds other people's contracts.
//
// Run:  npm run test:security
//
// These tests are meant to FAIL LOUDLY if RLS is wrong. A passing run is a
// Chapter 3 claim; a failing run is a stop-everything bug.
//
// Every assertion here is about STATE, never about whether a call returned an
// error. Supabase denies a read with an empty result and denies a write by
// matching zero rows, and neither raises. See assertDenied in helpers.mjs.

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import {
  isConfigured,
  MISSING_CONFIG_MESSAGE,
  signInAs,
  anonymousClient,
  assertDenied,
  USER_A,
  USER_B,
  OWNED_TABLES,
  FORBIDDEN_TABLES,
  NO_WRITE_TABLES,
} from "./helpers.mjs";

const configured = isConfigured();
if (!configured) console.log(MISSING_CONFIG_MESSAGE);

describe("cross-tenant isolation", { skip: !configured }, () => {
  let a;
  let b;
  let aDocumentId;
  let aClauseId;

  before(async () => {
    a = await signInAs(USER_A);
    b = await signInAs(USER_B);

    const { data } = await a.supabase.from("documents").select("id").limit(1);
    aDocumentId = data?.[0]?.id ?? null;

    if (aDocumentId) {
      const { data: clauses } = await a.supabase
        .from("clauses")
        .select("id")
        .eq("document_id", aDocumentId)
        .limit(1);
      aClauseId = clauses?.[0]?.id ?? null;
    }
  });

  test("user A can read their own documents", async () => {
    const { data, error } = await a.supabase.from("documents").select("id");
    assert.equal(error, null, "user A should be able to read their own rows");
    assert.ok(Array.isArray(data));
  });

  test("user B sees none of user A's documents", async () => {
    const { data, error } = await b.supabase
      .from("documents")
      .select("id, owner_id");

    assert.equal(error, null);
    const leaked = (data ?? []).filter((row) => row.owner_id === a.userId);
    assert.equal(
      leaked.length,
      0,
      `user B can read ${leaked.length} of user A's documents. RLS is not holding.`,
    );
  });

  test("user B cannot read user A's document by guessing its id", async (t) => {
    if (!aDocumentId) {
      t.skip("user A has no documents. Upload one, then re-run.");
      return;
    }

    const { data } = await b.supabase
      .from("documents")
      .select("id")
      .eq("id", aDocumentId);

    assertDenied(
      data ?? [],
      "user B fetched user A's document by id. This is the exact bug the prior project shipped",
    );
  });

  test("user B cannot delete user A's document", async (t) => {
    if (!aDocumentId) {
      t.skip("user A has no documents.");
      return;
    }

    await b.supabase.from("documents").delete().eq("id", aDocumentId);

    // The delete reports no error either way; what matters is that the row
    // survives.
    const { data } = await a.supabase
      .from("documents")
      .select("id")
      .eq("id", aDocumentId);

    assert.equal(
      (data ?? []).length,
      1,
      "user B deleted user A's document. Check the delete policy.",
    );
  });

  test("nobody can reassign a document to themselves", async (t) => {
    if (!aDocumentId) {
      t.skip("user A has no documents.");
      return;
    }

    await b.supabase
      .from("documents")
      .update({ owner_id: b.userId })
      .eq("id", aDocumentId);

    const { data } = await a.supabase
      .from("documents")
      .select("id, owner_id")
      .eq("id", aDocumentId);

    assert.equal(
      data?.[0]?.owner_id,
      a.userId,
      "ownership was reassigned. An UPDATE policy needs WITH CHECK as well " +
        "as USING, or it should not exist at all.",
    );
  });

  test("a user cannot rewrite their own risk scores", async (t) => {
    if (!aClauseId) {
      t.skip("no clauses yet. Re-run once the pipeline has produced some.");
      return;
    }

    const { data: before } = await a.supabase
      .from("clause_scores")
      .select("id, risk_level, confidence")
      .eq("clause_id", aClauseId)
      .limit(1);

    const original = before?.[0];
    if (!original) {
      t.skip("clause has no score yet.");
      return;
    }

    // Deliberately NOT asserting that this errors. There is no UPDATE policy
    // on clause_scores, so RLS matches zero rows and Postgres raises nothing:
    // an error-based assertion here fails on a database that is behaving
    // correctly. The question is whether the value moved.
    await a.supabase
      .from("clause_scores")
      .update({ risk_level: "low", confidence: 1.0 })
      .eq("id", original.id);

    const { data: after } = await a.supabase
      .from("clause_scores")
      .select("id, risk_level, confidence")
      .eq("id", original.id);

    assert.equal(
      after?.[0]?.risk_level,
      original.risk_level,
      "a signed-in user rewrote their own risk level. Every number in the " +
        "results chapters depends on this being impossible.",
    );
    assert.equal(after?.[0]?.confidence, original.confidence, "confidence was rewritten.");
  });

  // The real cross-tenant enumeration. Asking only "did the call error?"
  // would pass while user B read every one of user A's clauses, because a
  // successful read of somebody else's rows is not an error -- it is the bug.
  for (const { table, select, ownerOf } of OWNED_TABLES) {
    test(`user B sees no rows belonging to user A in ${table}`, async () => {
      const { data, error } = await b.supabase.from(table).select(select);

      assert.equal(error, null, `unexpected error on ${table}: ${error?.message}`);
      const leaked = (data ?? []).filter((row) => ownerOf(row) === a.userId);
      assert.equal(
        leaked.length,
        0,
        `user B read ${leaked.length} of user A's ${table} rows.`,
      );
    });
  }

  for (const table of FORBIDDEN_TABLES) {
    test(`${table} is unreadable by any signed-in user`, async () => {
      const { data } = await a.supabase.from(table).select("id");
      assertDenied(
        data ?? [],
        `${table} returned rows. Annotations are the answer key and must not ` +
          `be reachable from a browser session`,
      );
    });
  }

  for (const table of NO_WRITE_TABLES) {
    test(`${table} rejects an insert from a signed-in user`, async () => {
      // INSERT is the one denial Postgres *does* raise on, because a row
      // failing a WITH CHECK is an error rather than a no-op. An insert that
      // succeeds here means a policy was added without one.
      const { error } = await a.supabase.from(table).insert({});
      assert.notEqual(
        error,
        null,
        `a signed-in user inserted into ${table}. Pipeline tables must be ` +
          `service-role only.`,
      );
    });
  }
});

describe("anonymous access", { skip: !configured }, () => {
  // Every policy is scoped TO authenticated, and `anon` holds the same
  // table-level grants as `authenticated`. RLS is the only thing between a
  // signed-out visitor and the whole table.
  const tables = ["documents", "extractions", "clauses", "clause_scores", "ground_truth_labels"];

  for (const table of tables) {
    test(`a signed-out visitor reads nothing from ${table}`, async () => {
      const { data } = await anonymousClient().from(table).select("id");
      assertDenied(data ?? [], `${table} is readable without signing in`);
    });
  }
});
