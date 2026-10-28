import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { UploadForm } from "@/components/upload/upload-form";
import { Sidebar } from "@/components/dashboard/sidebar";
import { FileText, FileSearch, ShieldAlert, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = { title: "Your contracts" };

const PIPELINE_STAGES = [
  "uploaded",
  "extracting",
  "extracted",
  "segmenting",
  "segmented",
  "scoring",
] as const;

const STATUS_COPY: Record<string, string> = {
  uploaded: "Queued",
  extracting: "Reading the page",
  extracted: "Read",
  segmenting: "Finding clauses",
  segmented: "Clauses found",
  scoring: "Checking clauses",
  partial: "Partly checked",
  complete: "Reviewed",
  failed: "Couldn't be read",
};

function StageProgress({ status }: { status: string }) {
  const idx = PIPELINE_STAGES.indexOf(status as (typeof PIPELINE_STAGES)[number]);
  if (idx === -1) return null; // terminal state, no bar
  const pct = ((idx + 1) / PIPELINE_STAGES.length) * 100;
  return (
    <div className="mt-2 h-1 w-full max-w-40 overflow-hidden rounded-full bg-[#f2f2f2]">
      <div
        className="h-full rounded-full bg-[#b04000] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "complete"
      ? "bg-clear-wash text-clear"
      : status === "failed"
        ? "bg-flag-wash text-flag"
        : status === "partial"
          ? "bg-caution-wash text-caution"
          : "bg-raised text-ink-2";

  return (
    <span
      className={`inline-flex rounded-sm px-2 py-1 font-body text-[0.6875rem] font-semibold tracking-[0.08em] uppercase ${tone}`}
    >
      {STATUS_COPY[status] ?? status}
    </span>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[6px] border border-rule bg-surface px-4 py-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-[4px] bg-[#fbeee4] text-[#b04000]">
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-xl font-semibold leading-tight tracking-tight">
          {value}
        </div>
        <div className="text-[0.75rem] leading-snug text-ink-3">{label}</div>
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
    <div className="min-h-screen lg:flex">
      <Sidebar email={email} activeHref="/dashboard" />

      <div className="flex-1">
        <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-12">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Your contracts</h1>
          <p className="mt-1.5 text-[0.9375rem] text-ink-2">
            Upload a contract and ClauseGuard marks the clauses that shift risk onto you.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={FileText} label="Total contracts" value={stats.total} />
            <StatTile icon={FileSearch} label="In progress" value={stats.inProgress} />
            <StatTile icon={ShieldAlert} label="Needs attention" value={stats.needsReview} />
            <StatTile icon={CheckCircle2} label="Reviewed" value={stats.complete} />
          </div>

          <div className="mt-6 rounded-[6px] border border-rule bg-surface p-6">
            <UploadForm />
          </div>

          {/* Informative, not decorative: names the three things ClauseGuard
              actually does to a contract, in the order it does them, so a
              first-time user knows what "Needs attention" or a risk flag
              means before they ever see one. Real feature names, not a
              marketing restatement. */}
          <div className="mt-6 flex flex-col gap-4 rounded-[6px] border border-rule bg-[#fcfdfd] p-5 sm:flex-row sm:gap-6">
            <div className="flex items-start gap-3 sm:flex-1">
              <span className="font-mono text-[0.75rem] font-semibold text-[#b04000]">01</span>
              <div>
                <p className="text-[0.8125rem] font-semibold text-ink">Segments every clause</p>
                <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-3">
                  No clause gets missed or merged with the one next to it.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:flex-1">
              <span className="font-mono text-[0.75rem] font-semibold text-[#b04000]">02</span>
              <div>
                <p className="text-[0.8125rem] font-semibold text-ink">Grounds it in the law</p>
                <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-3">
                  Every flag cites the Civil Code or Labor Code article behind it.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:flex-1">
              <span className="font-mono text-[0.75rem] font-semibold text-[#b04000]">03</span>
              <div>
                <p className="text-[0.8125rem] font-semibold text-ink">Scores risk, honestly</p>
                <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-3">
                  A confidence score on every call — including when it isn&rsquo;t sure.
                </p>
              </div>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="mt-6 rounded-[6px] border border-dashed border-rule-2 bg-surface p-12 text-center">
              <p className="font-display text-xl font-semibold">Nothing here yet.</p>
              <p className="mx-auto mt-2 max-w-md leading-relaxed text-ink-2">
                Upload a contract above and ClauseGuard will mark the clauses that
                shift risk onto you. You can also read a finished review first.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild size="hero" variant="outline">
                  <Link href="/sample">See an example review</Link>
                </Button>
              </div>
            </div>
          ) : (
            <ul className="mt-6 flex flex-col gap-3">
              {rows.map((d) => (
                <li key={d._id}>
                  <Link
                    href={`/dashboard/${d._id}`}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[6px] border border-rule bg-surface p-5 transition-colors hover:bg-raised"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{d.filename}</p>
                      <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                        {d.contractType ?? "Contract"}
                        {d.pageCount ? ` · ${d.pageCount} pages` : ""} ·{" "}
                        {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                      <StageProgress status={d.status} />
                    </div>
                    <StatusPill status={d.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 text-[0.8125rem] text-ink-3">
            Signed in as {email}. Contracts you upload are private to this account.
          </p>
        </main>
      </div>
    </div>
  );
}
