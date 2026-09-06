// Storage isolation.
//
// PLAN.md T5 says the enumeration must cover "every read and mutation path
// against B's ids ... storage included," and section 3.2 calls contract files
// the most sensitive asset in the system. Nothing tested that until now.
//
// The bucket is private, so the whole boundary is the storage.objects policy
// set: four policies keyed on the first path segment of the object name being
// the caller's auth.uid(). Objects live at {owner_id}/{document_id}/{filename},
// which is what makes that check meaningful.
//
// Note the one deliberate UPDATE policy in the project lives here
// (contracts_update_own, needed for upsert). It carries both USING and WITH
// CHECK. AUDIT-CHECKLIST section 1 says "no table has an UPDATE policy for
// authenticated" -- this is the reviewed exception to that line.

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import {
  isConfigured,
  MISSING_CONFIG_MESSAGE,
  signInAs,
  anonymousClient,
  USER_A,
  USER_B,
} from "./helpers.mjs";

const configured = isConfigured();
if (!configured) console.log(MISSING_CONFIG_MESSAGE);

const BUCKET = "contracts";

describe("storage isolation", { skip: !configured }, () => {
  let a;
  let b;
  let aObjectPath;

  before(async () => {
    a = await signInAs(USER_A);
    b = await signInAs(USER_B);

    const { data } = await a.supabase
      .from("documents")
      .select("storage_path")
      .limit(1);
    aObjectPath = data?.[0]?.storage_path ?? null;
  });

  test("user A can list their own folder", async () => {
    const { data, error } = await a.supabase.storage.from(BUCKET).list(a.userId);
    assert.equal(error, null, `user A should be able to list their own prefix: ${error?.message}`);
    assert.ok(Array.isArray(data));
  });

  test("user B cannot list user A's folder", async () => {
    const { data } = await b.supabase.storage.from(BUCKET).list(a.userId);
    assert.equal(
      (data ?? []).length,
      0,
      "user B enumerated user A's contracts. The first path segment is the " +
        "ownership check and it is not holding.",
    );
  });

  test("user B cannot download user A's contract", async (t) => {
    if (!aObjectPath) {
      t.skip("user A has no uploaded document. Upload one, then re-run.");
      return;
    }

    const { data, error } = await b.supabase.storage.from(BUCKET).download(aObjectPath);
    assert.ok(
      error !== null || data === null,
      "user B downloaded user A's contract file. This is a total compromise " +
        "of the most sensitive asset in the system.",
    );
  });

  test("user B cannot overwrite user A's contract", async (t) => {
    if (!aObjectPath) {
      t.skip("user A has no uploaded document.");
      return;
    }

    // contracts_update_own is the project's only UPDATE policy. If its WITH
    // CHECK were missing, this is what would slip through.
    const { error } = await b.supabase.storage
      .from(BUCKET)
      .update(aObjectPath, new Blob(["overwritten"]), { upsert: true });

    assert.notEqual(
      error,
      null,
      "user B overwrote user A's contract. Check contracts_update_own carries " +
        "both USING and WITH CHECK.",
    );
  });

  test("user B cannot write into user A's folder", async () => {
    const { error } = await b.supabase.storage
      .from(BUCKET)
      .upload(`${a.userId}/planted/evidence.pdf`, new Blob(["planted"]));

    assert.notEqual(
      error,
      null,
      "user B planted a file in user A's folder. The insert policy is not " +
        "checking the path prefix.",
    );
  });

  test("user B cannot delete user A's contract", async (t) => {
    if (!aObjectPath) {
      t.skip("user A has no uploaded document.");
      return;
    }

    await b.supabase.storage.from(BUCKET).remove([aObjectPath]);

    // remove() reports success for paths it could not see, so the only
    // trustworthy check is whether A can still fetch the object.
    const { data, error } = await a.supabase.storage.from(BUCKET).download(aObjectPath);
    assert.ok(
      data !== null && error === null,
      "user B deleted user A's contract file.",
    );
  });

  test("a signed-out visitor cannot read the bucket", async () => {
    const anon = anonymousClient();
    const { data } = await anon.storage.from(BUCKET).list("");
    assert.equal(
      (data ?? []).length,
      0,
      "the contracts bucket is readable without signing in. It must be private.",
    );
  });

  test("a signed URL stops working after it expires", async (t) => {
    if (!aObjectPath) {
      t.skip("user A has no uploaded document.");
      return;
    }

    // A signed URL is a capability: anyone holding it can fetch the object
    // regardless of who they are, which is exactly why the expiry has to be
    // short. This asserts the expiry is honoured at all.
    const { data, error } = await a.supabase.storage
      .from(BUCKET)
      .createSignedUrl(aObjectPath, 1);

    assert.equal(error, null, `could not sign a URL: ${error?.message}`);
    assert.ok(data?.signedUrl);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const response = await fetch(data.signedUrl);
    assert.ok(
      !response.ok,
      "an expired signed URL still served the file. Treat a leaked URL as an " +
        "incident and check the bucket's URL signing configuration.",
    );
  });
});
