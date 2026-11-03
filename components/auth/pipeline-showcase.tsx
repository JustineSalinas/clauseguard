"use client";

import { useState, useEffect, useCallback } from "react";
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
  Lock,
  Play,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

interface PipelineStep {
  id: "ingest" | "segment" | "ground" | "pushback";
  stepNumber: string;
  name: string;
  shortName: string;
  badge: string;
  icon: typeof FileText;
  tagline: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "ingest",
    stepNumber: "01",
    name: "Document Ingestion & OCR",
    shortName: "Ingestion & OCR",
    badge: "Step 1: Document Verification",
    icon: FileText,
    tagline: "PDF & photo scan anti-tampering verification",
  },
  {
    id: "segment",
    stepNumber: "02",
    name: "Covenant Segmentation",
    shortName: "Segmentation",
    badge: "Step 2: Covenant Isolation",
    icon: Layers,
    tagline: "Extracts individual obligations & terms",
  },
  {
    id: "ground",
    stepNumber: "03",
    name: "Philippine Statutory Grounding",
    shortName: "Statutory Grounding",
    badge: "Step 3: Philippine Law Audit",
    icon: Scale,
    tagline: "Cross-references against 320+ codified statutes",
  },
  {
    id: "pushback",
    stepNumber: "04",
    name: "Calibrated Risk & Redlines",
    shortName: "Fair Redlines",
    badge: "Step 4: Output & Pushback",
    icon: ShieldCheck,
    tagline: "Generates protective counter-proposals",
  },
];

const STEP_DURATION_MS = 5000;

