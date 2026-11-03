"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Layers,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Lock,
  FileCode,
  Search,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

interface PipelineStep {
  id: "ingest" | "segment" | "ground" | "pushback";
  number: string;
  title: string;
  badge: string;
  icon: typeof FileText;
  summary: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "ingest",
    number: "01",
    title: "Document Ingestion & OCR",
    badge: "Step 1: Ingestion",
    icon: FileText,
    summary: "Reads digital PDFs & camera photo scans with anti-tampering font verification.",
  },
  {
    id: "segment",
    number: "02",
    title: "Covenant Segmentation",
    badge: "Step 2: Segmentation",
    icon: Layers,
    summary: "Isolates unilateral cancellation, uncapped indemnity, and IP capture covenants.",
  },
  {
    id: "ground",
    number: "03",
    title: "Philippine Statutory Grounding",
    badge: "Step 3: Grounding",
    icon: Scale,
    summary: "Cross-references each covenant against 320+ Civil Code and Labor Code articles.",
  },
  {
    id: "pushback",
    number: "04",
    title: "Calibrated Risk & Redlines",
    badge: "Step 4: Output",
    icon: ShieldCheck,
    summary: "Generates 0–100 health score, calibrated risk, and fair counter-proposals.",
  },
];

export function PipelineShowcase() {
  const [activeStepId, setActiveStepId] = useState<PipelineStep["id"]>("ground");
  const [copied, setCopied] = useState(false);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col justify-between h-full p-6 lg:p-8 xl:p-10 bg-[#fafbfc] select-none">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
          <Logo size="md" theme="light" showTagline={false} />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e4e8] bg-white px-2.5 py-0.5 text-[0.6875rem] font-semibold text-[#525866] shadow-2xs">
              <span className="size-1.5 rounded-full bg-[#0c8c5e]" />
              System Architecture v2.4
            </span>
          </div>
        </div>

        <div className="mt-5">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#08090a]">
            How ClauseGuard audits your contract
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#525866]">
            A 4-stage pipeline that tests contract covenants against verbatim Philippine statutory law — not hallucinations.
          </p>
        </div>
      </div>

      {/* Main 2-Column Architecture Workbench (Fills the wide middle space!) */}
      <div className="my-6 grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: 4 Connected Pipeline Stages */}
        <div className="xl:col-span-5 flex flex-col justify-between gap-2.5">
          {PIPELINE_STEPS.map((step, index) => {
            const isActive = step.id === activeStepId;
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative">
                {/* Connector line between steps */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <div className="absolute left-5 top-11 bottom-[-10px] w-[1.5px] bg-[#e5e7eb] z-0" />
                )}

                <button
                  type="button"
                  onClick={() => setActiveStepId(step.id)}
                  className={`relative z-10 w-full text-left rounded-xl p-3.5 transition-all cursor-pointer flex items-start gap-3 border ${
                    isActive
                      ? "bg-white border-[#b04000] shadow-xs ring-1 ring-[#b04000]/20"
                      : "bg-white/70 border-[#e5e7eb] hover:bg-white hover:border-[#d1d5db]"
                  }`}
                >
                  <div
                    className={`flex size-7.5 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-[#b04000] text-white shadow-2xs"
                        : "bg-[#f4f5f7] text-[#525866]"
                    }`}
                  >
                    <Icon className="size-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[0.625rem] font-bold text-[#b04000]">
                          {step.number}
                        </span>
                        <h3 className="font-display text-xs font-semibold text-[#08090a] truncate">
                          {step.title}
                        </h3>
                      </div>
                      <span
                        className={`text-[0.5625rem] font-medium px-1.5 py-0.2 rounded ${
                          isActive
                            ? "bg-[#fbeee4] text-[#b04000] font-semibold"
                            : "bg-[#f4f5f7] text-[#868c98]"
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>

                    <p className="mt-1 text-[0.6875rem] text-[#525866] leading-relaxed line-clamp-2">
                      {step.summary}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Architecture Stage Visualizer (Fills the wide space in the middle!) */}
        <div className="xl:col-span-7 flex flex-col">
          <div className="flex-1 rounded-2xl border border-[#e2e4e8] bg-white p-5 shadow-xs flex flex-col justify-between">
            {/* Inspector Header */}
            <div>
              <div className="flex items-center justify-between border-b border-[#f2f2f2] pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#0c8c5e] animate-pulse" />
                  <span className="font-mono text-[0.6875rem] font-bold text-[#b04000] uppercase tracking-wider">
                    {activeStepId === "ingest" && "Live Stage 01 · Extraction Engine"}
                    {activeStepId === "segment" && "Live Stage 02 · Covenant Index"}
                    {activeStepId === "ground" && "Live Stage 03 · Statutory Grounding"}
                    {activeStepId === "pushback" && "Live Stage 04 · Redline Engine"}
                  </span>
                </div>
                <span className="rounded bg-[#f4f5f7] px-2 py-0.5 font-mono text-[0.625rem] font-medium text-[#525866]">
                  Active Telemetry
                </span>
              </div>

              {/* Dynamic Stage Body */}
              <div className="mt-4">
                <AnimatePresence mode="wait">
                  {/* STAGE 1: INGESTION & OCR */}
                  {activeStepId === "ingest" && (
                    <motion.div
                      key="ingest"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="rounded-xl border border-[#e5e7eb] bg-[#fafbfc] p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#868c98] font-medium">Uploaded File:</span>
                          <span className="font-mono font-semibold text-[#08090a]">Freelance_Service_Contract.pdf</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#868c98] font-medium">Extracted Text:</span>
                          <span className="font-mono font-semibold text-[#08090a]">4,820 tokens · 12 pages</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#868c98] font-medium">Anti-Tampering Scan:</span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#0c8c5e]">
                            <CheckCircle2 className="size-3.5" />
                            0 hidden tokens (Passed)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#868c98] font-medium">Privacy Protocol:</span>
                          <span className="font-mono text-[0.6875rem] text-[#b04000]">Zero-retention ephemeral memory</span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-dashed border-[#d1d5db] bg-white p-3 text-[0.6875rem] text-[#525866] leading-relaxed">
                        <span className="font-semibold text-[#08090a]">Tampering Defense:</span> Proprietary font-geometry analysis identifies invisible 1pt font and white-on-white text that bad actors embed to manipulate model output.
                      </div>
                    </motion.div>
                  )}

                  {/* STAGE 2: SEGMENTATION */}
                  {activeStepId === "segment" && (
                    <motion.div
                      key="segment"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5"
                    >
                      <p className="text-xs text-[#525866]">
                        Continuous text is segmented into discrete legal covenants:
                      </p>

                      <div className="space-y-2 font-mono text-[0.6875rem]">
                        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 p-2 text-red-900">
                          <span className="font-bold">§ 14.2 termination.unilateral</span>
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[0.625rem] font-bold text-red-700">Flagged</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/50 p-2 text-red-900">
                          <span className="font-bold">§ 9.1 indemnity.uncapped</span>
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[0.625rem] font-bold text-red-700">Flagged</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-2 text-amber-900">
                          <span className="font-bold">§ 6.3 ip.assignment.broad</span>
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[0.625rem] font-bold text-amber-700">Check</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/50 p-2 text-emerald-900">
                          <span className="font-bold">§ 3.1 payment.schedule</span>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[0.625rem] font-bold text-emerald-700">Standard</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STAGE 3: STATUTORY GROUNDING */}
                  {activeStepId === "ground" && (
                    <motion.div
                      key="ground"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div className="rounded-xl border border-[#e8c6a8] bg-[#fbf6f1] p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#b04000]">
                            <Scale className="size-3.5 text-[#b04000]" />
                            <span>Art. 1308, Civil Code of the Philippines</span>
                          </div>
                          <span className="rounded-full bg-[#b04000] px-2 py-0.2 font-mono text-[0.625rem] font-semibold text-white">
                            Primary Law
                          </span>
                        </div>

                        <p className="font-contract text-xs text-[#08090a] leading-relaxed italic border-l-2 border-[#b04000] pl-2.5">
                          &ldquo;The contract must bind both contracting parties; its validity or compliance cannot be left to the will of one of them.&rdquo;
                        </p>

                        <div className="pt-1 text-[0.6875rem] text-[#7a2e02] leading-relaxed">
                          <span className="font-bold">Doctrine of Mutuality:</span> A unilateral termination clause that permits the client to cancel without reciprocal rights or prorated compensation is void under Philippine law.
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[0.6875rem] text-[#868c98] font-mono px-1">
                        <span>Corpus: 320 provisions indexed</span>
                        <span className="text-[#0c8c5e] font-semibold">94% Confidence Match</span>
                      </div>
                    </motion.div>
                  )}

                  {/* STAGE 4: RISK & PUSHBACK */}
                  {activeStepId === "pushback" && (
                    <motion.div
                      key="pushback"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {/* Flagged Clause */}
                      <div className="rounded-lg border border-[#e5e7eb] bg-[#fafbfc] p-3">
                        <div className="text-[0.625rem] font-mono font-bold text-red-700 uppercase tracking-wider">
                          Flagged Draft Language
                        </div>
                        <p className="mt-1 text-xs text-[#08090a] italic font-contract leading-relaxed">
                          &ldquo;Company reserves unilateral right to cancel at any time without notice or payment for pending work.&rdquo;
                        </p>
                      </div>

                      {/* Fair Redline Suggestion */}
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.625rem] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                            Fair Counter-Proposal (Word Diff)
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                "Either party may terminate this agreement upon 14 days' written notice, subject to full compensation for all approved deliverables completed to date."
                              )
                            }
                            className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer"
                          >
                            {copied ? (
                              <>
                                <Check className="size-3 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" />
                                <span>Copy Counter-Clause</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-emerald-950 font-mono leading-relaxed">
                          &ldquo;Either party may terminate this agreement upon 14 days&rsquo; written notice, subject to full compensation for all approved deliverables completed to date.&rdquo;
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Inspector Footer Status */}
            <div className="mt-4 pt-3 border-t border-[#f2f2f2] flex items-center justify-between text-[0.6875rem] text-[#868c98]">
              <span>Grounding Arm: Static + Vector RAG</span>
              <span className="text-[#08090a] font-medium">Click any step on the left to inspect</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Trust Row */}
      <div className="border-t border-[#e5e7eb] pt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2.5">
            <Scale className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">320+ Statutes</p>
              <p className="text-[0.6875rem] text-[#868c98]">Civil Code &amp; Labor Code</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Lock className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">RA 10173</p>
              <p className="text-[0.6875rem] text-[#868c98]">Data Privacy Act of 2012</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">0% AI Training</p>
              <p className="text-[0.6875rem] text-[#868c98]">Zero-Retention Ephemeral</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
