"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Layers,
  Scale,
  ShieldCheck,
  ArrowDown,
  CheckCircle2,
  FileSearch,
  Lock,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

interface PipelineStep {
  id: string;
  number: string;
  title: string;
  badge: string;
  icon: typeof FileText;
  summary: string;
  detail: string;
  sampleInput: string;
  sampleOutput: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "ingest",
    number: "01",
    title: "Document Ingestion & OCR",
    badge: "Step 1: Ingestion",
    icon: FileText,
    summary: "Reads digital PDFs and phone camera photo scans with precision OCR.",
    detail:
      "Performs font layer analysis to detect malicious font suppression (e.g. 1pt or white-on-white text inserted to confuse reviewers).",
    sampleInput: "Freelance_Agreement_Draft_v2.pdf",
    sampleOutput: "Verified 12 pages · 0 hidden tokens · Text layer indexed",
  },
  {
    id: "segment",
    number: "02",
    title: "Covenant Segmentation",
    badge: "Step 2: Analysis",
    icon: Layers,
    summary: "Breaks continuous contract text into separate, discrete covenants.",
    detail:
      "Isolates unilateral termination clauses, unlimited indemnity, intellectual property forfeiture, and non-compete terms into independent units.",
    sampleInput: "Section 14.2: 'Client may cancel at will without notice...'",
    sampleOutput: "Clause isolated: Category 'termination.unilateral' · Ordinal #7",
  },
  {
    id: "ground",
    number: "03",
    title: "Philippine Statutory Grounding",
    badge: "Step 3: Grounding",
    icon: Scale,
    summary: "Cross-references each term against 320+ codified Philippine legal articles.",
    detail:
      "Grounds risk in published primary law: Philippine Civil Code (Contracts & Obligations), Labor Code (DOLE DO 174), and IP Code (RA 8293).",
    sampleInput: "Term violating contract mutuality principles",
    sampleOutput: "Cited: Art. 1308, Civil Code: 'The contract must bind both contracting parties.'",
  },
  {
    id: "pushback",
    number: "04",
    title: "Calibrated Risk & Redlines",
    badge: "Step 4: Output",
    icon: ShieldCheck,
    summary: "Assigns 0–100 health score and generates fair counter-proposals to send back.",
    detail:
      "Applies confidence calibration: ambiguous clauses are routed to manual review rather than guessing a verdict. Produces word-level redline diffs.",
    sampleInput: "High-risk unreciprocal cancellation stipulation",
    sampleOutput: "Fair revision: 'Either party may terminate upon 14 days' written notice with prorated payment.'",
  },
];

export function PipelineShowcase() {
  const [activeStepId, setActiveStepId] = useState<string>("ground");

  const activeStep = PIPELINE_STEPS.find((s) => s.id === activeStepId) ?? PIPELINE_STEPS[2];

  return (
    <div className="flex flex-col justify-between h-full p-8 lg:p-12 xl:p-14 bg-[#fafbfc] select-none">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between">
          <Logo size="md" theme="light" showTagline={false} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e4e8] bg-white px-2.5 py-1 text-[0.6875rem] font-semibold text-[#525866] shadow-2xs">
            <span className="size-1.5 rounded-full bg-[#b04000]" />
            Pipeline Architecture v2.4
          </span>
        </div>

        <div className="mt-8 max-w-lg">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#08090a]">
            How ClauseGuard audits your contract
          </h2>
          <p className="mt-2 text-sm text-[#525866] leading-relaxed">
            A transparent, 4-stage pipeline that tests contract covenants against verbatim Philippine statutory law — not generic AI advice.
          </p>
        </div>
      </div>

      {/* Center: System Design Pipeline Flowchart */}
      <div className="my-8 max-w-lg">
        <div className="space-y-3">
          {PIPELINE_STEPS.map((step, index) => {
            const isActive = step.id === activeStepId;
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative">
                {/* Connecting Line between stages */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-[-14px] w-[1.5px] bg-[#e2e4e8] z-0" />
                )}

                {/* Stage Card */}
                <button
                  type="button"
                  onClick={() => setActiveStepId(step.id)}
                  className={`relative z-10 w-full text-left rounded-xl p-4 transition-all cursor-pointer flex items-start gap-3.5 border ${
                    isActive
                      ? "bg-white border-[#b04000] shadow-sm ring-1 ring-[#b04000]/15"
                      : "bg-white/80 border-[#e5e7eb] hover:bg-white hover:border-[#d1d5db]"
                  }`}
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-[#b04000] text-white shadow-2xs"
                        : "bg-[#f4f5f7] text-[#525866]"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[0.6875rem] font-bold text-[#b04000]">
                          {step.number}
                        </span>
                        <h3 className="font-display text-sm font-semibold text-[#08090a]">
                          {step.title}
                        </h3>
                      </div>
                      <span
                        className={`text-[0.625rem] font-medium px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-[#fbeee4] text-[#b04000] font-semibold"
                            : "bg-[#f4f5f7] text-[#868c98]"
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[#525866] leading-relaxed line-clamp-1">
                      {step.summary}
                    </p>

                    {/* Expanded details when active */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-[#f2f2f2] text-xs space-y-2"
                      >
                        <p className="text-[#525866] leading-relaxed">{step.detail}</p>
                        <div className="rounded-lg bg-[#fafbfc] border border-[#e2e4e8] p-2.5 font-mono text-[0.6875rem] space-y-1">
                          <div className="text-[#868c98]">
                            <span className="font-semibold text-[#525866]">Input:</span> {step.sampleInput}
                          </div>
                          <div className="text-[#b04000]">
                            <span className="font-semibold text-[#525866]">Output:</span> {step.sampleOutput}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Legal Trust Guarantees */}
      <div className="border-t border-[#e2e4e8] pt-5">
        <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Scale className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">320+ Statutes</p>
              <p className="text-[0.6875rem] text-[#868c98]">Civil &amp; Labor Code</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Lock className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">RA 10173</p>
              <p className="text-[0.6875rem] text-[#868c98]">Data Privacy Act</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">0% AI Training</p>
              <p className="text-[0.6875rem] text-[#868c98]">Ephemeral Isolation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
