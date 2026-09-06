// Shared setup for the security suite.
//
// Plain JavaScript on purpose. These tests talk to Supabase over HTTP and need
// no types, so they run with `node --test` and no build step.

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const USER_A = {
  email: process.env.TEST_USER_A_EMAIL,
  password: process.env.TEST_USER_A_PASSWORD,
};

export const USER_B = {
  email: process.env.TEST_USER_B_EMAIL,
  password: process.env.TEST_USER_B_PASSWORD,
};

/** True when everything the suite needs is present. */
export function isConfigured() {
  return Boolean(
    URL && KEY && USER_A.email && USER_A.password && USER_B.email && USER_B.password,
  );
}

export const MISSING_CONFIG_MESSAGE = `
The security suite needs two real test accounts.

Add these to .env.local, then re-run:

  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
  TEST_USER_A_EMAIL=...
  TEST_USER_A_PASSWORD=...
  TEST_USER_B_EMAIL=...
  TEST_USER_B_PASSWORD=...

Both accounts must be verified. User A needs at least one uploaded document,
because the whole point is checking that user B cannot reach it.
`;

/** A client signed in as one user. Anonymous key only, never the secret key:
 *  the secret key bypasses RLS, so a test using it proves nothing. */
export async function signInAs(user) {
  const supabase = createClient(URL, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });

  if (error) {
    throw new Error(
      `Could not sign in as ${user.email}: ${error.message}. ` +
        `Check the account exists and its email is verified.`,
    );
  }

  return { supabase, userId: data.user.id };
}

/** A client that has not signed in at all. Every policy in the schema is
 *  scoped TO authenticated, and `anon` holds the same table-level grants as
 *  `authenticated`, so RLS is the only thing standing between a signed-out
 *  visitor and the data. That deserves its own assertions. */
export function anonymousClient() {
  return createClient(URL, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Tables holding user data, and how to walk from a row back to its owner.
 *
 * `ownerPath` is the PostgREST embed that reaches documents.owner_id from
 * this table, which is what lets a test ask the real question -- "can B see
 * a row belonging to A?" -- rather than the much weaker "did the call
 * error?". Add a row here whenever a table is added to the schema.
 */
export const OWNED_TABLES = [
  { table: "documents", select: "id, owner_id", ownerOf: (row) => row.owner_id },
  {
    table: "extractions",
    select: "id, documents!inner(owner_id)",
    ownerOf: (row) => row.documents?.owner_id,
  },
  {
    table: "clauses",
    select: "id, documents!inner(owner_id)",
    ownerOf: (row) => row.documents?.owner_id,
  },
  {
    table: "clause_scores",
    select: "id, clauses!inner(documents!inner(owner_id))",
    ownerOf: (row) => row.clauses?.documents?.owner_id,
  },
];

/** Tables no signed-in user should read at all. */
export const FORBIDDEN_TABLES = ["ground_truth_labels"];

/**
 * Tables every authenticated user may read in full, by design.
 *
 * Listed explicitly so that a table absent from all three lists is visibly an
 * oversight rather than an unstated decision. scoring_runs carries no user
 * data and the results view needs the model and prompt version behind a
 * score; provisions and provision_mappings are published law.
 */
export const PUBLIC_READ_TABLES = ["scoring_runs", "provisions", "provision_mappings"];

/**
 * Every table, and whether a signed-in user may write to it.
 *
 * Nothing in this schema grants UPDATE to `authenticated`. That is stronger
 * than guarding a permissive policy with a trigger, because there is no
 * permissive policy to guard -- but it is only true for as long as nobody
 * adds one, which is what these assertions are for.
 */
export const NO_WRITE_TABLES = [
  "clauses",
  "clause_scores",
  "extractions",
  "scoring_runs",
  "provisions",
  "provision_mappings",
  "ground_truth_labels",
];

/**
 * How an RLS denial actually looks, which is the thing this suite most easily
 * gets wrong.
 *
 * A blocked SELECT returns an empty result and no error. A blocked UPDATE or
 * DELETE matches zero rows and also returns no error -- Postgres does not
 * raise on an UPDATE that changes nothing. So a test asserting `error !== null`
 * FAILS against correct policies, and a test asserting only `error === null`
 * passes against broken ones. Neither is a test of anything.
 *
 * The reliable question is always about state: read the row back afterwards
 * and assert it is unchanged, or read the collection and assert none of the
 * other tenant's rows are in it.
 */
export function assertDenied(rows, message) {
  if (!Array.isArray(rows)) {
    throw new Error(`${message} (expected an array, got ${typeof rows})`);
  }
  if (rows.length !== 0) {
    throw new Error(`${message} — ${rows.length} row(s) came back`);
  }
}
