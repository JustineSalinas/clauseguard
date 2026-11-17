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
import { FileText, Clock, AlertTriangle, CheckCircle2, ShieldCheck, Scale } from "lucide-react";

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
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="border-b border-rule pb-5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Your contracts
            </h1>
            <p className="mt-1 text-[0.875rem] text-ink-2">
              Upload a contract to see which clauses could cost you, in plain language.
            </p>
          </div>

          {/* Step one is always the same: upload. */}
          <section className="mt-6 rounded-xl border border-rule bg-surface p-4 shadow-xs sm:p-6" data-tour="upload">
            <div className="mb-4">
              <h2 className="font-display text-base font-semibold text-ink">Upload a contract</h2>
              <p className="text-[0.75rem] text-ink-3">
                PDF or a clear photo (PNG, JPG, HEIC). Not sure yet?{" "}
                <Link href="/dashboard/sample" className="font-medium text-[#b04000] hover:underline">
                  See a sample review
                </Link>
                .
              </p>
            </div>
            <UploadForm />
          </section>

          {rows.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" data-tour="stats">
              <StatTile icon={FileText} label="Total Contracts" value={stats.total} />
              <StatTile icon={Clock} label="In Progress" value={stats.inProgress} accent={stats.inProgress > 0} />
              <StatTile icon={AlertTriangle} label="Needs Attention" value={stats.needsReview} />
              <StatTile icon={CheckCircle2} label="Reviewed" value={stats.complete} />
            </div>
          )}

          <section className="mt-8" data-tour="contracts-list">
            <h2 className="mb-4 font-display text-lg font-semibold tracking-tight text-ink">
              Review history
            </h2>
            <ContractsList documents={rows} />
          </section>

          <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-6 text-[0.75rem] text-ink-3">
            <div className="flex items-center gap-1.5">
              <Scale className="size-3.5 text-[#b04000]" />
              <span>Checked against the Philippine Civil Code and Labor Code.</span>
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
