"use client";

import React, { useState } from "react";
import type { ReviewedDocument, ScoredClause } from "@/lib/types";
import { bySeverity, documentSummary, verdictFor } from "@/lib/types";
import { ClauseCard } from "@/components/review/clause-card";
import { ClauseText, VerdictBadge } from "@/components/review/verdict";
import { AlertTriangle, Play } from "lucide-react";

interface BeforeAfterContractViewerProps {
  doc: ReviewedDocument;
}

function SummaryStat({
  n,
  label,
  tone,
}: {
  n: number;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <span className={`font-sans text-2xl font-semibold tabular-nums ${tone}`}>
        {n}
      </span>
      <span className="text-[0.75rem] leading-tight text-[#525866]">{label}</span>
    </div>
  );
}

function Summary({ clauses }: { clauses: ScoredClause[] }) {
  const s = documentSummary(clauses);

  return (
    <div className="rounded-[16px] border border-[#dddddd] bg-white shadow-[0_2px_4px_rgba(8,9,10,0.02)] overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-y divide-[#f2f2f2] sm:grid-cols-3 lg:grid-cols-5 lg:divide-y-0">
        <SummaryStat n={s.high} label="High risk" tone="text-[#dc2626]" />
        <SummaryStat n={s.medium} label="Worth checking" tone="text-[#d97706]" />
        <SummaryStat n={s.low} label="Look standard" tone="text-[#0c8c5e]" />
        <SummaryStat n={s.review} label="Need human review" tone="text-[#d97706]" />
        <SummaryStat
          n={s.unreadable}
          label="Unanalyzed / refusal"
          tone="text-[#868c98]"
        />
      </div>

      {s.incomplete ? (
        <p className="border-t border-[#f2f2f2] bg-[#f8f9fa] px-5 py-3.5 text-xs sm:text-sm leading-relaxed text-[#525866]">
          <span className="font-semibold text-[#08090a]">
            Incomplete verification threshold:
          </span>{" "}
          {s.review + s.unreadable} of {s.total} clauses were routed to manual review or unparsed because model confidence fell below the calibrated threshold. Silence on those is never treated as approval.
        </p>
      ) : null}
    </div>
  );
}

