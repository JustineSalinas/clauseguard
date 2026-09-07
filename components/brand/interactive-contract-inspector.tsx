"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Scale,
  ShieldAlert,
  ArrowRight,
  UploadCloud,
  FileUp,
  Loader2,
  Check,
  Play,
} from "lucide-react";

interface ClauseItem {
  id: string;
  clauseNumber: string;
  title: string;
  category: string;
  risk: "high" | "caution" | "clear";
  confidence: number;
  contractSnippet: string;
  flaggedText: string;
  plainSummary: string;
  statuteTitle: string;
  statuteArticle: string;
  statuteExplanation: string;
  redlineRecommendation: string;
  requiresReview?: boolean;
}

const SAMPLE_CLAUSES: ClauseItem[] = [
  {
    id: "termination",
    clauseNumber: "Section 14.2",
    title: "Termination for Convenience & Fee Forfeiture",
    category: "Termination & Remuneration",
    risk: "high",
    confidence: 96,
    contractSnippet:
      "The Client may terminate this Agreement at any time, for any reason or no reason, effective immediately upon written notice. The Contractor may not terminate this Agreement prior to Final Deliverable acceptance, and shall forfeit all accrued but unpaid fees upon any such attempted termination.",
    flaggedText:
      "for any reason or no reason, effective immediately upon written notice... and shall forfeit all accrued but unpaid fees",
    plainSummary:
      "The client can walk away at any moment without penalty, while you are barred from leaving and forfeit earned pay for work already completed.",
    statuteTitle: "Civil Code of the Philippines",
    statuteArticle: "Article 1308 (Mutuality of Contracts)",
    statuteExplanation:
      "Under Art. 1308, contract validity and compliance cannot be left to the will of one party. Unilateral termination without cause coupled with complete forfeiture of accrued earnings is void as contrary to equity and public policy (Arts. 1306, 1409).",
    redlineRecommendation:
      "Require 14 days written notice for both parties and mandate immediate payment for all hours or milestones completed up to the termination date.",
  },
  {
    id: "indemnity",
    clauseNumber: "Section 9.4",
    title: "Unlimited One-Way Indemnification",
    category: "Liability & Damages",
    risk: "high",
    confidence: 93,
    contractSnippet:
      "Contractor agrees to indemnify, defend, and hold harmless the Client, its officers, agents, and affiliates against any and all losses, claims, damages, liabilities, and expenses (including unrestricted attorney fees) arising from any performance under this Agreement, without limitation of liability.",
    flaggedText:
      "indemnify, defend, and hold harmless... against any and all losses... without limitation of liability",
    plainSummary:
      "You assume unlimited legal and financial responsibility for anything that goes wrong, including claims not caused by your direct negligence.",
    statuteTitle: "Civil Code of the Philippines",
    statuteArticle: "Article 1170 & Article 2201 (Damages)",
    statuteExplanation:
      "A contracting party cannot be held responsible for fortuitous events or consequential damages beyond what was foreseeable at the time of contract execution, unless bad faith or fraud is affirmatively proven.",
    redlineRecommendation:
      "Cap total contractor liability to fees actually received under the statement of work, and exclude indirect/consequential damages.",
  },
  {
    id: "noncompete",
    clauseNumber: "Section 12.1",
    title: "24-Month Nationwide Non-Compete",
    category: "Restraint of Trade",
    risk: "caution",
    confidence: 74,
    contractSnippet:
      "For a period of twenty-four (24) months following termination, Contractor shall not directly or indirectly provide consulting, development, or creative services to any person or entity operating within the Southeast Asian region that competes with Client's business.",
    flaggedText:
      "period of twenty-four (24) months... any person or entity operating within the Southeast Asian region",
    plainSummary:
      "Prohibits you from taking freelance work across Southeast Asia in your domain for 2 years. Likely overbroad under Philippine labor jurisprudence.",
    statuteTitle: "Labor Code & Jurisprudence",
    statuteArticle: "Civil Code Art. 1306 / Century Properties v. Babiano",
    statuteExplanation:
      "Post-contract non-compete clauses are scrutinized for unreasonable restraint of trade. A 24-month duration across an entire subcontinent without territorial compensation is presumptively oppressive and unenforceable.",
    redlineRecommendation:
      "Narrow the non-compete to specific direct competitors, reduce duration to 6 months max, and confine scope strictly to the direct trade secrets used.",
    requiresReview: true,
  },
  {
    id: "milestones",
    clauseNumber: "Section 4.1",
    title: "Milestone Deliverables & Net-15 Invoicing",
    category: "Compensation Schedule",
    risk: "clear",
    confidence: 98,
    contractSnippet:
      "Client shall remit milestone payments within fifteen (15) calendar days of receiving each completed invoice and deliverable approval. Any disputed item must be reported in writing within 5 business days with specific reasons provided.",
    flaggedText: "within fifteen (15) calendar days... disputed item must be reported in writing",
    plainSummary:
      "Clear, mutual payment schedule with reasonable Net-15 turnaround and mandatory written feedback for disputes. Standard balanced term.",
    statuteTitle: "Civil Code of the Philippines",
    statuteArticle: "Article 1159 (Obligations Arising from Contract)",
    statuteExplanation:
      "Complies with reciprocal obligations standard. Mutual rights and obligations are clearly defined with an objective timeline.",
    redlineRecommendation: "Clause is balanced. No redline required.",
  },
];

