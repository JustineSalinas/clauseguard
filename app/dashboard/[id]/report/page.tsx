import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ScoredClause } from "@/lib/types";
import { computeContractHealth } from "@/lib/scoring/health-score";
import { Logo } from "@/components/brand/logo";
import { PrintReportButton } from "@/components/review/print-report-button";
import { ArrowLeft, Scale, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Audit Report | ClauseGuard",
  description: "Executive contract risk audit report grounded in Philippine law.",
};

export default async function AuditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthenticatedNextjs())) {
    redirect("/login");
  }

  const { id } = await params;
  const token = await convexAuthNextjsToken();

  const [doc, rows] = await Promise.all([
    fetchQuery(api.documents.get, { id: id as Id<"documents"> }, { token }),
    fetchQuery(api.clauses.listScoresForDocument, { documentId: id as Id<"documents"> }, { token }),
  ]);

  if (!doc) {
    redirect("/dashboard");
  }

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
    })
  );

  const health = computeContractHealth(clauses);
  const flaggedClauses = clauses.filter(
    (c) => c.riskLevel === "high" || c.riskLevel === "medium"
  );

  return (
    <div className="min-h-screen bg-white text-ink print:bg-white print:text-black">
      {/* Non-printed top navigation bar */}
      <div className="border-b border-rule bg-[#fafbfc] px-6 py-4 print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href={`/dashboard/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-2 hover:text-ink transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to interactive review</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <PrintReportButton />
          </div>
        </div>
      </div>

      {/* Main Audit Document Container */}
      <main className="mx-auto max-w-4xl px-8 py-10 print:max-w-none print:p-0">
        {/* Report Header */}
        <div className="flex items-start justify-between border-b-2 border-ink pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Logo size="sm" href="/" />
              <span className="font-mono text-xs uppercase tracking-wider text-ink-3">
                · Executive Audit
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Contract Risk &amp; Statutory Compliance Report
            </h1>
            <p className="mt-1 text-xs text-ink-2 font-mono">
              Document: {doc.filename} · Reviewed on {new Date().toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="text-right">
            <div className="inline-flex flex-col items-end rounded-lg border border-rule bg-[#fafbfc] p-3 print:border-black">
              <span className="font-mono text-[0.6875rem] text-ink-3 uppercase font-semibold">
                Contract Health Index
              </span>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-ink">
                  {health.score}
                </span>
                <span className="text-xs text-ink-3">/ 100</span>
              </div>
              <span className="text-[0.6875rem] font-bold text-[#b04000] uppercase">
                Grade {health.grade} · {health.label}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary Section */}
        <section className="mt-6">
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink-3">
            01 · Executive Summary &amp; Legal Stance
          </h2>
          <div className="mt-2 rounded-lg border border-rule bg-[#fafbfc] p-4 text-xs leading-relaxed text-ink print:bg-transparent print:border-gray-300">
            <p>{health.summary}</p>
            <p className="mt-2 text-ink-2">
              Analyzed {health.totalClauses} distinct covenants against Republic Act No. 386 (Civil Code of the Philippines)
              and Presidential Decree No. 442 (Labor Code of the Philippines).
            </p>
          </div>
        </section>

        {/* Risk Breakdown Counts */}
        <div className="mt-4 grid grid-cols-4 gap-3 text-center">
          <div className="rounded-lg border border-rule p-2.5">
            <div className="font-display text-xl font-bold text-red-600">{health.highRiskCount}</div>
            <div className="text-[0.6875rem] text-ink-3 uppercase font-medium">Critical Flags</div>
          </div>
          <div className="rounded-lg border border-rule p-2.5">
            <div className="font-display text-xl font-bold text-amber-600">{health.mediumRiskCount}</div>
            <div className="text-[0.6875rem] text-ink-3 uppercase font-medium">Worth Checking</div>
          </div>
          <div className="rounded-lg border border-rule p-2.5">
            <div className="font-display text-xl font-bold text-emerald-600">{health.lowRiskCount}</div>
            <div className="text-[0.6875rem] text-ink-3 uppercase font-medium">Standard Terms</div>
          </div>
          <div className="rounded-lg border border-rule p-2.5">
            <div className="font-display text-xl font-bold text-ink">{health.reviewCount}</div>
            <div className="text-[0.6875rem] text-ink-3 uppercase font-medium">Uncertain / Review</div>
          </div>
        </div>

        {/* Key Findings & Statutory Violations Table */}
        <section className="mt-8">
          <h2 className="font-display text-xs font-bold uppercase tracking-wider text-ink-3">
            02 · Key Flagged Provisions &amp; Recommended Redlines
          </h2>

          {flaggedClauses.length === 0 ? (
            <p className="mt-3 text-xs text-ink-3 italic">
              No severe or moderate risks detected. All clauses conform to baseline statutory requirements.
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-4">
              {flaggedClauses.map((c) => {
                const isHigh = c.riskLevel === "high";
                const primaryStatute = c.provisions && c.provisions.length > 0 ? c.provisions[0] : null;

                return (
                  <div
                    key={c.id}
                    className="rounded-lg border border-rule p-4 break-inside-avoid print:border-gray-400"
                  >
                    <div className="flex items-center justify-between border-b border-rule pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xs font-bold text-ink">
                          {c.label ?? `Clause ${c.ordinal}`}
                        </span>
                        {c.clauseType && (
                          <span className="font-mono text-[0.625rem] text-ink-3 uppercase">
                            · {c.clauseType}
                          </span>
                        )}
                        <span className="text-[0.625rem] font-mono text-ink-3">p. {c.page}</span>
                      </div>
                      <span
                        className={`text-[0.625rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                          isHigh ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {isHigh ? "High Risk" : "Moderate Risk"}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <span className="text-[0.6875rem] font-semibold text-ink-3 uppercase">Original Term:</span>
                      <p className="mt-1 font-contract text-xs italic leading-relaxed text-ink bg-[#fafbfc] p-2.5 rounded border border-rule print:bg-transparent">
                        &ldquo;{c.text}&rdquo;
                      </p>
                    </div>

                    {primaryStatute && (
                      <div className="mt-2.5 flex items-start gap-1.5 text-xs text-ink">
                        <Scale className="size-3.5 text-[#b04000] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">
                            {primaryStatute.code === "CIVIL"
                              ? "Civil Code of the Philippines"
                              : "Labor Code of the Philippines"}
                            , Art. {primaryStatute.article}:
                          </span>{" "}
                          <span className="text-ink-2 font-contract italic">
                            &ldquo;{primaryStatute.text}&rdquo;
                          </span>
                        </div>
                      </div>
                    )}

                    {c.deviation && (
                      <div className="mt-3 rounded border border-[#e8c6a8] bg-[#fbf6f1] p-3 print:bg-transparent">
                        <span className="text-[0.6875rem] font-bold uppercase text-[#b04000]">
                          Proposed Balanced Counter-Language (Redline):
                        </span>
                        <p className="mt-1 font-contract text-xs font-medium text-ink">
                          &ldquo;{c.deviation}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Disclaimer footer */}
        <footer className="mt-12 border-t border-rule pt-4 text-[0.6875rem] text-ink-3 print:border-gray-400">
          <div className="flex items-center justify-between">
            <span>
              ClauseGuard Legal Intelligence · University of San Agustin Research Capstone Project
            </span>
            <span>
              Subject to Republic Act No. 10173 (Data Privacy Act of 2012)
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

