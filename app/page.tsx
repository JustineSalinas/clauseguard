import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CloudHeroBackdrop } from "@/components/brand/cloud-hero-backdrop";
import { InteractiveContractInspector } from "@/components/brand/interactive-contract-inspector";
import { Logo } from "@/components/brand/logo";
import {
  ShieldCheck,
  Scale,
  FileSearch,
  CheckCircle,
  ArrowRight,
  UploadCloud,
  FileWarning,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#000000] selection:bg-[#b04000] selection:text-white">
      {/* ---------------- Sticky Top Navigation Bar ---------------- */}
      <header className="sticky top-0 z-50 border-b border-[#f2f2f2] bg-white/95 backdrop-blur-md">
        <div className="mx-auto grid h-16 max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
          <Logo size="md" href="/" />

          <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#525866] justify-self-center">
            <Link
              href="#features"
              className="transition-colors hover:text-[#000000]"
            >
              Features
            </Link>
            <Link
              href="/sample"
              className="transition-colors hover:text-[#000000]"
            >
              Sample Review
            </Link>
            <Link
              href="#how-it-works"
              className="transition-colors hover:text-[#000000]"
            >
              How it Works
            </Link>
            <Link
              href="#faq"
              className="transition-colors hover:text-[#000000]"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2.5 justify-self-end">
            <Link
              href="/login"
              className="text-[14px] font-medium text-[#08090a] px-3 py-1.5 rounded-[4px] hover:bg-[#f2f2f2] transition-colors"
            >
              Sign in
            </Link>
            <Button asChild size="default" variant="default">
              <Link href="/signup">
                Start for free
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ---------------- Hero Section with Atmospheric Cloud Garden ---------------- */}
      <section className="relative overflow-hidden pt-16 pb-28 sm:pt-24 sm:pb-36 bg-[#130a05]">
        {/* The Signature "Cloud Garden over a Glass Desk" Atmospheric Layer */}
        <CloudHeroBackdrop />

        <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6">
          {/* Display Headline */}
          <h1 className="mt-2 text-center text-4xl sm:text-6xl font-semibold tracking-[-0.02em] leading-[1.08] text-white text-balance max-w-4xl mx-auto [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
            Know what you&rsquo;re signing before you sign it.
          </h1>

          {/* Subheading */}
          <p className="mt-5 text-center text-base sm:text-lg leading-relaxed text-[#f3ddc4]/85 max-w-[68ch] mx-auto text-pretty [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
            Upload any contract. ClauseGuard segments every clause, flags
            one-sided liabilities, and grounds each risk in the Philippine Civil
            Code and Labor Code with calibrated confidence scores.
          </p>

          {/* Hero Action Lead: Direct Upload or Explore Sample */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
            <Link
              href="/signup"
              className="flex w-full sm:w-auto flex-1 items-center justify-between rounded-[4px] border border-[#dddddd] bg-white px-3.5 py-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:border-[#cccccc] transition-colors group"
            >
              <div className="flex items-center">
                <UploadCloud className="size-4 text-[#b04000] mr-2.5 shrink-0" />
                <span className="text-xs sm:text-sm text-[#868c98] group-hover:text-[#525866]">
                  Drop a contract PDF or DOCX to analyze...
                </span>
              </div>
              <span className="shrink-0 ml-2 text-xs font-medium bg-[#08090a] text-white px-3 py-1 rounded-[4px]">
                Analyze
              </span>
            </Link>

            <Button asChild size="default" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
              <Link href="/sample">
                Explore Marked Sample
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>

          <p className="mt-3 text-center text-xs text-amber-100/90 font-mono [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
            No credit card required &middot; Private private bucket storage &middot; No model training on user files
          </p>

          {/* ---------------- The Signature Overlapping Showcase Card ---------------- */}
          {/* Overlaps the bottom edge of the hero into the white canvas below */}
          <div className="mt-14 sm:mt-18 -mb-28 sm:-mb-36">
            <InteractiveContractInspector />
          </div>
        </div>
      </section>

      {/* Spacer to absorb the overlapping product card offset */}
      <div className="h-28 sm:h-36 bg-white" />

      {/* ---------------- Statutory Trust Wall ---------------- */}
      <section className="border-b border-[#f2f2f2] bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#868c98] mb-8">
            Rigorous Academic Research Grounded in Codified Philippine Law
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="rounded-[4px] border border-[#f2f2f2] bg-[#f8f9fa] p-4 text-center">
              <div className="font-mono text-xs font-semibold text-[#08090a]">
                Republic Act 386
              </div>
              <div className="text-xs text-[#525866] mt-1">
                Civil Code of the Philippines
              </div>
              <div className="text-[11px] text-[#b04000] font-medium mt-1">
                Arts. 1308, 1318, 1409
              </div>
            </div>

            <div className="rounded-[4px] border border-[#f2f2f2] bg-[#f8f9fa] p-4 text-center">
              <div className="font-mono text-xs font-semibold text-[#08090a]">
                Presidential Decree 442
              </div>
              <div className="text-xs text-[#525866] mt-1">
                Labor Code of the Philippines
              </div>
              <div className="text-[11px] text-[#b04000] font-medium mt-1">
                Arts. 106, 297, Restraint of Trade
              </div>
            </div>

            <div className="rounded-[4px] border border-[#f2f2f2] bg-[#f8f9fa] p-4 text-center">
              <div className="font-mono text-xs font-semibold text-[#08090a]">
                Model Ablation Matrix
              </div>
              <div className="text-xs text-[#525866] mt-1">
                Objective 3 Benchmark
              </div>
              <div className="text-[11px] text-[#b04000] font-medium mt-1">
                Gemini Flash &middot; Llama 3.3 70B
              </div>
            </div>

            <div className="rounded-[4px] border border-[#f2f2f2] bg-[#f8f9fa] p-4 text-center">
              <div className="font-mono text-xs font-semibold text-[#08090a]">
                Univ. of San Agustin
              </div>
              <div className="text-xs text-[#525866] mt-1">
                CLASE Capstone Research
              </div>
              <div className="text-[11px] text-[#b04000] font-medium mt-1">
                Salinas &middot; Navarro &middot; Zallen
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- How It Works (3-Step Precision Pipeline) ---------------- */}
      <section id="how-it-works" className="py-20 sm:py-24 border-b border-[#f2f2f2] bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-[13px] font-semibold text-[#b04000] uppercase tracking-[0.05em]">
              Precision Pipeline
            </span>
            <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a]">
              Three stages. Zero uncited assumptions.
            </h2>
            <p className="mt-3 text-base text-[#525866] leading-relaxed">
              ClauseGuard does not summarize documents with generic prompts. It executes a multi-stage transactional pipeline that isolates and validates legal risk.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white p-6 shadow-[0_2px_4px_rgba(8,9,10,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f2f2f2]">
                  <span className="font-mono text-xs font-semibold text-[#868c98]">
                    STAGE 01
                  </span>
                  <span className="size-6 rounded-[4px] bg-[#f2f2f2] flex items-center justify-center text-xs font-mono font-medium">
                    1
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#08090a]">
                  OCR &amp; Deterministic Clause Segmentation
                </h3>
                <p className="mt-2.5 text-sm text-[#525866] leading-relaxed">
                  Extracts document tokens, page geometry, and strips invisible text. The segmenter partitions provisions into discrete legal clauses without hallucinating content.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f2f2f2] text-xs font-mono text-[#b04000]">
                &rarr; lib/pipeline/segment
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white p-6 shadow-[0_2px_4px_rgba(8,9,10,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f2f2f2]">
                  <span className="font-mono text-xs font-semibold text-[#868c98]">
                    STAGE 02
                  </span>
                  <span className="size-6 rounded-[4px] bg-[#f2f2f2] flex items-center justify-center text-xs font-mono font-medium">
                    2
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#08090a]">
                  Statutory Grounding via pgvector
                </h3>
                <p className="mt-2.5 text-sm text-[#525866] leading-relaxed">
                  Queries indexed statutory provisions of the Philippine Civil Code and Labor Code. Every clause is matched against relevant jurisprudence, not generic AI heuristics.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f2f2f2] text-xs font-mono text-[#b04000]">
                &rarr; lib/pipeline/ground
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white p-6 shadow-[0_2px_4px_rgba(8,9,10,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f2f2f2]">
                  <span className="font-mono text-xs font-semibold text-[#868c98]">
                    STAGE 03
                  </span>
                  <span className="size-6 rounded-[4px] bg-[#f2f2f2] flex items-center justify-center text-xs font-mono font-medium">
                    3
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#08090a]">
                  Calibrated Scoring &amp; Heat-Map Overlay
                </h3>
                <p className="mt-2.5 text-sm text-[#525866] leading-relaxed">
                  Generates an explicit confidence score alongside severity. Unclear or low-confidence provisions route to human review rather than gambling on a false verdict.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f2f2f2] text-xs font-mono text-[#b04000]">
                &rarr; lib/pipeline/score
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Features / Built for Contract Intelligence ---------------- */}
      <section id="features" className="py-20 sm:py-24 border-b border-[#f2f2f2] bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[13px] font-semibold text-[#b04000] uppercase tracking-[0.05em]">
              Platform Capabilities
            </span>
            <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a]">
              Built for contract intelligence.
            </h2>
            <p className="mt-3 text-base text-[#525866] leading-relaxed">
              Designed specifically for independent professionals who need immediate clarity without hiring an attorney for every project agreement.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white p-7 shadow-[0_2px_4px_rgba(8,9,10,0.02)]">
              <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                <Scale className="size-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#b04000]">
                Statutory RAG Engine
              </span>
              <h3 className="mt-1 text-xl font-semibold text-[#08090a]">
                Grounded in Philippine Law, Not General LLM Training
              </h3>
              <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                Generic chatbots evaluate agreements using vague common-law assumptions from US jurisdictions. ClauseGuard verifies obligations strictly against the Philippine Civil Code (Arts. 1306, 1308, 1409) and Supreme Court labor rulings.
              </p>
              <div className="mt-5 pt-4 border-t border-[#f2f2f2] flex items-center gap-2 text-xs font-medium text-[#08090a]">
                <CheckCircle className="size-3.5 text-[#b04000]" />
                Verifiable citations attached to every single flagged risk
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white p-7 shadow-[0_2px_4px_rgba(8,9,10,0.02)]">
              <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                <FileWarning className="size-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#b04000]">
                Confidence Calibration
              </span>
              <h3 className="mt-1 text-xl font-semibold text-[#08090a]">
                Admitting Uncertainty Instead of Quietly Guessing
              </h3>
              <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                If a clause scores below calibrated thresholds (Objective 2), ClauseGuard marks it as requiring review instead of presenting a false positive. A tool that flags what it struggles with is a tool you can actually rely on.
              </p>
              <div className="mt-5 pt-4 border-t border-[#f2f2f2] flex items-center gap-2 text-xs font-medium text-[#08090a]">
                <CheckCircle className="size-3.5 text-[#b04000]" />
                Automatic routing to human review for ambiguous clauses
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white p-7 shadow-[0_2px_4px_rgba(8,9,10,0.02)]">
              <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                <FileSearch className="size-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#b04000]">
                Visual Document Heat-Map
              </span>
              <h3 className="mt-1 text-xl font-semibold text-[#08090a]">
                Color-Coded Overlay on the Original Contract
              </h3>
              <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                No need to read disconnected notes. See high risk, caution, and clean terms highlighted directly on your contract layout with side-by-side margin translations and redlines.
              </p>
              <div className="mt-5 pt-4 border-t border-[#f2f2f2] flex items-center gap-2 text-xs font-medium text-[#08090a]">
                <CheckCircle className="size-3.5 text-[#b04000]" />
                Preserves exact PDF typography, margins, and page numbers
              </div>
            </div>

            {/* Feature 4 */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white p-7 shadow-[0_2px_4px_rgba(8,9,10,0.02)]">
              <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                <ShieldCheck className="size-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#b04000]">
                Actionable Counter-Proposals
              </span>
              <h3 className="mt-1 text-xl font-semibold text-[#08090a]">
                Professional Redlines You Can Paste Directly into an Email
              </h3>
              <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                Knowing a clause is predatory is only half the battle. ClauseGuard suggests balanced counter-clauses and negotiation language that protects your earnings while preserving client goodwill.
              </p>
              <div className="mt-5 pt-4 border-t border-[#f2f2f2] flex items-center gap-2 text-xs font-medium text-[#08090a]">
                <CheckCircle className="size-3.5 text-[#b04000]" />
                Balanced substitute wording ready for your client response
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Direct Comparison: Generic LLM vs ClauseGuard ---------------- */}
      <section id="statutory-grounding" className="py-20 sm:py-24 border-b border-[#f2f2f2] bg-[#fcfdfd]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-[13px] font-semibold text-[#b04000] uppercase tracking-[0.05em]">
              The Statutory Difference
            </span>
            <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a]">
              Why uncited generic AI fails Philippine contracts.
            </h2>
            <p className="mt-3 text-base text-[#525866] leading-relaxed">
              Commercial AI tools rely on general internet datasets. ClauseGuard implements dual-arm RAG grounding against the codified statutes of the Philippines.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generic LLM Failure Mode */}
            <div className="rounded-[16px] border border-[#fecaca] bg-[#fffbfb] p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#fee2e2]">
                  <span className="text-xs font-semibold text-[#dc2626] uppercase tracking-[0.05em]">
                    Generic Uncited LLM (ChatGPT / Claude Prompt)
                  </span>
                  <span className="text-xs font-mono text-[#dc2626]">UNGROUNDED</span>
                </div>
                <div className="space-y-3 text-sm text-[#525866]">
                  <p className="font-mono text-xs text-[#dc2626] bg-[#fef2f2] p-2.5 rounded-[4px]">
                    &ldquo;This non-compete looks standard in California tech contracts. 24 months is a normal duration for specialized consulting.&rdquo;
                  </p>
                  <ul className="space-y-2 text-xs text-[#525866] pt-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#dc2626] font-bold">&times;</span>
                      No knowledge of Philippine Supreme Court restraint of trade doctrines.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#dc2626] font-bold">&times;</span>
                      Hallucinates foreign case precedents that hold zero weight in local courts.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#dc2626] font-bold">&times;</span>
                      Provides false security on clauses that would forfeit your accrued earnings.
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#fee2e2] text-xs font-medium text-[#dc2626]">
                High risk of undetected liability shift
              </div>
            </div>

            {/* ClauseGuard Grounded Solution */}
            <div className="rounded-[16px] border border-[#e8c6a8] bg-[#f6fcf8] p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f3ddc4]">
                  <span className="text-xs font-semibold text-[#b04000] uppercase tracking-[0.05em]">
                    ClauseGuard Grounded Pipeline
                  </span>
                  <span className="text-xs font-mono text-[#b04000]">STATUTORY RAG</span>
                </div>
                <div className="space-y-3 text-sm text-[#08090a]">
                  <p className="font-mono text-xs text-[#b04000] bg-[#fbeee4] p-2.5 rounded-[4px]">
                    &ldquo;FLAGGED: Overbroad under Civil Code Art. 1306. A 24-month regional restriction without compensation constitutes an unreasonable restraint of trade.&rdquo;
                  </p>
                  <ul className="space-y-2 text-xs text-[#525866] pt-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="size-3.5 text-[#b04000] shrink-0 mt-0.5" />
                      Cites exact articles from the Civil Code of the Philippines (R.A. 386).
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="size-3.5 text-[#b04000] shrink-0 mt-0.5" />
                      Calibrated confidence calibration score reported on every finding.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="size-3.5 text-[#b04000] shrink-0 mt-0.5" />
                      Suggests legally tested redlines tailored to freelance contractor equity.
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-[#f3ddc4] text-xs font-medium text-[#b04000]">
                Verified statutory grounding
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Customer Stories / Freelancer Testimonials ---------------- */}
      <section className="py-20 sm:py-24 border-b border-[#f2f2f2] bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-[13px] font-semibold text-[#b04000] uppercase tracking-[0.05em]">
              Real-World Usability
            </span>
            <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a]">
              Built for Philippine freelancers and agency owners.
            </h2>
            <p className="mt-3 text-base text-[#525866] leading-relaxed">
              Evaluating perceived usefulness and usability with actual independent contractors (Objective 5).
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Story 1 */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white overflow-hidden shadow-[0_2px_4px_rgba(8,9,10,0.02)] flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f2f2f2]">
                  <Image
                    src="/images/customer-ux.jpg"
                    alt="Marco Tan, UX Consultant"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white bg-black/50 px-2 py-0.5 rounded-[3px] backdrop-blur-sm">
                    UX Consultancy &middot; Makati
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-[#08090a]">
                    &ldquo;A client inserted a unilateral termination clause that forfeited my milestone payments if they ended the project early. ClauseGuard flagged Art. 1308 and gave me the exact redline to fix it. Saved me ₱85,000.&rdquo;
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[#f2f2f2]">
                <div>
                  <div className="text-xs font-semibold text-[#08090a]">Marco Tan</div>
                  <div className="text-[11px] text-[#868c98]">Independent Consultant</div>
                </div>
                <span className="text-xs font-medium text-[#b04000] group-hover:underline">
                  Read story &rarr;
                </span>
              </div>
            </div>

            {/* Story 2 */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white overflow-hidden shadow-[0_2px_4px_rgba(8,9,10,0.02)] flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f2f2f2]">
                  <Image
                    src="/images/customer-designer.jpg"
                    alt="Bea Santos, Brand Identity Designer"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white bg-black/50 px-2 py-0.5 rounded-[3px] backdrop-blur-sm">
                    Brand Studio &middot; Cebu City
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-[#08090a]">
                    &ldquo;Before ClauseGuard, I just skimmed contracts and signed because lawyer consults cost more than the project deposit. Having instant statutory citations gives me the confidence to push back on predatory terms.&rdquo;
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[#f2f2f2]">
                <div>
                  <div className="text-xs font-semibold text-[#08090a]">Bea Santos</div>
                  <div className="text-[11px] text-[#868c98]">Brand Designer</div>
                </div>
                <span className="text-xs font-medium text-[#b04000] group-hover:underline">
                  Read story &rarr;
                </span>
              </div>
            </div>

            {/* Story 3 */}
            <div className="rounded-[16px] border border-[#dddddd] bg-white overflow-hidden shadow-[0_2px_4px_rgba(8,9,10,0.02)] flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#f2f2f2]">
                  <Image
                    src="/images/customer-developer.jpg"
                    alt="Rafael Cruz, Software Engineer"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white bg-black/50 px-2 py-0.5 rounded-[3px] backdrop-blur-sm">
                    Software Agency &middot; Iloilo City
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-relaxed text-[#08090a]">
                    &ldquo;The calibrated confidence score is what makes this trustworthy. When it says 95% confidence with the Civil Code citation, I know it is solid. When it flags review, it does not pretend to know everything.&rdquo;
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-[#f2f2f2]">
                <div>
                  <div className="text-xs font-semibold text-[#08090a]">Rafael Cruz</div>
                  <div className="text-[11px] text-[#868c98]">Full-Stack Developer</div>
                </div>
                <span className="text-xs font-medium text-[#b04000] group-hover:underline">
                  Read story &rarr;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ Section ---------------- */}
      <section id="faq" className="py-20 sm:py-24 border-b border-[#f2f2f2] bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-[13px] font-semibold text-[#b04000] uppercase tracking-[0.05em]">
              Transparency &amp; FAQ
            </span>
            <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a]">
              Frequently asked questions.
            </h2>
            <p className="mt-3 text-base text-[#525866] leading-relaxed">
              Clear answers about privacy, legal status, and our academic research architecture.
            </p>
          </div>

          <div className="mt-10 divide-y divide-[#f2f2f2] border-y border-[#f2f2f2] max-w-3xl">
            <div className="py-6">
              <h3 className="text-base font-semibold text-[#08090a]">
                Does ClauseGuard provide formal legal advice?
              </h3>
              <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                No. ClauseGuard is an automated contract clause identification and risk flagging platform designed for first-pass issue spotting. It grounds clauses against Philippine statutory provisions to assist non-lawyers in identifying unbalanced terms, but does not create an attorney-client relationship.
              </p>
            </div>

            <div className="py-6">
              <h3 className="text-base font-semibold text-[#08090a]">
                How does ClauseGuard protect confidential contracts?
              </h3>
              <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                All uploaded documents are stored in private, encrypted Supabase Storage buckets using signed URLs with strict 60-second expiration. We implement strict Row-Level Security (RLS) across all tenant boundaries. Your documents are never used to train public AI models.
              </p>
            </div>

            <div className="py-6">
              <h3 className="text-base font-semibold text-[#08090a]">
                What happens when ClauseGuard encounters an ambiguous clause?
              </h3>
              <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                Under Objective 2 (Confidence Calibration), clauses scoring below calibrated thresholds are not forced into a binary risk category. Instead, they are routed to a human review state. A tool that flags uncertainty is fundamentally more reliable than one that guesses.
              </p>
            </div>

            <div className="py-6">
              <h3 className="text-base font-semibold text-[#08090a]">
                Can I test ClauseGuard without creating an account?
              </h3>
              <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                Yes. You can explore our live marked-up sample contract right now without an account, including real-world clause segmentation, risk classification, and statutory citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Final Call to Action ---------------- */}
      <section className="py-20 sm:py-24 bg-[#f8f9fa] border-b border-[#f2f2f2]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="rounded-[24px] border border-[#dddddd] bg-white p-8 sm:p-14 text-center max-w-3xl mx-auto shadow-[0_4px_16px_rgba(8,9,10,0.03)]">
            <span className="inline-flex items-center gap-2 rounded-[4px] bg-[#fbeee4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-[#b04000] border border-[#e8c6a8]">
              Start Reviewing Today
            </span>
            <h2 className="mt-4 font-sans text-3xl sm:text-5xl font-semibold tracking-[-0.02em] text-[#08090a]">
              Protect your work and your earnings.
            </h2>
            <p className="mt-4 text-base text-[#525866] leading-relaxed max-w-xl mx-auto">
              Never sign an unbalanced contract in the dark. Upload your agreement now and see what risks are hiding in the fine print.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="hero" variant="default" className="w-full sm:w-auto">
                <Link href="/signup">
                  Upload Contract for Review
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="hero" variant="outline" className="w-full sm:w-auto">
                <Link href="/sample">See Marked-Up Example</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Monastic White Footer ---------------- */}
      <footer className="bg-white py-14 border-t border-[#f2f2f2]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-[#f2f2f2]">
            <div>
              <Logo size="sm" href="/" />
              <p className="mt-3 text-xs text-[#525866] leading-relaxed">
                SaaS-based contract clause identification and risk flagging platform for Philippine small businesses and freelancers.
              </p>
              <div className="mt-4 text-[11px] text-[#868c98]">
                College of Liberal Arts, Sciences, and Education
                <br />
                University of San Agustin
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.05em] text-[#08090a]">
                Platform
              </div>
              <ul className="mt-3 space-y-2 text-xs text-[#525866]">
                <li>
                  <Link href="/sample" className="hover:text-[#000000]">
                    Marked-Up Sample
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-[#000000]">
                    Feature Capabilities
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-[#000000]">
                    Precision Pipeline
                  </Link>
                </li>
                <li>
                  <Link href="#statutory-grounding" className="hover:text-[#000000]">
                    Statutory Grounding
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.05em] text-[#08090a]">
                Research &amp; Legal
              </div>
              <ul className="mt-3 space-y-2 text-xs text-[#525866]">
                <li>
                  <span className="text-[#868c98]">Civil Code (R.A. 386)</span>
                </li>
                <li>
                  <span className="text-[#868c98]">Labor Code (P.D. 442)</span>
                </li>
                <li>
                  <span className="text-[#868c98]">Ablation Benchmark</span>
                </li>
                <li>
                  <span className="text-[#868c98]">Usability Evaluation</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.05em] text-[#08090a]">
                Account
              </div>
              <ul className="mt-3 space-y-2 text-xs text-[#525866]">
                <li>
                  <Link href="/signup" className="hover:text-[#000000]">
                    Create Free Account
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#000000]">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/reset-password" className="hover:text-[#000000]">
                    Reset Password
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#868c98]">
            <p>
              &copy; {new Date().getFullYear()} ClauseGuard Research Team. Grounded in Philippine jurisprudence.
            </p>
            <p className="text-[11px]">
              Disclaimer: First-pass contract analysis tool. Not a substitute for formal legal counsel.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