export function PipelineShowcase() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const activeStep = PIPELINE_STEPS[currentStepIndex];

  // Auto-advance loop: advance to next step every STEP_DURATION_MS unless paused or hovered
  useEffect(() => {
    if (!isPlaying || isHovered) return;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % PIPELINE_STEPS.length);
    }, STEP_DURATION_MS);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, currentStepIndex]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleStepSelect = (index: number) => {
    setCurrentStepIndex(index);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div
      className="flex flex-col justify-between h-full p-6 lg:p-8 xl:p-10 bg-[#fafbfc] select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Header with Logo & Live Visual Pipeline Status */}
      <div>
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
          <Logo size="md" theme="light" showTagline={false} />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e4e8] bg-white px-2.5 py-1 text-[0.6875rem] font-semibold text-[#525866] shadow-2xs">
              <span className="size-1.5 rounded-full bg-[#0c8c5e] animate-pulse" />
              Live Visual Pipeline
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#08090a]">
            How ClauseGuard audits your contract
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#525866]">
            Watch our automated 4-stage engine evaluate contract covenants against codified Philippine law — hands-free.
          </p>
        </div>
      </div>

      {/* 2. Visual Pipeline Flow Bar (Auto-advancing connected stepper) */}
      <div className="my-5">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {PIPELINE_STEPS.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isPassed = idx < currentStepIndex;
            const StepIcon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepSelect(idx)}
                className={`group relative text-left rounded-xl p-2.5 sm:p-3 transition-all cursor-pointer border ${
                  isActive
                    ? "bg-white border-[#b04000] shadow-sm ring-1 ring-[#b04000]/25"
                    : isPassed
                    ? "bg-white/80 border-[#d1d5db] hover:border-[#b04000]/40"
                    : "bg-[#f4f5f7]/60 border-[#e5e7eb] hover:bg-white hover:border-[#d1d5db]"
                }`}
                title={`Jump to ${step.name}`}
              >
                {/* Visual Progress Bar on the active step */}
                {isActive && isPlaying && !isHovered && (
                  <motion.div
                    key={`progress-${idx}`}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: STEP_DURATION_MS / 1000, ease: "linear" }}
                    className="absolute top-0 left-0 h-[2.5px] bg-[#b04000] rounded-t-xl"
                  />
                )}
                {isActive && (!isPlaying || isHovered) && (
                  <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#b04000] rounded-t-xl" />
                )}

                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <div
                    className={`flex size-5 sm:size-6 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-bold transition-colors ${
                      isActive
                        ? "bg-[#b04000] text-white shadow-2xs"
                        : isPassed
                        ? "bg-[#0c8c5e]/15 text-[#0c8c5e]"
                        : "bg-[#e5e7eb] text-[#6b7280]"
                    }`}
                  >
                    {isPassed ? <Check className="size-3 stroke-[2.5]" /> : <StepIcon className="size-3" />}
                  </div>
                  <span
                    className={`font-mono text-[0.625rem] font-bold ${
                      isActive ? "text-[#b04000]" : "text-[#6b7280]"
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                </div>

                <p
                  className={`font-display text-[0.6875rem] sm:text-xs font-semibold truncate ${
                    isActive ? "text-[#08090a]" : "text-[#525866]"
                  }`}
                >
                  {step.shortName}
                </p>
              </button>
            );
          })}
        </div>

        {/* Visual Connector Wire with Arrow indicators */}
        <div className="mt-2 flex items-center justify-between px-2 text-[0.625rem] font-mono text-[#868c98]">
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[#b04000]" />
            <span>Raw PDF Scan</span>
          </div>
          <ArrowRight className="size-3 text-[#d1d5db]" />
          <span>Extracted Clauses</span>
          <ArrowRight className="size-3 text-[#d1d5db]" />
          <span>Statutory Articles</span>
          <ArrowRight className="size-3 text-[#d1d5db]" />
          <div className="flex items-center gap-1 text-[#0c8c5e] font-semibold">
            <CheckCircle2 className="size-3" />
            <span>Protected Redline</span>
          </div>
        </div>
      </div>

      {/* 3. The Visual Stage Workbench: Real-time simulation of the active step */}
      <div className="my-auto flex-1 min-h-[300px] flex flex-col justify-center">
        <div className="rounded-2xl border border-[#e2e4e8] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          {/* Workbench Top Bar */}
          <div className="flex items-center justify-between border-b border-[#f2f2f2] pb-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#b04000] animate-pulse" />
              <span className="font-mono text-[0.6875rem] font-bold text-[#b04000] uppercase tracking-wider">
                {activeStep.badge}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#f4f5f7] px-2 py-0.5 font-mono text-[0.625rem] font-medium text-[#525866]">
                {activeStep.id === "ingest" && "OCR Engine: Active"}
                {activeStep.id === "segment" && "Regex + Parser: Active"}
                {activeStep.id === "ground" && "Corpus: 320+ Statutes"}
                {activeStep.id === "pushback" && "Redline Diff: Ready"}
              </span>
            </div>
          </div>

          {/* Workbench Dynamic Body */}
          <div className="py-4">
            <AnimatePresence mode="wait">
              {/* STAGE 1: DOCUMENT INGESTION & ANTI-TAMPERING OCR */}
              {activeStep.id === "ingest" && (
                <motion.div
                  key="stage-ingest"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3.5"
                >
                  <div className="flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-[#fafbfc] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-white border border-[#e2e4e8] text-[#b04000] shadow-2xs">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <p className="font-display text-xs font-semibold text-[#08090a]">
                          Freelance_Agreement_Draft_v2.pdf
                        </p>
                        <p className="text-[0.6875rem] text-[#868c98]">
                          12 pages · 4,820 words · Coordinate bounding boxes indexed
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[0.625rem] font-semibold text-emerald-800">
                      Clean Scan
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-lg border border-[#e5e7eb] bg-white p-3 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[#08090a]">
                        <CheckCircle2 className="size-3.5 text-[#0c8c5e]" />
                        <span>Anti-Tampering Pass</span>
                      </div>
                      <p className="text-[0.6875rem] text-[#525866] leading-relaxed">
                        0 hidden tokens detected. Scanned for microscopic 1pt fonts &amp; white-on-white text designed to deceive reviewers.
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#e5e7eb] bg-white p-3 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[#08090a]">
                        <Lock className="size-3.5 text-[#b04000]" />
                        <span>Zero Data Retention</span>
                      </div>
                      <p className="text-[0.6875rem] text-[#525866] leading-relaxed">
                        Compliant with RA 10173 (Data Privacy Act). Contract text resides in ephemeral memory and is never used for training.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[0.6875rem] text-[#868c98] pt-1 border-t border-[#f2f2f2]">
                    <span>Status: Text stream normalized</span>
                    <span className="font-medium text-[#b04000]">Streaming to Covenant Segmenter ➔</span>
                  </div>
                </motion.div>
              )}

              {/* STAGE 2: COVENANT SEGMENTATION */}
              {activeStep.id === "segment" && (
                <motion.div
                  key="stage-segment"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  <p className="text-xs text-[#525866]">
                    Continuous contract text is dissected into discrete, individually auditable covenants:
                  </p>

                  <div className="space-y-2 font-mono text-[0.6875rem]">
                    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/60 p-2.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-3.5 text-red-600 shrink-0" />
                        <span className="font-bold text-red-950">§ 14.2 termination.unilateral</span>
                      </div>
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[0.625rem] font-bold text-red-800">
                        High Risk Predatory
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/60 p-2.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-3.5 text-red-600 shrink-0" />
                        <span className="font-bold text-red-950">§ 9.1 indemnity.uncapped</span>
                      </div>
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[0.625rem] font-bold text-red-800">
                        High Risk One-Sided
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/60 p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="font-bold text-amber-950">§ 6.3 ip.assignment.broad</span>
                      </div>
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[0.625rem] font-bold text-amber-800">
                        Caution: Moral Rights
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-950">§ 3.1 payment.net30</span>
                      </div>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[0.625rem] font-bold text-emerald-800">
                        Standard Commercial Term
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[0.6875rem] text-[#868c98] pt-1 border-t border-[#f2f2f2]">
                    <span>Identified 4 key covenants</span>
                    <span className="font-medium text-[#b04000]">Routing § 14.2 to Statutory Grounding ➔</span>
                  </div>
                </motion.div>
              )}

              {/* STAGE 3: PHILIPPINE STATUTORY GROUNDING */}
              {activeStep.id === "ground" && (
                <motion.div
                  key="stage-ground"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  {/* Flagged Draft language */}
                  <div className="rounded-lg border border-red-100 bg-red-50/40 p-2.5">
                    <span className="font-mono text-[0.625rem] font-bold text-red-700 uppercase tracking-wider">
                      Flagged Contract Term (§ 14.2)
                    </span>
                    <p className="mt-0.5 text-xs italic text-[#08090a] font-contract leading-relaxed">
                      &ldquo;Company reserves the unilateral right to cancel this Agreement at any time without notice, while Contractor is bound to complete pending deliverables.&rdquo;
                    </p>
                  </div>

                  {/* Primary Law Citation */}
                  <div className="rounded-xl border border-[#e8c6a8] bg-[#fbf6f1] p-3 sm:p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#b04000]">
                        <Scale className="size-3.5 text-[#b04000]" />
                        <span>Art. 1308, Civil Code of the Philippines</span>
                      </div>
                      <span className="rounded-full bg-[#b04000] px-2 py-0.5 font-mono text-[0.5625rem] font-semibold text-white">
                        Primary Law
                      </span>
                    </div>

                    <p className="font-contract text-xs text-[#08090a] leading-relaxed italic border-l-2 border-[#b04000] pl-2.5">
                      &ldquo;The contract must bind both contracting parties; its validity or compliance cannot be left to the will of one of them.&rdquo;
                    </p>

                    <p className="text-[0.6875rem] text-[#7a2e02] leading-relaxed pt-0.5">
                      <span className="font-bold">Mutuality Doctrine:</span> Under Philippine civil law, an unreciprocal cancellation clause that allows a client to cancel at will without compensation is legally void.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[0.6875rem] text-[#868c98] pt-1 border-t border-[#f2f2f2]">
                    <span>Grounding Confidence: 94% Match</span>
                    <span className="font-medium text-[#b04000]">Generating Fair Redline ➔</span>
                  </div>
                </motion.div>
              )}

              {/* STAGE 4: CALIBRATED RISK & REDLINES */}
              {activeStep.id === "pushback" && (
                <motion.div
                  key="stage-pushback"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#08090a]">
                      Clause Health Score:
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                      <AlertTriangle className="size-3" />
                      94% Calibrated High Risk
                    </span>
                  </div>

                  {/* Redline Diff Before/After */}
                  <div className="space-y-2 text-xs">
                    <div className="rounded-lg border border-red-200 bg-red-50/50 p-2.5">
                      <span className="text-[0.625rem] font-mono font-bold text-red-700 uppercase">
                        Predatory Clause (Remove)
                      </span>
                      <p className="mt-0.5 text-red-950 font-contract italic line-through">
                        &ldquo;Company reserves unilateral right to cancel at any time without notice or payment for pending work.&rdquo;
                      </p>
                    </div>

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.625rem] font-mono font-bold text-emerald-800 uppercase">
                          ClauseGuard Fair Counter-Proposal (Insert)
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
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              <span>Copy Redline</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="mt-0.5 text-emerald-950 font-mono text-[0.6875rem] leading-relaxed">
                        &ldquo;Either party may terminate this agreement upon 14 days&rsquo; written notice, subject to full compensation for all approved deliverables completed to date.&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[0.6875rem] text-[#868c98] pt-1 border-t border-[#f2f2f2]">
                    <span className="text-[#0c8c5e] font-medium">✓ Ready to paste into contract counter-offer</span>
                    <span className="font-mono text-[0.625rem]">Cycle repeats automatically ↺</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Workbench Footer: Hands-free playback indicator & subtle user controls */}
          <div className="border-t border-[#f2f2f2] pt-3 flex items-center justify-between text-[0.6875rem] text-[#868c98]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#e5e7eb] bg-[#fafbfc] px-2 py-1 text-[0.625rem] font-semibold text-[#525866] hover:bg-white hover:text-[#08090a] transition-colors cursor-pointer"
                title={isPlaying ? "Pause auto-advance" : "Resume auto-advance"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="size-2.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="size-2.5 text-[#b04000]" />
                    <span>Auto-Play</span>
                  </>
                )}
              </button>

              <span className="hidden sm:inline text-[#868c98]">
                {isHovered ? "Paused on hover" : "Auto-playing live demo (5s per step)"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {PIPELINE_STEPS.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  onClick={() => handleStepSelect(i)}
                  className={`size-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentStepIndex
                      ? "w-4 bg-[#b04000]"
                      : "bg-[#d1d5db] hover:bg-[#868c98]"
                  }`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Philippine Statutory Trust Anchors */}
      <div className="border-t border-[#e5e7eb] pt-4 mt-4">
        <div className="grid grid-cols-3 gap-3 text-left">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Scale className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">320+ Statutes</p>
              <p className="text-[0.6875rem] text-[#868c98]">Civil &amp; Labor Code</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Lock className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">RA 10173</p>
              <p className="text-[0.6875rem] text-[#868c98]">Data Privacy Act</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">0% AI Training</p>
              <p className="text-[0.6875rem] text-[#868c98]">Ephemeral Zero-Retention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
