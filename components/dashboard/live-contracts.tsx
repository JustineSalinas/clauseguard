"use client";

import { useMemo } from "react";
import { usePreloadedQuery, type Preloaded } from "convex/react";
import { FileText, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { api } from "@/convex/_generated/api";
import { ContractsList } from "@/components/dashboard/contracts-list";

const IN_PROGRESS = new Set([
  "uploaded",
  "extracting",
  "extracted",
  "segmenting",
  "segmented",
  "scoring",
]);

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
        accent ? "border-[#e8c6a8] bg-[#fbeee4]/30" : "border-rule bg-surface hover:bg-raised"
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
        <div className="font-display text-2xl font-bold tracking-tight text-ink">{value}</div>
        <div className="text-[0.75rem] font-medium text-ink-3">{label}</div>
      </div>
    </div>
  );
}

/**
 * The contracts list and stat tiles, subscribed live. The server page
 * preloads the query (so first paint has data); after hydration Convex pushes
 * every change, so a delete, upload, or pipeline transition shows up
 * immediately with no refresh. Stats are derived from the same rows instead
 * of a second full-table query.
 */
export function LiveContracts({
  preloaded,
}: {
  preloaded: Preloaded<typeof api.documents.listMine>;
}) {
  const rows = usePreloadedQuery(preloaded);

  const stats = useMemo(() => {
    let inProgress = 0;
    let needsReview = 0;
    let complete = 0;
    for (const d of rows) {
      if (IN_PROGRESS.has(d.status)) inProgress++;
      else if (d.status === "partial" || d.status === "failed") needsReview++;
      else if (d.status === "complete") complete++;
    }
    return { total: rows.length, inProgress, needsReview, complete };
  }, [rows]);

  return (
    <>
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
    </>
  );
}
