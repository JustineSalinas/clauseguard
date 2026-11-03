"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, ShieldAlert, Sparkles, Check, Copy, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { Logo } from "@/components/brand/logo";

interface ClauseDemo {
  id: string;
  name: string;
  article: string;
  code: string;
  riskScore: number;
  clauseText: string;
  statutoryQuote: string;
  groundingExplanation: string;
  counterProposal: string;
}

const CLAUSE_DEMOS: ClauseDemo[] = [
  {
    id: "termination",
    name: "Unilateral Termination",
    article: "Art. 1308",
    code: "Civil Code of the Philippines",
    riskScore: 94,
    clauseText:
      "Company reserves the unilateral right to cancel this Agreement at any time without notice, while Contractor is bound to complete pending deliverables without compensation.",
    statutoryQuote:
      "The contract must bind both contracting parties; its validity or compliance cannot be left to the will of one of them.",
    groundingExplanation:
      "Violates the fundamental principle of mutuality of contracts under Philippine law.",
    counterProposal:
      "Either party may terminate upon 14 days' written notice, subject to full compensation for all approved deliverables completed to date.",
  },
  {
    id: "indemnity",
    name: "Uncapped Indemnity",
    article: "Art. 1306",
    code: "Civil Code of the Philippines",
    riskScore: 91,
    clauseText:
      "Contractor agrees to indemnify, defend, and hold harmless Company from any and all claims, damages, or liabilities of whatever nature without cap or limitation.",
    statutoryQuote:
      "The contracting parties may establish such stipulations as they may deem convenient, provided they are not contrary to law, morals, good customs, public order, or public policy.",
    groundingExplanation:
      "Grossly asymmetrical indemnity clauses shifting third-party business liability are vulnerable under public policy doctrines.",
    counterProposal:
      "Contractor's aggregate liability under this agreement shall be strictly capped at the total fees actually paid to Contractor in the preceding three (3) months.",
  },
  {
    id: "ip",
    name: "Perpetual IP Assignment",
    article: "Sec. 178",
    code: "Intellectual Property Code (RA 8293)",
    riskScore: 88,
    clauseText:
      "All intellectual property, pre-existing developer tooling, concepts, and moral rights developed at any time belong solely to the Client upon drafting.",
    statutoryQuote:
      "In the case of work commissioned by a person other than an employer, the creator retains copyright unless there is a written agreement to the contrary.",
    groundingExplanation:
      "Overbroad IP capture claiming pre-existing tooling exceeds standard work-for-hire boundaries without separate consideration.",
    counterProposal:
      "IP rights in final approved deliverables transfer to Client solely upon receipt of full payment. Contractor retains ownership of pre-existing background tools and workflows.",
  },
];