function DocumentView({ clauses }: { clauses: ScoredClause[] }) {
  const inOrder = [...clauses].sort((a, b) => a.ordinal - b.ordinal);

  return (
    <div className="rounded-[16px] border border-[#dddddd] bg-white p-7 sm:p-10 shadow-[0_2px_4px_rgba(8,9,10,0.02)]">
      <div className="font-sans mx-auto max-w-[68ch] space-y-6 text-[15px] leading-[1.8] text-[#08090a]">
        <div className="border-b border-[#f2f2f2] pb-4 mb-6">
          <p className="text-[11px] font-mono text-[#b04000] uppercase tracking-wider font-semibold">
            In-Situ Contract Heat-Map &middot; Grounded in Philippine Law
          </p>
          <h3 className="text-lg font-semibold text-[#08090a] mt-1">
            Independent Contractor &amp; Intellectual Property Services Agreement
          </h3>
        </div>

        {inOrder.map((c) => {
          const dimmed = verdictFor(c) === "flagged" && c.riskLevel === "low";
          return (
            <div key={c.id} className="p-2.5 rounded-[4px] hover:bg-[#fafbfc] transition-colors">
              <p className={dimmed ? "text-[#525866]" : "text-[#08090a]"}>
                {c.label ? (
                  <a
                    href={`#clause-${c.id}`}
                    className="font-bold text-[#08090a] no-underline hover:text-[#b04000] mr-2"
                  >
                    {c.label}
                  </a>
                ) : null}
                <ClauseText clause={c} />
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BeforeAfterContractViewer({ doc }: BeforeAfterContractViewerProps) {
  const [viewMode, setViewMode] = useState<"before" | "after">("after");
  const [afterSubTab, setAfterSubTab] = useState<"cards" | "document">("cards");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState<number>(0);

  const inOrder = [...doc.clauses].sort((a, b) => a.ordinal - b.ordinal);
  const ranked = [...doc.clauses].sort(bySeverity);

  const runScanAnimation = () => {
    setViewMode("before");
    setIsScanning(true);
    setScanStage(1);

    setTimeout(() => {
      setScanStage(2);
      setTimeout(() => {
        setScanStage(3);
        setTimeout(() => {
          setIsScanning(false);
          setViewMode("after");
        }, 900);
      }, 850);
    }, 750);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Control Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-[16px] border border-[#dddddd] bg-white shadow-[0_2px_4px_rgba(8,9,10,0.02)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#08090a]">
              Audit State:
            </span>
            <span
              className={`text-xs font-mono font-medium px-2 py-0.5 rounded-[3px] border ${
                viewMode === "after"
                  ? "bg-[#fbeee4] text-[#b04000] border-[#e8c6a8]"
                  : "bg-[#fffbeb] text-[#d97706] border-[#fde68a]"
              }`}
            >
              {viewMode === "after"
                ? "AUDITED BY CLAUSEGUARD"
                : "RAW CLIENT DRAFT (UNAUDITED)"}
            </span>
          </div>
          <p className="text-xs text-[#525866] mt-1">
            {viewMode === "after"
              ? "Statutory risks flagged, heat-map highlighted, and grounded against Philippine law."
              : "Raw legal agreement as received. Onerous forfeiture and indemnities look harmless."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Segmented Switcher */}
          <div className="flex items-center bg-[#f2f2f2] p-1 rounded-[4px] border border-[#dddddd]">
            <button
              onClick={() => {
                setIsScanning(false);
                setViewMode("before");
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-[3px] transition-colors cursor-pointer ${
                viewMode === "before" && !isScanning
                  ? "bg-white text-[#08090a] shadow-sm font-semibold"
                  : "text-[#525866] hover:text-[#08090a]"
              }`}
            >
              Before (Raw Draft)
            </button>
            <button
              onClick={() => {
                setIsScanning(false);
                setViewMode("after");
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === "after"
                  ? "bg-white text-[#08090a] shadow-sm font-semibold"
                  : "text-[#525866] hover:text-[#08090a]"
              }`}
            >
              <span className="size-1.5 rounded-full bg-[#b04000]" />
              After (Audited)
            </button>
          </div>

          {/* Re-run Live Scan Button */}
          <button
            onClick={runScanAnimation}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#08090a] text-white text-xs font-medium hover:bg-[#1a1c1e] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isScanning ? (
              <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="size-3 text-[#b04000] fill-current" />
            )}
            <span>{isScanning ? "Scanning..." : "Run Audit Scan"}</span>
          </button>
        </div>
      </div>

      {/* Live Scanning Progress Overlay & Telemetry (visible during scan) */}
      {isScanning && (
        <div className="p-4 rounded-[12px] border border-[#b04000] bg-[#fbeee4] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-[#b04000] animate-ping" />
            <div className="text-xs font-mono font-medium text-[#08090a]">
              {scanStage === 1 && "Stage 1/3: Extracting token bounding boxes & hierarchy..."}
              {scanStage === 2 && "Stage 2/3: Querying Philippine Civil Code (R.A. 386) & Labor Code vectors..."}
              {scanStage === 3 && "Stage 3/3: Calibrating confidence thresholds & generating heat-map overlay..."}
            </div>
          </div>
          <span className="text-xs font-mono text-[#b04000] font-semibold">
            {scanStage === 1 && "33%"}
            {scanStage === 2 && "68%"}
            {scanStage === 3 && "95%"}
          </span>
        </div>
      )}

      {/* ---------------- BEFORE STATE: Raw Unaudited Document Parchment ---------------- */}
      {viewMode === "before" && (
        <div className="space-y-6">
          {/* Informational Callout */}
          <div className="rounded-[16px] border border-[#fde68a] bg-[#fffdf5] p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#b45309]">
              <AlertTriangle className="size-4 text-[#d97706]" />
              <span>UNAUDITED CONTRACT VIEW &middot; DANGEROUS TERMS HIDING IN PLAIN SIGHT</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#78350f]">
              This is the agreement exactly as sent by the client. Notice that Section 14.2 (unilateral fee forfeiture) and Section 9.4 (unlimited one-way indemnification) appear as regular black text with zero visual distinction. Click <strong>&ldquo;After (Audited)&rdquo;</strong> or click <strong>&ldquo;Run Audit Scan&rdquo;</strong> to watch ClauseGuard identify, flag, and ground every statutory violation.
            </p>
          </div>

          {/* Raw Document Body */}
          <div className="relative rounded-[16px] border border-[#dddddd] bg-white p-7 sm:p-10 shadow-[0_2px_4px_rgba(8,9,10,0.02)] overflow-hidden">
            {/* The Scanning Beam Animation */}
            {isScanning && (
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#b04000] to-transparent shadow-[0_0_12px_#b04000] z-20 pointer-events-none"
                style={{
                  animation: "scanBeam 2.2s ease-in-out infinite",
                }}
              />
            )}

            <div className="font-sans mx-auto max-w-[68ch] space-y-6 text-[15px] leading-[1.85] text-[#08090a]">
              <div className="border-b border-[#f2f2f2] pb-4 mb-6">
                <p className="text-[11px] font-mono text-[#868c98] uppercase tracking-wider">
                  Contract Excerpt &middot; Raw Client Draft (Before ClauseGuard Audit)
                </p>
                <h3 className="text-lg font-semibold text-[#08090a] mt-1">
                  Independent Contractor &amp; Intellectual Property Services Agreement
                </h3>
              </div>

              {inOrder.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-[4px] hover:bg-[#fafbfc] transition-colors"
                >
                  {c.label ? (
                    <span className="font-semibold text-[#08090a] mr-2">
                      {c.label}
                    </span>
                  ) : null}
                  <span className="text-[#1a1c1e]">{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- AFTER STATE: Audited View ---------------- */}
      {viewMode === "after" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Summary Metric Bar */}
          <Summary clauses={doc.clauses} />

          {/* Sub-Tabs: Severity Cards vs Whole Document Heat-Map */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center bg-[#f2f2f2] p-1 rounded-[4px] border border-[#dddddd]">
              <button
                onClick={() => setAfterSubTab("cards")}
                className={`px-3 py-1.5 text-xs font-medium rounded-[3px] transition-colors cursor-pointer ${
                  afterSubTab === "cards"
                    ? "bg-white text-[#08090a] shadow-sm font-semibold"
                    : "text-[#525866] hover:text-[#08090a]"
                }`}
              >
                By Severity ({ranked.length})
              </button>
              <button
                onClick={() => setAfterSubTab("document")}
                className={`px-3 py-1.5 text-xs font-medium rounded-[3px] transition-colors cursor-pointer ${
                  afterSubTab === "document"
                    ? "bg-white text-[#08090a] shadow-sm font-semibold"
                    : "text-[#525866] hover:text-[#08090a]"
                }`}
              >
                Whole Document (In-Situ)
              </button>
            </div>

            <p className="text-xs text-[#868c98] font-mono">
              {doc.clauses.length} clauses analyzed &middot; {doc.pageCount ?? 12} pages &middot; Grounded in Civil Code &amp; Labor Code
            </p>
          </div>

          {/* Content Pane 1: Ranked by Severity */}
          {afterSubTab === "cards" && (
            <div className="grid gap-4">
              {ranked.map((c) => (
                <ClauseCard key={c.id} clause={c} />
              ))}
            </div>
          )}

          {/* Content Pane 2: Whole Document In-Situ */}
          {afterSubTab === "document" && (
            <DocumentView clauses={doc.clauses} />
          )}
        </div>
      )}

      {/* Embedded CSS for scanBeam and fadeIn */}
      <style jsx>{`
        @keyframes scanBeam {
          0% {
            top: 0%;
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

export { Summary as ReviewSummary, DocumentView, VerdictBadge };
