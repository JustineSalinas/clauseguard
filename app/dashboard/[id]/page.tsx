import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { DocumentStatus, ReviewedDocument, ScoredClause } from "@/lib/types";
import { computeMarks } from "@/lib/types";
import { ReviewView } from "@/components/review/review-view";
import { ContractHealthCard } from "@/components/review/contract-health-card";
import { PipelineFlow } from "@/components/review/pipeline-flow";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { FileDown, ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Review" };

const PROCESSING: DocumentStatus[] = [
  "uploaded",
  "extracting",
  "extracted",
  "segmenting",
  "segmented",
  "scoring",
];

export default async function DocumentReview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticatedNextjs())) {
    const { id } = await params;
    redirect(`/login?next=/dashboard/${id}`);
  }

  const { id } = await params;
  const token = await convexAuthNextjsToken();

  const doc = await fetchQuery(
    api.documents.get,
    { id: id as Id<"documents"> },
    { token },
  );
  if (!doc) redirect("/dashboard");

  const rows = await fetchQuery(
    api.clauses.listScoresForDocument,
    { documentId: id as Id<"documents"> },
    { token },
  );

  const clauses: ScoredClause[] = (rows as any[]).map(
    ({ clause, score, provisions }: any) => ({
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
      outcome: score?.outcome ?? "empty",
      injectionSuspected: score?.injectionSuspected ?? false,
      provisions: provisions ?? [],
      marks: computeMarks(clause.text, score?.highlightedPhrases),
    }),
  );

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
    <div className="min-h-screen bg-[#fafbfc]">
      <header className="border-b border-rule bg-surface sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Logo size="md" href="/" />
            <span className="hidden sm:inline-block h-4 w-px bg-rule" />
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 hover:text-ink transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to contracts</span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {clauses.length > 0 && (
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                <Link href={`/dashboard/${id}/report`}>
                  <FileDown className="size-3.5 text-[#b04000]" />
                  <span>Export Audit Report</span>
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">All contracts</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink text-balance sm:text-4xl">
            {doc.filename}
          </h1>
          <p className="mt-1 text-xs text-ink-3">
            {doc.contractType ?? "Contract Agreement"} · {doc.pageCount ? `${doc.pageCount} pages · ` : ""}
            Reviewed against Philippine Civil Code and Labor Code provisions.
          </p>
        </div>

        {doc.status === "failed" ? (
          <div className="mt-8 rounded-xl border border-rule border-l-2 border-l-flag bg-surface p-6 shadow-xs">
            <p className="font-semibold text-flag">This contract couldn&rsquo;t be read.</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {doc.failedReason ?? "Something went wrong while reading it."}
            </p>
          </div>
        ) : isProcessing ? (
          <div className="mt-8">
            <PipelineFlow status={doc.status} />
            <p className="mt-4 text-center text-xs text-ink-3">
              Clauses appear here as they&rsquo;re found. Reload in a moment.
            </p>
          </div>
        ) : clauses.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-rule-2 bg-surface p-12 text-center">
            <p className="font-display text-xl font-semibold">No clauses found.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
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
          <div className="mt-8 flex flex-col gap-8">
            {/* Health Scorecard Summary */}
            <ContractHealthCard clauses={clauses} documentId={doc._id} />

            {/* Document and Clause Inspector */}
            <ReviewView doc={reviewed} />
          </div>
        )}

        <p className="mt-10 text-xs leading-relaxed text-ink-3">
          ClauseGuard is an automated first-pass review tool and does not give formal legal advice.
        </p>
      </main>
    </div>
  );
}
