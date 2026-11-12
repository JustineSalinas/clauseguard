import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { UploadForm } from "@/components/upload/upload-form";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ContractsList } from "@/components/dashboard/contracts-list";
import { ProductTour } from "@/components/dashboard/product-tour";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Scale,
  BookOpen,
  BookMarked,
  FileSearch,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | ClauseGuard",
  description: "Review and manage freelance contracts grounded in Philippine statutory law.",
};

function StatTile({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3.5 rounded-xl border p-4 shadow-xs transition-colors ${
        accent
          ? "border-[#e8c6a8] bg-[#fbeee4]/30"
          : "border-rule bg-surface hover:bg-raised"
      }`}
    >
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
          accent ? "bg-[#b04000] text-white" : "bg-[#fbeee4] text-[#b04000]"
        }`}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-2xl font-bold tracking-tight text-ink">
          {value}
        </div>
        <div className="text-[0.75rem] font-medium text-ink-3">{label}</div>
      </div>
    </div>
  );
}

export default async function Dashboard() {
  if (!(await isAuthenticatedNextjs())) {
    redirect("/login?next=/dashboard");
  }

  const token = await convexAuthNextjsToken();
  const [user, rows, stats] = await Promise.all([
    fetchQuery(api.users.me, {}, { token }),
    fetchQuery(api.documents.listMine, {}, { token }),
    fetchQuery(api.documents.statsForMine, {}, { token }),
  ]);

  const email = user?.email ?? "your account";

  return (
    <div className="min-h-screen bg-[#fafbfc] lg:flex">
      <ProductTour />
      <Sidebar email={email} activeHref="/dashboard" />

      <div className="flex-1">
        <main className="mx-auto max-w-5xl px-6 py-8 lg:px-10 lg:py-10">
          {/* Dashboard Header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-rule pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-2.5 py-0.5 text-[0.6875rem] font-medium text-ink-2">
                  <span className="size-1.5 rounded-full bg-[#0c8c5e]" />
                  Active Workspace
                </span>
                <span className="font-mono text-[0.6875rem] text-ink-3">
                  Corpus v2.4 (320 Provisions)
                </span>
              </div>
              <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Contract Reviews
              </h1>
              <p className="mt-1 text-[0.875rem] text-ink-2">
                Upload and inspect freelance agreements against Philippine Civil &amp; Labor Code articles.
              </p>
            </div>
          </div>

          {/* Metrics summary tiles */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" data-tour="stats">
            <StatTile icon={FileText} label="Total Contracts" value={stats.total} />
            <StatTile icon={Clock} label="In Progress" value={stats.inProgress} accent={stats.inProgress > 0} />
            <StatTile icon={AlertTriangle} label="Needs Attention" value={stats.needsReview} />
            <StatTile icon={CheckCircle2} label="Reviewed" value={stats.complete} />
          </div>

          {/* Quick Intelligence Tools */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3" data-tour="quick-tools">
            <Link
              href="/dashboard/corpus"
              className="group flex items-center justify-between rounded-xl border border-rule bg-surface p-3.5 transition-all hover:border-[#e8c6a8] hover:bg-[#fafbfc] shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8.5 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000] group-hover:bg-[#b04000] group-hover:text-white transition-colors">
                  <BookOpen className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink group-hover:text-[#b04000] transition-colors">
                    Statutory Corpus Explorer
                  </p>
                  <p className="text-[0.6875rem] text-ink-3">320 Articles · Civil &amp; Labor Code</p>
                </div>
              </div>
              <ArrowRight className="size-3.5 text-ink-3 group-hover:text-[#b04000] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/dashboard/playbook"
              className="group flex items-center justify-between rounded-xl border border-rule bg-surface p-3.5 transition-all hover:border-[#e8c6a8] hover:bg-[#fafbfc] shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8.5 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000] group-hover:bg-[#b04000] group-hover:text-white transition-colors">
                  <BookMarked className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink group-hover:text-[#b04000] transition-colors">
                    Pushback Playbook
                  </p>
                  <p className="text-[0.6875rem] text-ink-3">Statutory counter-proposals</p>
                </div>
              </div>
              <ArrowRight className="size-3.5 text-ink-3 group-hover:text-[#b04000] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/dashboard/sample"
              className="group flex items-center justify-between rounded-xl border border-rule bg-surface p-3.5 transition-all hover:border-[#e8c6a8] hover:bg-[#fafbfc] shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8.5 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000] group-hover:bg-[#b04000] group-hover:text-white transition-colors">
                  <FileSearch className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink group-hover:text-[#b04000] transition-colors">
                    Live Reference Review
                  </p>
                  <p className="text-[0.6875rem] text-ink-3">7 Clauses · Full markup</p>
                </div>
              </div>
              <ArrowRight className="size-3.5 text-ink-3 group-hover:text-[#b04000] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Upload Dropzone Section */}
          <section className="mt-6 rounded-xl border border-rule bg-surface p-6 shadow-xs" data-tour="upload">
            <div className="mb-4 flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h2 className="font-display text-base font-semibold text-ink">
                  Upload Contract for Review
                </h2>
                <p className="text-[0.75rem] text-ink-3">
                  Accepts PDF documents and high-resolution photo scans (PNG, JPG, HEIC).
                </p>
              </div>
            </div>
            <UploadForm />
          </section>

          {/* 3-Step Legal Reliability Methodology */}
          <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-rule bg-surface p-5 sm:grid-cols-3" data-tour="methodology">
            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#fbeee4] font-mono text-[0.6875rem] font-bold text-[#b04000]">
                01
              </span>
              <div>
                <p className="text-[0.8125rem] font-semibold text-ink">Verbatim Segmentation</p>
                <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-3">
                  Extracts every distinct covenant so fine print cannot hide between paragraphs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#fbeee4] font-mono text-[0.6875rem] font-bold text-[#b04000]">
                02
              </span>
              <div>
                <p className="text-[0.8125rem] font-semibold text-ink">Philippine Law Grounding</p>
                <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-3">
                  Every high-risk mark cites Civil Code Art. 1308, Art. 1306, or Labor Code standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#fbeee4] font-mono text-[0.6875rem] font-bold text-[#b04000]">
                03
              </span>
              <div>
                <p className="text-[0.8125rem] font-semibold text-ink">Calibrated Risk Scoring</p>
                <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-3">
                  Honest confidence metrics with clear redline pushback advice for negotiations.
                </p>
              </div>
            </div>
          </div>

          {/* Contracts List / Explorer */}
          <section className="mt-8" data-tour="contracts-list">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                Your Contracts
              </h2>
            </div>
            <ContractsList documents={rows as any[]} />
          </section>

          {/* Footer note */}
          <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6 text-[0.75rem] text-ink-3">
            <div className="flex items-center gap-1.5">
              <Scale className="size-3.5 text-[#b04000]" />
              <span>Grounded in Philippine jurisprudence (Civil Code &amp; Labor Code).</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#0c8c5e]" />
              <span>Signed in as {email}</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
