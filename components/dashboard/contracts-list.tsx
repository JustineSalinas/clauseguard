"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  FileText,
  Search,
  X,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Filter,
  RotateCw,
  Trash2,
  Loader2,
} from "lucide-react";

export interface DocumentItem {
  _id: string;
  filename: string;
  status: string;
  contractType?: string;
  pageCount?: number;
  createdAt: number;
}

const PIPELINE_STAGES = [
  "uploaded",
  "extracting",
  "extracted",
  "segmenting",
  "segmented",
  "scoring",
] as const;

const STATUS_LABELS: Record<string, { label: string; tone: string; icon: typeof CheckCircle2 }> = {
  uploaded: { label: "Queued", tone: "bg-raised text-ink-2 border-rule", icon: Clock },
  extracting: { label: "Reading text", tone: "bg-[#fbeee4] text-[#b04000] border-[#e8c6a8]", icon: Clock },
  extracted: { label: "Read complete", tone: "bg-[#fbeee4] text-[#b04000] border-[#e8c6a8]", icon: Clock },
  segmenting: { label: "Finding clauses", tone: "bg-[#fbeee4] text-[#b04000] border-[#e8c6a8]", icon: Clock },
  segmented: { label: "Clauses indexed", tone: "bg-[#fbeee4] text-[#b04000] border-[#e8c6a8]", icon: Clock },
  scoring: { label: "Checking risks", tone: "bg-[#fbeee4] text-[#b04000] border-[#e8c6a8]", icon: Clock },
  partial: { label: "Partly checked", tone: "bg-caution-wash text-caution border-amber-200", icon: AlertTriangle },
  complete: { label: "Reviewed", tone: "bg-clear-wash text-clear border-emerald-200", icon: CheckCircle2 },
  failed: { label: "Could not read", tone: "bg-flag-wash text-flag border-red-200", icon: AlertTriangle },
};

