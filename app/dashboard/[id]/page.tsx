import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { ReviewView } from "@/components/review/review-view";
import { PipelineFlow } from "@/components/review/pipeline-flow";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import type { DocumentStatus, ReviewedDocument, ScoredClause } from "@/lib/types";

export const metadata: Metadata = { title: "Contract review" };

/**
 * One document's review.
 *
 * documents:get returns null for "doesn't exist" and "exists but isn't
 * yours" alike -- same reasoning the old RLS-based version called out: a
 * document belonging to someone else should 404, never 403, since a 403
 * would confirm the id exists at all.
 */

const PROCESSING: DocumentStatus[] = [
  "uploaded",
  "extracting",
  "extracted",
  "segmenting",
  "segmented",
  "scoring",
];

export default async function Review({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!(await isAuthenticatedNextjs())) {
    redirect(`/login?next=/dashboard/${id}`);
  }

  const token = await convexAuthNextjsToken();
  const documentId = id as Id<"documents">;

  const doc = await fetchQuery(api.documents.get, { id: documentId }, { token });
  if (!doc) notFound();

  const rows = await fetchQuery(
    api.clauses.listScoresForDocument,
    { documentId },
    { token },
  );

  const clauses: ScoredClause[] = rows.map(({ clause, score }) => ({
    id: clause._id,
    ordinal: clause.ordinal,
    label: clause.label ?? null,
    clauseType: clause.clauseType ?? null,
    text: clause.text,
    page: clause.page,
    bboxes: clause.bboxes ?? [],
    riskLevel: score?.riskLevel ?? null,
    confidence: score?.confidence ?? null,
    rationale: score?.rationale ?? null,
    deviation: score?.deviation ?? null,
    // No score row yet means the scoring stage hasn't reached this clause.
    // "empty" routes it through the same unreadable verdict as a failed
    // score -- the honest presentation when there's no answer yet.
    outcome: score?.outcome ?? "empty",
    injectionSuspected: score?.injectionSuspected ?? false,
    provisions: [],
  }));

  const reviewed: ReviewedDocument = {
    id: doc._id,
    filename: doc.filename,
    contractType: doc.contractType ?? null,
    pageCount: doc.pageCount ?? null,
    status: doc.status,
    createdAt: new Date(doc.createdAt).toISOString(),
    clauses,
  };

  const isProcessing = PROCESSING.includes(doc.status) && clauses.length === 0;

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Logo size="md" href="/" />
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
              {doc.failedReason ?? "Something went wrong while reading it."}
            </p>
          </div>
        ) : isProcessing ? (
          <div className="mt-8">
            <PipelineFlow status={doc.status} />
            <p className="mt-4 text-center text-[0.8125rem] text-ink-3">
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
          ClauseGuard is a first-pass review tool and does not give legal advice.
        </p>
      </main>
    </div>
  );
}
