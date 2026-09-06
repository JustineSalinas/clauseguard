/**
 * The service-role Supabase client. Pipeline writes only.
 *
 * REVIEW GATE: PLAN.md's review requirement puts anything under
 * lib/supabase/ behind a second pair of eyes before it merges.
 *
 * This key bypasses Row Level Security completely. RLS is the security
 * boundary for this project, so a client built with this key has no boundary
 * at all -- it can read and write every tenant's contracts. Three rules follow
 * and none of them are optional:
 *
 *   1. `import "server-only"` is the first line for a reason. It makes the
 *      build fail rather than the key ship if this module is ever pulled into
 *      a client component. A convention that says "don't import this in the
 *      browser" is not a control; a build error is.
 *   2. The variable is SUPABASE_SECRET_KEY, with no NEXT_PUBLIC_ prefix.
 *      Anything so prefixed is inlined into the browser bundle.
 *   3. Nothing here takes a user id from a caller and trusts it. Ownership is
 *      resolved from the authenticated session by the caller *before* reaching
 *      this client, because past that point nothing is checking.
 *
 * The user-scoped clients are lib/supabase/server.ts (server components and
 * actions) and lib/supabase/client.ts (browser). Reads that belong to a user
 * go through those, so that RLS is what scopes them. Use this one only where
 * the pipeline genuinely has to write rows a user is not permitted to write:
 * extractions, clauses, scoring_runs, clause_scores, and document status.
 */

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function createServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error(
      "SUPABASE_SECRET_KEY (and NEXT_PUBLIC_SUPABASE_URL) must be set for the " +
        "pipeline to write results. See .env.example. Never prefix the secret " +
        "key with NEXT_PUBLIC_.",
    );
  }

  cached = createClient(url, secret, {
    // No session to persist or refresh: this client is not a user.
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
