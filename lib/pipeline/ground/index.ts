/**
 * The grounding stage (Objective 4). Given a clause type and the configured
 * grounding_arm, resolves the statutory provisions to hand the scoring
 * prompt -- or, for "none", nothing at all.
 *
 * Not a pure function like segment/index.ts: the `static` arm genuinely
 * needs a database read (provision_mappings joined to provisions), so this
 * takes a Supabase client rather than hiding one behind a module-level
 * import, the same shape lib/pipeline/score keeps its model call behind an
 * explicit input rather than a hidden client.
 *
 * `rag` is not implemented. The schema comment on provisions.embedding is
 * explicit that embeddings get generated after the corpus loads, not
 * before -- see corpus/civil-code/README.md. Calling groundClause with
 * arm "rag" throws RagNotReadyError rather than silently falling back to an
 * empty result, because "no embeddings exist yet" and "retrieval genuinely
 * found nothing relevant" (NoRelevantProvision, a legitimate RAG outcome
 * once it IS wired) are different conditions and must stay distinguishable.
 */

import type { ClauseTypeId } from "@/lib/pipeline/taxonomy";
import type { GroundingArm } from "@/lib/types";
import type { StatutoryProvision } from "@/lib/prompts/score.v1";

/** The minimal slice of the Supabase client this stage touches. Typed by
 *  hand rather than importing SupabaseClient, so a unit test can pass a
 *  tiny fake instead of mocking the full client surface. */
export type GroundingDb = {
  from(table: "provision_mappings"): {
    select(columns: string): {
      eq(
        column: "clause_type",
        value: string,
      ): {
        order(
          column: "rank",
          opts: { ascending: boolean },
        ): PromiseLike<{ data: ProvisionMappingRow[] | null; error: { message: string } | null }>;
      };
    };
  };
};

type ProvisionMappingRow = {
  rank: number;
  provisions:
    | { code: "CIVIL" | "LABOR"; article: string; text: string }
    | { code: "CIVIL" | "LABOR"; article: string; text: string }[]
    | null;
};

export class RagNotReadyError extends Error {
  constructor() {
    super(
      "The rag grounding arm requires provisions.embedding to be populated. " +
        "Run the embedding generation step first (see lib/pipeline/ground/README.md); " +
        "until then, use the static arm.",
    );
    this.name = "RagNotReadyError";
  }
}

export type GroundResult = {
  arm: GroundingArm;
  provisions: StatutoryProvision[];
};

/** provisions(...) comes back as an object for a to-one relationship, but
 *  supabase-js's typed client sometimes infers it as an array depending on
 *  how the FK is declared -- normalize both shapes here rather than trust
 *  one. */
function normalizeProvision(
  row: ProvisionMappingRow,
): StatutoryProvision | null {
  const p = Array.isArray(row.provisions) ? row.provisions[0] : row.provisions;
  if (!p) return null;
  return { code: p.code, article: p.article, text: p.text };
}

export async function groundClause(params: {
  db: GroundingDb;
  clauseType: ClauseTypeId | null;
  arm: GroundingArm;
}): Promise<GroundResult> {
  const { db, clauseType, arm } = params;

  if (arm === "none") {
    return { arm, provisions: [] };
  }

  if (arm === "rag") {
    throw new RagNotReadyError();
  }

  // arm === "static". A clause with no type (segmentation couldn't guess,
  // or it's "other") has nothing to look up -- that's NoRelevantProvision,
  // a legitimate empty result, not an error.
  if (!clauseType || clauseType === "other") {
    return { arm, provisions: [] };
  }

  const { data, error } = await db
    .from("provision_mappings")
    .select("rank, provisions(code, article, text)")
    .eq("clause_type", clauseType)
    .order("rank", { ascending: true });

  if (error) {
    throw new Error(`Grounding lookup failed for clause_type "${clauseType}": ${error.message}`);
  }

  const provisions = (data ?? [])
    .map(normalizeProvision)
    .filter((p): p is StatutoryProvision => p !== null);

  return { arm, provisions };
}
