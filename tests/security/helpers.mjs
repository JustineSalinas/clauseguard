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

/** Every table a signed-in user can reach, and the column linking it to an
 *  owner. Add a row here whenever a table is added to the schema. */
export const OWNED_TABLES = [
  { table: "documents", idColumn: "id" },
  { table: "extractions", idColumn: "id" },
  { table: "clauses", idColumn: "id" },
  { table: "clause_scores", idColumn: "id" },
];

/** Tables no signed-in user should read at all. */
export const FORBIDDEN_TABLES = ["ground_truth_labels"];