export function InteractiveHeroShowcase() {
  const [selectedId, setSelectedId] = useState<string>("termination");
  const [showCounter, setShowCounter] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeDemo = CLAUSE_DEMOS.find((c) => c.id === selectedId) ?? CLAUSE_DEMOS[0];

  function handleCopy() {
    navigator.clipboard.writeText(activeDemo.counterProposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative flex flex-col justify-between h-full p-8 lg:p-12 xl:p-16 overflow-hidden select-none">
      {/* Ambient background: dark terrain contour mesh & light beams matching the user's inspiration image */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Soft top-right copper glow */}
        <div
          className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(176, 64, 0, 0.4) 0%, transparent 70%)",
          }}
        />

        {/* Ambient bottom deep teal/slate glow */}
        <div
          className="absolute -bottom-40 -left-20 h-[600px] w-[600px] rounded-full opacity-15 blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(30, 58, 138, 0.35) 0%, transparent 70%)",
          }}
        />

        {/* Stylized contour mountains / topography SVG matching the inspo aesthetic */}
        <svg
          viewBox="0 0 800 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 left-0 right-0 w-full h-[55%] opacity-25 pointer-events-none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 600L0 440C120 400 240 500 360 430C480 360 600 470 720 420C760 405 800 420 800 420L800 600Z"
            fill="url(#mountainGrad1)"
          />
          <path
            d="M0 600L0 490C90 460 210 520 330 470C450 420 570 510 690 460C740 440 800 470 800 470L800 600Z"
            fill="url(#mountainGrad2)"
          />
          <path
            d="M0 450C150 420 280 490 410 430C540 370 670 450 800 410"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <path
            d="M0 500C120 470 250 530 380 480C510 430 640 510 800 470"
            stroke="rgba(176,64,0,0.18)"
            strokeWidth="1"
          />
          {/* Vertical beacon lights */}
          <line x1="200" y1="200" x2="200" y2="520" stroke="url(#beaconGrad)" strokeWidth="1" opacity="0.6" />
          <circle cx="200" cy="200" r="3" fill="#b04000" />
          <line x1="580" y1="260" x2="580" y2="480" stroke="url(#beaconGrad)" strokeWidth="1" opacity="0.5" />
          <circle cx="580" cy="260" r="2.5" fill="#e8c6a8" />

          <defs>
            <linearGradient id="mountainGrad1" x1="400" y1="360" x2="400" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#121822" stopOpacity="0.8" />
              <stop offset="1" stopColor="#08090a" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="mountainGrad2" x1="400" y1="420" x2="400" y2="600" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1a202c" stopOpacity="0.8" />
              <stop offset="1" stopColor="#08090a" />
            </linearGradient>
            <linearGradient id="beaconGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b04000" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b04000" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Header: Brand Logo */}
      <div className="relative z-10 flex items-center justify-between">
        <Logo size="md" theme="dark" showTagline={false} />
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[0.6875rem] font-medium text-white/70 backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-[#b04000] animate-pulse" />
          <span>Statutory Grounding v2.4</span>
        </div>
      </div>

      {/* Middle Interactive Floating Glassmorphism Showcase Card */}
      <div className="relative z-10 my-auto py-8">
        <div className="mx-auto max-w-xl">
          {/* Interactive Clause Category Switcher */}
          <div className="mb-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CLAUSE_DEMOS.map((demo) => {
              const isSelected = demo.id === selectedId;
              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(demo.id);
                    setShowCounter(false);
                  }}
                  className={`relative cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "text-white shadow-sm"
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeClauseChip"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#b04000] to-[#c84805] shadow-[0_2px_12px_rgba(176,64,0,0.35)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>{demo.name}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? "text-white/80" : "text-white/40"}`}>
                      {demo.article}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Floating Glassmorphic Inspector Card */}
          <motion.div
            key={activeDemo.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="group relative rounded-2xl border border-white/[0.12] bg-[#111318]/80 p-5 sm:p-6 shadow-[0_24px_50px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#b04000]/15 border border-[#b04000]/30 text-[#e8c6a8]">
                  <Scale className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-semibold text-white">
                      {activeDemo.name}
                    </span>
                    <span className="rounded-sm bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 text-[0.625rem] font-bold tracking-wider text-red-300 uppercase">
                      High Risk
                    </span>
                  </div>
                  <p className="text-[0.6875rem] text-white/50">
                    Live scan &middot; Philippine Civil &amp; Labor Code
                  </p>
                </div>
              </div>

              {/* Calibrated Risk Score Pill */}
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-[#f97316]">
                  {activeDemo.riskScore}%
                </div>
                <div className="text-[0.625rem] text-white/40 uppercase tracking-wider">
                  Calibrated Risk
                </div>
              </div>
            </div>

            {/* Risk Gauge Bar */}
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${activeDemo.riskScore}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#b04000] via-[#ea580c] to-[#f97316]"
                />
              </div>
              <span className="shrink-0 font-mono text-[0.6875rem] text-white/40">
                Confidence
              </span>
            </div>

            {/* Predatory Text Extract */}
            <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/40 p-3.5">
              <div className="text-[0.6875rem] font-mono uppercase tracking-wider text-white/40">
                Flagged Clause Extract
              </div>
              <p className="mt-1.5 text-xs text-white/90 italic leading-relaxed">
                &ldquo;{activeDemo.clauseText}&rdquo;
              </p>
            </div>

            {/* Verbatim Statutory Grounding */}
            <div className="mt-3.5 rounded-xl border border-[#b04000]/25 bg-[#b04000]/[0.06] p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e8c6a8]">
                <Scale className="size-3.5 text-[#f97316]" />
                <span>
                  {activeDemo.article}, {activeDemo.code}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-white/80 leading-relaxed font-serif">
                &ldquo;{activeDemo.statutoryQuote}&rdquo;
              </p>
              <p className="mt-1.5 text-[0.6875rem] text-[#fbeee4]/70">
                {activeDemo.groundingExplanation}
              </p>
            </div>

            {/* Interactive Counter-Proposal Preview Toggle */}
            <div className="mt-4 pt-3 border-t border-white/[0.08]">
              {!showCounter ? (
                <button
                  type="button"
                  onClick={() => setShowCounter(true)}
                  className="inline-flex w-full items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="size-3.5 text-[#f97316]" />
                    <span>Generate statutory pushback counter-proposal</span>
                  </span>
                  <ArrowRight className="size-3.5 text-white/40" />
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.6875rem] font-semibold text-emerald-400 uppercase tracking-wider">
                      Fair Alternative Language
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-white/60 hover:text-white"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-white/85 leading-relaxed font-mono text-[0.6875rem]">
                    &ldquo;{activeDemo.counterProposal}&rdquo;
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Hero Statement */}
      <div className="relative z-10 max-w-xl">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl xl:text-[2.65rem] leading-[1.12]">
          Your contract defense{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b04000] via-[#ea580c] to-[#f97316]">
            starts here.
          </span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-white/60 leading-relaxed">
          Ground every freelance agreement in verbatim Philippine statutory law. Detect unilateral clauses, negotiate fair terms, and keep 100% of your earnings.
        </p>

        {/* Feature Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/50">
          <div className="flex items-center gap-1.5">
            <Scale className="size-3.5 text-[#f97316]" />
            <span>320+ Indexed Articles</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="size-3.5 text-[#f97316]" />
            <span>RA 10173 Privacy Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-[#f97316]" />
            <span>0% AI Model Training</span>
          </div>
        </div>
      </div>
    </div>
  );
}

