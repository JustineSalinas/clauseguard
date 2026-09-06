import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ReviewView } from "@/components/review/review-view";
import { Button } from "@/components/ui/button";
import type {
  BoundingBox,
  DocumentStatus,
  ReviewedDocument,
  RiskLevel,
  ScoreOutcome,
  ScoredClause,
} from "@/lib/types";

export const metadata: Metadata = { title: "Contract review" };

/**
 * One document's review.
 *
 * Read through the *user's* client, never the service role. RLS is what scopes
 * this to its owner, and no owner_id filter is written below on purpose: if a
 * hand-written filter were the only thing separating tenants, one forgotten
 * .eq() would leak every contract in the table. A document belonging to
 * someone else returns no rows and renders as a 404 -- never a 403, which
 * would confirm the id exists.
 */

type ClauseRow = {
  id: string;
  ordinal: number;
  label: string | null;
  clause_type: string | null;
  text: string;
  page: number;
  bboxes: BoundingBox[] | null;
  clause_scores: {
    risk_level: RiskLevel | null;
    confidence: number | null;
    rationale: string | null;
    deviation: string | null;
    outcome: ScoreOutcome;
    injection_suspected: boolean;
    created_at: string;
  }[];
};

const PROCESSING: DocumentStatus[] = [
  "uploaded",
  "extracting",
  "extracted",
  "segmenting",
  "segmented",
  "scoring",
];

export default async function Review({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect(`/login?next=/dashboard/${id}`);

  const { data: doc } = await supabase
    .from("documents")
    .select("id, filename, contract_type, page_count, status, failed_reason, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!doc) notFound();

  const { data: clauseRows } = await supabase
    .from("clauses")
    .select(
      "id, ordinal, label, clause_type, text, page, bboxes, " +
        "clause_scores(risk_level, confidence, rationale, deviation, outcome, injection_suspected, created_at)",
    )
    .eq("document_id", id)
    .order("ordinal", { ascending: true })
    .returns<ClauseRow[]>();

  const clauses: ScoredClause[] = (clauseRows ?? []).map((row) => {
    // A clause can carry scores from several runs once Objectives 3 and 4
    // start replaying the corpus. The reader gets the most recent; the older
    // rows stay in the table for the ablation to query.
    const score = [...row.clause_scores].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    )[0];

    return {
      id: row.id,
      ordinal: row.ordinal,
      label: row.label,
      clauseType: row.clause_type,
      text: row.text,
      page: row.page,
      bboxes: row.bboxes ?? [],
      riskLevel: score?.risk_level ?? null,
      confidence: score?.confidence ?? null,
      rationale: score?.rationale ?? null,
      deviation: score?.deviation ?? null,
      // No score row at all means the scoring stage has not reached this
      // clause yet. "empty" routes it through the same unreadable verdict as
      // a failed score, which is the honest presentation: we have no answer.
      outcome: score?.outcome ?? "empty",
      injectionSuspected: score?.injection_suspected ?? false,
      provisions: [],
    };
  });

  const reviewed: ReviewedDocument = {
    id: doc.id,
    filename: doc.filename,
    contractType: doc.contract_type,
    pageCount: doc.page_count,
    status: doc.status,
    createdAt: doc.created_at,
    clauses,
  };

  const isProcessing = PROCESSING.includes(doc.status) && clauses.length === 0;

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            Clause<span className="text-brand">Guard</span>
          </Link>
          <Button asChild variant="ghost" size="lg">
            <Link href="/dashboard">All contracts</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-balance">
          {doc.filename}
        </h1>

        {doc.status === "failed" ? (
          <div className="mt-8 rounded-sm border border-rule border-l-2 border-l-flag bg-surface p-6">
            <p className="font-semibold">This contract couldn&rsquo;t be read.</p>
            <p className="mt-2 leading-relaxed text-ink-2">
              {doc.failed_reason ?? "Something went wrong while reading it."}
            </p>
          </div>
        ) : isProcessing ? (
          <div className="mt-8 rounded-sm border border-dashed border-rule-2 bg-surface p-12 text-center">
            <p className="font-display text-xl font-semibold">Still reading.</p>
            <p className="mx-auto mt-2 max-w-md leading-relaxed text-ink-2">
              Clauses appear here as they&rsquo;re found. Reload in a moment.
            </p>
          </div>
        ) : clauses.length === 0 ? (
          <div className="mt-8 rounded-sm border border-dashed border-rule-2 bg-surface p-12 text-center">
            <p className="font-display text-xl font-semibold">No clauses found.</p>
            <p className="mx-auto mt-2 max-w-md leading-relaxed text-ink-2">
              We read the document but couldn&rsquo;t find anything structured
              like a contract clause. If this is a contract, it may be laid out
              in a way ClauseGuard doesn&rsquo;t handle yet.
            </p>
            <div className="mt-6">
              <Button asChild size="hero" variant="outline">
                <Link href="/dashboard">Try another contract</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-10">
            <ReviewView doc={reviewed} />
          </div>
        )}

        <p className="mt-10 text-[0.8125rem] leading-relaxed text-ink-3">
          ClauseGuard is a first-pass review tool and does not give legal
          advice.
        </p>
      </main>
    </div>
  );
}
