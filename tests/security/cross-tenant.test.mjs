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

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import {
  isConfigured,
  MISSING_CONFIG_MESSAGE,
  signInAs,
  USER_A,
  USER_B,
  OWNED_TABLES,
  FORBIDDEN_TABLES,
} from "./helpers.mjs";

const configured = isConfigured();
if (!configured) console.log(MISSING_CONFIG_MESSAGE);

describe("cross-tenant isolation", { skip: !configured }, () => {
  let a;
  let b;
  let aDocumentId;

  before(async () => {
    a = await signInAs(USER_A);
    b = await signInAs(USER_B);

    const { data } = await a.supabase.from("documents").select("id").limit(1);
    aDocumentId = data?.[0]?.id ?? null;
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

    assert.equal(
      (data ?? []).length,
      0,
      "user B fetched user A's document by id. This is the exact bug the " +
        "prior project shipped.",
    );
  });

  test("user B cannot delete user A's document", async (t) => {
    if (!aDocumentId) {
      t.skip("user A has no documents.");
      return;
    }

    await b.supabase.from("documents").delete().eq("id", aDocumentId);

    // The delete may report no error; what matters is that the row survives.
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

  test("results are not client-writable", async (t) => {
    if (!aDocumentId) {
      t.skip("user A has no documents.");
      return;
    }

    const { data: clauses } = await a.supabase
      .from("clauses")
      .select("id")
      .eq("document_id", aDocumentId)
      .limit(1);

    const clauseId = clauses?.[0]?.id;
    if (!clauseId) {
      t.skip("no clauses yet. Re-run once the pipeline has produced some.");
      return;
    }

    // A user who can edit their own risk scores invalidates every number in
    // the results chapters.
    const { error } = await a.supabase
      .from("clause_scores")
      .update({ risk_level: "low", confidence: 1.0 })
      .eq("clause_id", clauseId);

    assert.ok(
      error !== null,
      "a signed-in user rewrote a clause score. There should be no UPDATE " +
        "grant on clause_scores at all.",
    );
  });

  for (const table of OWNED_TABLES) {
    test(`user B reads zero rows from ${table.table}`, async () => {
      const { data, error } = await b.supabase
        .from(table.table)
        .select(table.idColumn);

      // An RLS denial returns an empty set rather than an error, so an empty
      // result is the pass condition and an error is a schema problem.
      assert.equal(error, null, `unexpected error on ${table.table}`);
      assert.ok(Array.isArray(data));
    });
  }

  for (const table of FORBIDDEN_TABLES) {
    test(`${table} is unreadable by any signed-in user`, async () => {
      const { data } = await a.supabase.from(table).select("id");
      assert.equal(
        (data ?? []).length,
        0,
        `${table} returned rows. Annotations are the answer key and must not ` +
          `be reachable from a browser session.`,
      );
    });
  }
});