export function InteractiveContractInspector() {
  const [activeTab, setActiveTab] = useState<"sample" | "upload">("sample");
  const [activeId, setActiveId] = useState<string>("termination");
  const [inspectorMode, setInspectorMode] = useState<"before" | "after">("after");
  const [isHeroScanning, setIsHeroScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingState, setUploadingState] = useState<
    "idle" | "uploading" | "segmenting" | "grounding" | "done"
  >("idle");
  const [droppedFileName, setDroppedFileName] = useState<string | null>(null);

  const activeClause =
    SAMPLE_CLAUSES.find((c) => c.id === activeId) ?? SAMPLE_CLAUSES[0];

  const triggerHeroScan = () => {
    setInspectorMode("before");
    setIsHeroScanning(true);
    setTimeout(() => {
      setIsHeroScanning(false);
      setInspectorMode("after");
    }, 1200);
  };

  const handleSimulatedUpload = (fileName: string) => {
    setDroppedFileName(fileName);
    setUploadingState("uploading");
    setTimeout(() => {
      setUploadingState("segmenting");
      setTimeout(() => {
        setUploadingState("grounding");
        setTimeout(() => {
          setUploadingState("done");
        }, 800);
      }, 700);
    }, 600);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSimulatedUpload(e.dataTransfer.files[0].name);
    }
  };

  return (
    <div className="relative w-full max-w-[1200px] mx-auto">
      {/* Container with Mintlify 16px radius, pure white surface, and forensic shadow */}
      <div className="rounded-[16px] border border-[#dddddd] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden transition-all">
        {/* Top Header Bar with Dual-Tab Switcher (Sample Inspector vs Drag-and-Drop Dropzone) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 py-3 border-b border-[#f2f2f2] bg-[#ffffff] gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-[#f2f2f2] border border-[#dddddd]" />
              <div className="size-2.5 rounded-full bg-[#f2f2f2] border border-[#dddddd]" />
              <div className="size-2.5 rounded-full bg-[#f2f2f2] border border-[#dddddd]" />
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center bg-[#f8f9fa] p-0.5 rounded-[4px] border border-[#dddddd]">
              <button
                onClick={() => setActiveTab("sample")}
                className={`px-3 py-1 text-xs font-medium rounded-[3px] transition-colors cursor-pointer ${
                  activeTab === "sample"
                    ? "bg-white text-[#08090a] shadow-sm font-semibold"
                    : "text-[#525866] hover:text-[#08090a]"
                }`}
              >
                Marked-Up Sample Inspector
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1 text-xs font-medium rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "upload"
                    ? "bg-white text-[#08090a] shadow-sm font-semibold"
                    : "text-[#525866] hover:text-[#08090a]"
                }`}
              >
                <UploadCloud className="size-3 text-[#0c8c5e]" />
                Drag &amp; Drop Your Contract
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#0c8c5e] font-medium bg-[#eefaf4] px-2.5 py-1 rounded-[4px] border border-[#bbf0d6]">
              <span className="size-1.5 rounded-full bg-[#0c8c5e] animate-pulse" />
              Civil Code &amp; Labor Code Grounding
            </span>
            <span className="hidden sm:inline text-xs text-[#868c98] font-mono">
              R.A. 386 &middot; P.D. 442
            </span>
          </div>
        </div>

        {/* ---------------- View Mode: Drag-and-Drop Dropzone ---------------- */}
        {activeTab === "upload" && (
          <div className="p-8 sm:p-14 bg-[#ffffff]">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[12px] p-8 sm:p-12 text-center transition-all ${
                dragActive
                  ? "border-[#0c8c5e] bg-[#eefaf4]/50"
                  : "border-[#dddddd] bg-[#fcfdfd] hover:border-[#0c8c5e]/60"
              }`}
            >
              {uploadingState === "idle" && (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="size-12 rounded-[4px] bg-[#eefaf4] text-[#0c8c5e] flex items-center justify-center mx-auto">
                    <FileUp className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#08090a]">
                      Drag and drop your contract PDF or DOCX here
                    </h3>
                    <p className="text-xs text-[#525866] mt-1">
                      Direct analysis preview without requiring an account. Grounded against Philippine statutory provisions.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-[4px] bg-[#08090a] text-white px-4 py-2 text-xs font-medium hover:bg-[#1a1c1e] transition-colors shadow-sm">
                      <UploadCloud className="size-3.5 text-[#0c8c5e]" />
                      <span>Browse Files</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleSimulatedUpload(e.target.files[0].name);
                          }
                        }}
                      />
                    </label>
                    <button
                      onClick={() => handleSimulatedUpload("Freelance_Services_Agreement_2026.pdf")}
                      className="text-xs text-[#0c8c5e] hover:underline font-medium cursor-pointer"
                    >
                      Try with sample file
                    </button>
                  </div>

                  <p className="text-[11px] text-[#868c98] font-mono pt-2">
                    Private Supabase private bucket &middot; Signed URLs only &middot; Never used to train public LLMs
                  </p>
                </div>
              )}

              {uploadingState !== "idle" && (
                <div className="max-w-md mx-auto space-y-5 py-4">
                  <div className="size-12 rounded-[4px] bg-[#eefaf4] text-[#0c8c5e] flex items-center justify-center mx-auto">
                    {uploadingState === "done" ? (
                      <Check className="size-6 text-[#0c8c5e]" />
                    ) : (
                      <Loader2 className="size-6 animate-spin text-[#0c8c5e]" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#08090a]">
                      {uploadingState === "uploading" && "Uploading and validating contract..."}
                      {uploadingState === "segmenting" && "Executing OCR and deterministic segmentation..."}
                      {uploadingState === "grounding" && "Grounding clauses in Civil Code and Labor Code..."}
                      {uploadingState === "done" && "Segmentation & Grounding Complete!"}
                    </h3>
                    <p className="text-xs text-[#525866] mt-1 font-mono">
                      File: {droppedFileName}
                    </p>
                  </div>

                  {/* Progress tracker */}
                  <div className="space-y-2 text-left bg-white p-4 rounded-[6px] border border-[#dddddd] text-xs">
                    <div className="flex items-center justify-between text-[#525866]">
                      <span>Stage 1: Extract &amp; Layout Tokens</span>
                      <span className="font-semibold text-[#0c8c5e]">Done</span>
                    </div>
                    <div className="flex items-center justify-between text-[#525866]">
                      <span>Stage 2: Deterministic Clause Segmentation</span>
                      <span className="font-semibold text-[#0c8c5e]">
                        {uploadingState === "uploading" ? "Pending" : "Done"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#525866]">
                      <span>Stage 3: Statutory Grounding (pgvector)</span>
                      <span className="font-semibold text-[#0c8c5e]">
                        {uploadingState === "grounding" || uploadingState === "done"
                          ? "Grounding Arts. 1308, 1170..."
                          : "Queued"}
                      </span>
                    </div>
                  </div>

                  {uploadingState === "done" && (
                    <div className="pt-2 flex items-center justify-center gap-3">
                      <Link
                        href="/sample"
                        className="inline-flex items-center gap-2 rounded-[4px] bg-[#08090a] text-white px-5 py-2.5 text-xs font-medium hover:bg-[#1a1c1e] transition-colors"
                      >
                        <span>Open Instant Marked-Up Preview</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                      <button
                        onClick={() => setUploadingState("idle")}
                        className="text-xs text-[#525866] hover:text-[#000000] cursor-pointer"
                      >
                        Upload another
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- View Mode: Marked-Up Sample Inspector ---------------- */}
        {activeTab === "sample" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          {/* Column 1: Clause Sidebar (Mintlify sidebar discipline: 4px/16px geometry, Mint Green active state) */}
          <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#f2f2f2] bg-[#ffffff] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#f2f2f2]">
                <span className="text-[11px] font-semibold text-[#868c98] uppercase tracking-[0.05em]">
                  Detected Clauses ({SAMPLE_CLAUSES.length})
                </span>
                <span className="text-[11px] text-[#525866]">Page 6 of 12</span>
              </div>

              <div className="space-y-1">
                {SAMPLE_CLAUSES.map((item) => {
                  const isActive = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveId(item.id)}
                      className={`w-full text-left p-2.5 rounded-[4px] transition-colors cursor-pointer flex flex-col gap-1 ${
                        isActive
                          ? "bg-[#eefaf4] text-[#0c8c5e] font-medium"
                          : "hover:bg-[#f8f9fa] text-[#000000]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[#868c98]">
                          {item.clauseNumber}
                        </span>
                        {item.risk === "high" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-[3px] bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]">
                            HIGH RISK
                          </span>
                        )}
                        {item.risk === "caution" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-[3px] bg-[#fffbeb] text-[#d97706] border border-[#fde68a]">
                            CAUTION
                          </span>
                        )}
                        {item.risk === "clear" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-[3px] bg-[#eefaf4] text-[#0c8c5e] border border-[#bbf0d6]">
                            CLEAR
                          </span>
                        )}
                      </div>
                      <span className="text-xs leading-snug line-clamp-1">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Footnote with Calibration Metric */}
            <div className="mt-4 pt-3 border-t border-[#f2f2f2] bg-[#f8f9fa] p-2.5 rounded-[4px]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#525866]">Confidence Calibration</span>
                <span className="font-mono font-semibold text-[#08090a]">
                  {activeClause.confidence}%
                </span>
              </div>
              <div className="w-full bg-[#dddddd] h-1 rounded-[2px] mt-1.5 overflow-hidden">
                <div
                  className="bg-[#0c8c5e] h-full transition-all duration-300"
                  style={{ width: `${activeClause.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Contract Parchment Reading Pane with Before & After Transition */}
          <div className="relative lg:col-span-5 p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-[#f2f2f2] bg-[#ffffff] overflow-y-auto">
            {/* The Scanning Beam Animation (when hero scan is running) */}
            {isHeroScanning && (
              <div
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0c8c5e] to-transparent shadow-[0_0_12px_#0c8c5e] z-20 pointer-events-none"
                style={{
                  animation: "scanBeam 1.2s ease-in-out infinite",
                }}
              />
            )}

            <div className="flex items-center justify-between text-xs text-[#868c98] mb-3 pb-2 border-b border-[#f2f2f2]">
              <span className="font-mono">FREELANCE MASTER SERVICES AGREEMENT</span>
              <span className="font-mono">PARAGRAPH 14</span>
            </div>

            {/* Before / After Toggle Bar inside Reading Pane */}
            <div className="flex items-center justify-between gap-2 mb-4 bg-[#f8f9fa] p-1.5 rounded-[6px] border border-[#dddddd]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setInspectorMode("before")}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-[3px] transition-colors cursor-pointer ${
                    inspectorMode === "before" && !isHeroScanning
                      ? "bg-white text-[#08090a] shadow-xs font-semibold"
                      : "text-[#525866] hover:text-[#08090a]"
                  }`}
                >
                  Before (Raw Draft)
                </button>
                <button
                  onClick={() => setInspectorMode("after")}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                    inspectorMode === "after"
                      ? "bg-white text-[#08090a] shadow-xs font-semibold"
                      : "text-[#525866] hover:text-[#08090a]"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-[#0c8c5e]" />
                  After (Audited)
                </button>
              </div>

              <button
                onClick={triggerHeroScan}
                disabled={isHeroScanning}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[3px] bg-[#08090a] text-white text-[11px] font-medium hover:bg-[#1a1c1e] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isHeroScanning ? (
                  <span className="size-2.5 border border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="size-2.5 text-[#0c8c5e] fill-current" />
                )}
                <span>{isHeroScanning ? "Scanning..." : "Scan"}</span>
              </button>
            </div>

            {/* Reading Content */}
            <div className="font-sans text-[14px] sm:text-[15px] leading-relaxed text-[#000000] space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[#868c98] text-xs uppercase tracking-wider font-semibold">
                  {inspectorMode === "before" ? "Raw Contract Text (Unaudited)" : "Audited Contract Text"}
                </p>
                {inspectorMode === "before" ? (
                  <span className="text-[10px] font-mono text-[#d97706] bg-[#fffbeb] px-1.5 py-0.5 rounded-[2px] border border-[#fde68a]">
                    Boilerplate disguise
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#0c8c5e] bg-[#eefaf4] px-1.5 py-0.5 rounded-[2px] border border-[#bbf0d6]">
                    Heat-map active
                  </span>
                )}
              </div>

              <div className="p-4 rounded-[6px] border border-[#f2f2f2] bg-[#fafbfc] relative">
                <span className="font-mono text-xs font-semibold text-[#525866] block mb-2">
                  {activeClause.clauseNumber}: {activeClause.title}
                </span>

                {inspectorMode === "before" ? (
                  <p className="leading-[1.7] text-[#08090a]">
                    {activeClause.contractSnippet}
                  </p>
                ) : (
                  <p className="leading-[1.7] text-[#08090a]">
                    {activeClause.contractSnippet.split(activeClause.flaggedText)[0]}
                    <mark
                      className={`px-1 py-0.5 rounded-[2px] font-medium transition-colors ${
                        activeClause.risk === "high"
                          ? "bg-[#fee2e2] text-[#991b1b] border-b-2 border-[#dc2626]"
                          : activeClause.risk === "caution"
                          ? "bg-[#fef3c7] text-[#92400e] border-b-2 border-[#d97706]"
                          : "bg-[#d1fae5] text-[#065f46] border-b-2 border-[#0c8c5e]"
                      }`}
                    >
                      {activeClause.flaggedText}
                    </mark>
                    {activeClause.contractSnippet.split(activeClause.flaggedText)[1]}
                  </p>
                )}
              </div>

              <div className="pt-1">
                {inspectorMode === "before" ? (
                  <div className="bg-[#fffbeb] p-3 rounded-[4px] border border-[#fde68a] text-xs text-[#92400e] leading-relaxed">
                    <strong>Notice:</strong> In this raw draft, severe risks (like full fee forfeiture upon cancellation) look completely harmless. Switch to <strong>After</strong> or click <strong>Scan</strong> to see how ClauseGuard flags it.
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#868c98] block mb-1.5">
                      Plain-Language Assessment
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#000000] bg-[#ffffff] p-3 rounded-[4px] border border-[#dddddd]">
                      {activeClause.plainSummary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Forensic Legal Grounding & Redline Drawer */}
          <div className="lg:col-span-4 p-6 lg:p-7 bg-[#fcfdfd] flex flex-col justify-between">
            <div className="space-y-4">
              {/* Verdict Header with calibrated tag */}
              <div className="flex items-center justify-between pb-3 border-b border-[#f2f2f2]">
                <div className="flex items-center gap-2">
                  {inspectorMode === "before" ? (
                    <AlertTriangle className="size-4 text-[#d97706]" />
                  ) : activeClause.risk === "high" ? (
                    <ShieldAlert className="size-4 text-[#dc2626]" />
                  ) : activeClause.risk === "caution" ? (
                    <AlertTriangle className="size-4 text-[#d97706]" />
                  ) : (
                    <CheckCircle2 className="size-4 text-[#0c8c5e]" />
                  )}
                  <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#08090a]">
                    {inspectorMode === "before" ? "Audit Status" : "Risk Classification"}
                  </span>
                </div>

                {inspectorMode === "before" ? (
                  <span className="text-[10px] font-medium bg-[#fffbeb] text-[#d97706] px-2 py-0.5 rounded-[3px] border border-[#fde68a]">
                    Pending Audit
                  </span>
                ) : activeClause.requiresReview ? (
                  <span className="text-[10px] font-medium bg-[#fffbeb] text-[#d97706] px-2 py-0.5 rounded-[3px] border border-[#fde68a]">
                    Routed to Human Review
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-medium text-[#0c8c5e] bg-[#eefaf4] px-2 py-0.5 rounded-[3px] border border-[#bbf0d6]">
                    Verified Grounding
                  </span>
                )}
              </div>

              {inspectorMode === "before" ? (
                <div className="p-4 rounded-[6px] border border-[#dddddd] bg-white space-y-3">
                  <p className="text-xs font-semibold text-[#08090a]">
                    Statutory Grounding Inactive
                  </p>
                  <p className="text-xs leading-relaxed text-[#525866]">
                    The raw draft does not connect legal provisions to your protection. Run the audit scan to ground this clause against Philippine Civil Code and Labor Code jurisprudence.
                  </p>
                  <button
                    onClick={triggerHeroScan}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#0c8c5e] text-white text-xs font-medium hover:bg-[#0aa36b] transition-colors cursor-pointer"
                  >
                    <Play className="size-3 fill-current" />
                    <span>Run Statutory Audit Scan</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Statutory Grounding Card */}
                  <div className="rounded-[4px] border border-[#dddddd] bg-white p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0c8c5e]">
                      <Scale className="size-3.5" />
                      <span>{activeClause.statuteTitle}</span>
                    </div>
                    <div className="text-xs font-mono font-medium text-[#08090a]">
                      {activeClause.statuteArticle}
                    </div>
                    <p className="text-xs leading-relaxed text-[#525866]">
                      {activeClause.statuteExplanation}
                    </p>
                  </div>

                  {/* Recommended Redline Action */}
                  <div className="rounded-[4px] border border-[#dddddd] bg-white p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#08090a]">
                      <FileText className="size-3.5 text-[#0c8c5e]" />
                      <span>Actionable Redline</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#525866]">
                      {activeClause.redlineRecommendation}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Action Link */}
            <div className="pt-4 border-t border-[#f2f2f2]">
              <Link
                href="/sample"
                className="inline-flex items-center justify-between w-full p-2.5 rounded-[4px] bg-[#08090a] text-white text-xs font-medium hover:bg-[#1a1c1e] transition-colors shadow-[0_2px_4px_rgba(8,9,10,0.04)]"
              >
                <span>View Complete Before &amp; After Review</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
        )}
      </div>

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
      `}</style>
    </div>
  );
}
