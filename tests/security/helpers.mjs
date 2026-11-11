// Real-backend security test helpers, Convex edition. The old Supabase
// suite signed in with two real, pre-provisioned accounts (RLS requires a
// real session to exercise policies at all -- a mock client can't fail the
// way a misconfigured policy fails). Convex's auth model needs the same
// discipline: these helpers sign in two real accounts against the live
// dev deployment and hand back authenticated clients, so every test in
// this suite is a real network round-trip through real `getAuthUserId()`
// checks, never a mock.
//
// Unlike the old suite, the accounts don't need to be manually
// provisioned in advance: Convex Auth's password `signUp` flow is
// idempotent enough here that we just sign up once and sign in on every
// later run (signUp on an existing email throws, so we fall back to
// signIn). No TEST_USER_*_EMAIL/PASSWORD env vars needed.
//
// OWNED_TABLES: every table that holds one user's private data and must
// never surface another user's rows. When a table is added to the schema
// that holds user-owned data, add it here, and add its read path to
// cross-tenant.test.mjs. (provisions/provisionMappings are deliberately
// excluded -- they're the shared public corpus, not user data.
// groundTruthLabels is deliberately excluded too but for the opposite
// reason: it must have *zero* public query/mutation surface at all,
// which no-public-surface.test.mjs checks structurally instead.)
export const OWNED_TABLES = [
  "documents",
  "extractions",
  "clauses",
  "clauseScores",
  "stageRuns",
  "clauseRetrievals",
];

import { readFileSync } from "node:fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api.js";

const EMAIL_A = "clauseguard-sectest-a@example.com";
const EMAIL_B = "clauseguard-sectest-b@example.com";
const PASSWORD = "SecTest-ClauseGuard-2026!";

function readConvexUrl() {
  const envText = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
  const match = envText.match(/^NEXT_PUBLIC_CONVEX_URL=(.*)$/m);
  if (!match || !match[1].trim()) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL not found in .env.local -- tests/security needs a live Convex deployment to test against, not a mock.",
    );
  }
  return match[1].trim();
}

async function signInOrSignUp(client, email, password) {
  try {
    return await client.action(api.auth.signIn, {
      provider: "password",
      params: { email, password, flow: "signUp" },
    });
  } catch {
    // Already exists from a previous run of this suite -- sign in instead.
    return await client.action(api.auth.signIn, {
      provider: "password",
      params: { email, password, flow: "signIn" },
    });
  }
}

export async function makeTestClient(which) {
  const client = new ConvexHttpClient(readConvexUrl());
  const email = which === "a" ? EMAIL_A : EMAIL_B;
  const result = await signInOrSignUp(client, email, PASSWORD);
  const token = result?.tokens?.token;
  if (!token) {
    throw new Error(
      `Sign-in for test account "${which}" did not return a token -- cannot run as an authenticated session.`,
    );
  }
  client.setAuth(token);
  return client;
}

// Creates one real document owned by `client`'s signed-in user, via the
// actual upload path the browser uses (generateUploadUrl -> PUT -> create),
// not a direct db.insert -- so this suite also exercises the real
// ownership-assignment path, not just the read-side checks.
export async function createOwnedDocument(client) {
  const uploadUrl = await client.mutation(api.upload.generateUploadUrl, {});
  const bytes = new TextEncoder().encode("%PDF-1.4 security-test-fixture");
  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: bytes,
  });
  if (!uploadResponse.ok) {
    throw new Error(`Test fixture upload failed: ${uploadResponse.status}`);
  }
  const { storageId } = await uploadResponse.json();
  return await client.mutation(api.documents.create, {
    filename: "security-test-fixture.pdf",
    storageId,
  });
}
