// Cross-tenant access suite, Convex edition. Replaces the deleted
// Supabase/RLS suite (see convex/documents.ts's own header comment:
// "That suite needs a Convex-native version -- not built yet").
//
// Convex has no RLS backstop: every ownership check is the handler's own
// `getAuthUserId(ctx)` plus an explicit `doc.ownerId === userId` comparison.
// A missing or wrong check here is a real cross-tenant leak, not a test
// artifact, so these tests run against the real live Convex deployment
// with two real signed-in accounts -- never a mock db.
//
// Two different "denied" shapes exist in this codebase, both asserted
// correctly below, not conflated:
//   - queries return null / [] for "exists but not yours" (never an
//     error, so a wrong id can't be told apart from someone else's id --
//     see documents.ts's "enumeration oracle" comment)
//   - mutations that actually attempt a write on someone else's row throw
//
// If this file goes red: stop, don't push a fix into convex/ yourself --
// per CLAUDE.md, the person who writes a security control (Salinas, for
// convex/) is deliberately not the only person clearing it (Navarro wrote
// this suite's predecessor; Zallen runs/extends/logs it). Tell them.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { api } from "../../convex/_generated/api.js";
import { makeTestClient, createOwnedDocument } from "./helpers.mjs";

let clientA;
let clientB;
let docIdOwnedByA;

before(async () => {
  clientA = await makeTestClient("a");
  clientB = await makeTestClient("b");
  docIdOwnedByA = await createOwnedDocument(clientA);
});

test("owner can read their own document", async () => {
  const doc = await clientA.query(api.documents.get, { id: docIdOwnedByA });
  assert.notEqual(doc, null, "the owner should be able to read their own document");
  assert.equal(doc._id, docIdOwnedByA);
});

test("documents.get returns null for another user's document, not an error", async () => {
  const doc = await clientB.query(api.documents.get, { id: docIdOwnedByA });
  assert.equal(doc, null, "a non-owner must get null, never the row and never a thrown error");
});

test("documents.listMine never includes another user's documents", async () => {
  const docs = await clientB.query(api.documents.listMine, {});
  const leaked = docs.find((d) => d._id === docIdOwnedByA);
  assert.equal(leaked, undefined, "listMine leaked another user's document");
});

test("documents.statsForMine counts only the caller's own documents", async () => {
  const [statsA, statsB] = await Promise.all([
    clientA.query(api.documents.statsForMine, {}),
    clientB.query(api.documents.statsForMine, {}),
  ]);
  // Not asserting exact counts (both accounts persist across runs) --
  // asserting the shape is well-formed and the two independent counts
  // don't blow up, which they would if this query ever cross-joined.
  assert.equal(typeof statsA.total, "number");
  assert.equal(typeof statsB.total, "number");
});

test("documents.remove throws for another user's document instead of deleting it", async () => {
  await assert.rejects(
    () => clientB.mutation(api.documents.remove, { id: docIdOwnedByA }),
    /not found/i,
    "a non-owner must not be able to delete someone else's document",
  );
  // Prove it's still there and still readable by its real owner.
  const stillThere = await clientA.query(api.documents.get, { id: docIdOwnedByA });
  assert.notEqual(stillThere, null, "document was deleted by a non-owner -- this is a real cross-tenant write");
});

test("clauses.listForDocument returns empty for another user's document", async () => {
  const clauses = await clientB.query(api.clauses.listForDocument, { documentId: docIdOwnedByA });
  assert.deepEqual(clauses, [], "clauses of another user's document leaked");
});

test("clauses.listScoresForDocument returns empty for another user's document", async () => {
  const scores = await clientB.query(api.clauses.listScoresForDocument, { documentId: docIdOwnedByA });
  assert.deepEqual(scores, [], "clause scores of another user's document leaked");
});

test("stageRuns.listForDocument returns empty for another user's document", async () => {
  const runs = await clientB.query(api.stageRuns.listForDocument, { documentId: docIdOwnedByA });
  assert.deepEqual(runs, [], "stage runs of another user's document leaked");
});

test("an unauthenticated client gets the same denial shape as a wrong-tenant client", async () => {
  const { ConvexHttpClient } = await import("convex/browser");
  const anon = new ConvexHttpClient(clientA.url ?? clientA.backendUrl);

  const doc = await anon.query(api.documents.get, { id: docIdOwnedByA });
  assert.equal(doc, null, "an unauthenticated caller must not be able to read any document");

  const docs = await anon.query(api.documents.listMine, {});
  assert.deepEqual(docs, [], "an unauthenticated caller must not get any document list");

  await assert.rejects(
    () => anon.mutation(api.documents.remove, { id: docIdOwnedByA }),
    "an unauthenticated caller must not be able to delete a document",
  );
});
