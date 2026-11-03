"use client";

import React from "react";
import type { ScoredClause } from "@/lib/types";
import { computeContractHealth } from "@/lib/scoring/health-score";
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ContractHealthCard({
  clauses,
  documentId,
}: {
  clauses: ScoredClause[];
  documentId?: string;
}) {
  const health = computeContractHealth(clauses);

  const toneConfig = {
    clear: {
      badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      barBg: "bg-emerald-500",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
    },
    caution: {
      badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
      barBg: "bg-amber-500",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
    },
    flag: {
      badgeBg: "bg-red-50 text-red-800 border-red-200",
      barBg: "bg-red-500",
      icon: AlertCircle,
      iconColor: "text-red-600",
    },
  }[health.tone];

  const Icon = toneConfig.icon;

  return (
    <div className="rounded-xl border border-rule-2 bg-surface p-6 shadow-xs">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-rule pb-5">
        <div className="flex items-center gap-4">
          {/* Score Circle / Badge */}
          <div className="relative flex size-18 shrink-0 flex-col items-center justify-center rounded-2xl border border-rule bg-[#fafbfc] shadow-2xs">
            <span className="font-display text-2xl font-bold tracking-tight text-ink">
              {health.score}
            </span>
            <span className="font-mono text-[0.625rem] font-semibold text-ink-3 uppercase">
              Score / 100
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${toneConfig.badgeBg}`}
              >
                <Icon className="size-3.5" />
                <span>{health.label}</span>
              </span>
              <span className="rounded bg-raised px-2 py-0.5 font-mono text-xs font-bold text-ink">
                Grade {health.grade}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-ink-2 max-w-xl leading-relaxed">
              {health.summary}
            </p>
          </div>
        </div>

        {/* Action Link to Playbook */}
        <div className="shrink-0 flex items-center gap-2">
          <Link
            href="/dashboard/playbook"
            className="inline-flex items-center gap-1.5 rounded-lg border border-rule-2 bg-surface px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:border-[#b04000] hover:text-[#b04000]"
          >
            <span>Negotiation playbook</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Progress Bar & Sub-metrics */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-rule">
          <div
            className={`h-full rounded-full transition-all duration-700 ${toneConfig.barBg}`}
            style={{ width: `${health.score}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 pt-1">
          <div className="flex items-center gap-2 rounded-lg bg-[#fafbfc] px-3 py-2 border border-rule">
            <span className="size-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-xs text-ink-3">Critical Flags:</span>
            <span className="font-mono text-xs font-bold text-ink">{health.highRiskCount}</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-[#fafbfc] px-3 py-2 border border-rule">
            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-xs text-ink-3">Worth Checking:</span>
            <span className="font-mono text-xs font-bold text-ink">{health.mediumRiskCount}</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-[#fafbfc] px-3 py-2 border border-rule">
            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs text-ink-3">Standard Terms:</span>
            <span className="font-mono text-xs font-bold text-ink">{health.lowRiskCount}</span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-[#fafbfc] px-3 py-2 border border-rule">
            <span className="size-2 rounded-full bg-slate-400 shrink-0" />
            <span className="text-xs text-ink-3">Human Review:</span>
            <span className="font-mono text-xs font-bold text-ink">{health.reviewCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