function StageProgressBar({ status }: { status: string }) {
  const idx = PIPELINE_STAGES.indexOf(status as (typeof PIPELINE_STAGES)[number]);
  if (idx === -1) return null;
  const pct = Math.round(((idx + 1) / PIPELINE_STAGES.length) * 100);

  return (
    <div className="mt-2.5 flex items-center gap-2">
      <div className="h-1.5 w-full max-w-44 overflow-hidden rounded-full bg-rule">
        <div
          className="h-full rounded-full bg-[#b04000] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[0.6875rem] text-ink-3">{pct}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_LABELS[status] ?? {
    label: status,
    tone: "bg-raised text-ink-2 border-rule",
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wide uppercase ${config.tone}`}
    >
      <Icon className="size-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export function ContractsList({ documents }: { documents: DocumentItem[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "complete" | "needsReview" | "inProgress">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const sweepStuck = useMutation(api.documents.sweepStuck);
  const removeDocument = useMutation(api.documents.remove);
  const retryPipeline = useAction(api.pipeline.retry);

  useEffect(() => {
    sweepStuck().catch(() => {});
  }, [sweepStuck]);

  async function handleRetry(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setActiveActionId(id);
    try {
      await retryPipeline({ documentId: id as Id<"documents"> });
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setActiveActionId(null);
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string, name: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${name}" and all associated review data?`)) {
      return;
    }
    setActiveActionId(id);
    try {
      await removeDocument({ id: id as Id<"documents"> });
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setActiveActionId(null);
    }
  }

  const counts = useMemo(() => {
    let inProgress = 0;
    let needsReview = 0;
    let complete = 0;

    for (const doc of documents) {
      if (PIPELINE_STAGES.includes(doc.status as (typeof PIPELINE_STAGES)[number])) {
        inProgress++;
      } else if (doc.status === "complete") {
        complete++;
      } else {
        needsReview++;
      }
    }

    return { all: documents.length, complete, needsReview, inProgress };
  }, [documents]);

  const filtered = useMemo(() => {
    let list = [...documents];

    // Status filter
    if (filter === "complete") {
      list = list.filter((d) => d.status === "complete");
    } else if (filter === "needsReview") {
      list = list.filter((d) => d.status === "partial" || d.status === "failed");
    } else if (filter === "inProgress") {
      list = list.filter((d) =>
        PIPELINE_STAGES.includes(d.status as (typeof PIPELINE_STAGES)[number])
      );
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.filename.toLowerCase().includes(q) ||
          d.contractType?.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "newest") return b.createdAt - a.createdAt;
      if (sortBy === "oldest") return a.createdAt - b.createdAt;
      return a.filename.localeCompare(b.filename);
    });

    return list;
  }, [documents, filter, search, sortBy]);

  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-rule-2 bg-[#fafbfc] p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fbeee4] text-[#b04000]">
          <FileText className="size-6" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-ink">
          No contracts reviewed yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-[0.875rem] leading-relaxed text-ink-2">
          Upload a contract above to start your first analysis. ClauseGuard will highlight
          high-risk clauses and cite applicable Philippine laws.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard/sample"
            className="inline-flex items-center gap-1.5 rounded-md border border-rule bg-surface px-4 py-2 text-[0.875rem] font-medium text-ink transition-colors hover:bg-raised"
          >
            <span>Inspect a sample contract review</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
              filter === "all"
                ? "bg-ink text-surface"
                : "bg-surface text-ink-2 hover:bg-raised border border-rule"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter("complete")}
            className={`rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
              filter === "complete"
                ? "bg-[#0c8c5e] text-white"
                : "bg-surface text-ink-2 hover:bg-raised border border-rule"
            }`}
          >
            Reviewed ({counts.complete})
          </button>
          <button
            type="button"
            onClick={() => setFilter("inProgress")}
            className={`rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
              filter === "inProgress"
                ? "bg-[#b04000] text-white"
                : "bg-surface text-ink-2 hover:bg-raised border border-rule"
            }`}
          >
            In Progress ({counts.inProgress})
          </button>
          <button
            type="button"
            onClick={() => setFilter("needsReview")}
            className={`rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${
              filter === "needsReview"
                ? "bg-amber-600 text-white"
                : "bg-surface text-ink-2 hover:bg-raised border border-rule"
            }`}
          >
            Needs Attention ({counts.needsReview})
          </button>
        </div>

        {/* Search input & sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-3" />
            <input
              type="text"
              placeholder="Search contracts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 w-full rounded-md border border-rule bg-surface pl-8.5 pr-8 text-[0.8125rem] text-ink placeholder:text-ink-3 focus:border-[#b04000] focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              aria-label="Sort contracts"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-8.5 cursor-pointer rounded-md border border-rule bg-surface px-2.5 text-[0.75rem] font-medium text-ink-2 focus:border-[#b04000] focus:outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-rule bg-surface p-8 text-center text-ink-2">
          <Filter className="mx-auto size-5 text-ink-3" />
          <p className="mt-2 text-[0.875rem]">No contracts match your search or filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="mt-3 text-[0.8125rem] font-medium text-[#b04000] underline underline-offset-4"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {filtered.map((d) => (
            <li key={d._id}>
              <Link
                href={`/dashboard/${d._id}`}
                className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rule bg-surface p-4 transition-all hover:border-[#e8c6a8] hover:bg-[#fafbfc] hover:shadow-xs sm:p-5"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000] transition-colors group-hover:bg-[#b04000] group-hover:text-white">
                    <FileText className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink group-hover:text-[#b04000] transition-colors">
                      {d.filename}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[0.75rem] text-ink-3">
                      <span className="font-medium text-ink-2">
                        {d.contractType ?? "Contract"}
                      </span>
                      {d.pageCount ? <span>· {d.pageCount} pages</span> : null}
                      <span>·</span>
                      <span title={new Date(d.createdAt).toLocaleString()}>
                        {new Date(d.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <StageProgressBar status={d.status} />
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <StatusBadge status={d.status} />

                  {(d.status === "failed" || d.status === "partial") && (
                    <button
                      type="button"
                      disabled={activeActionId === d._id}
                      onClick={(e) => handleRetry(e, d._id)}
                      className="inline-flex items-center gap-1 rounded-md border border-rule bg-surface px-2.5 py-1 text-xs font-medium text-[#b04000] hover:bg-[#fbeee4] transition-colors disabled:opacity-50 cursor-pointer"
                      title="Retry analysis"
                    >
                      <RotateCw
                        className={`size-3 ${activeActionId === d._id ? "animate-spin" : ""}`}
                      />
                      <span>Retry</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={activeActionId === d._id}
                    onClick={(e) => handleDelete(e, d._id, d.filename)}
                    className="inline-flex size-8 items-center justify-center rounded-md text-ink-3 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Delete contract and review data"
                  >
                    {activeActionId === d._id ? (
                      <Loader2 className="size-3.5 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>

                  <div className="hidden items-center gap-1 text-[0.8125rem] font-medium text-ink-3 transition-colors group-hover:text-ink sm:flex">
                    <span>View</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

