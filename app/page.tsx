import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CloudHeroBackdrop } from "@/components/brand/cloud-hero-backdrop";
import { InteractiveContractInspector } from "@/components/brand/interactive-contract-inspector";
import { Reveal } from "@/components/brand/reveal";
import { HeroUploadCta } from "@/components/brand/hero-upload-cta";
import { Logo } from "@/components/brand/logo";
import {
  ShieldCheck,
  Scale,
  FileSearch,
  CheckCircle,
  ArrowRight,
  FileWarning,
  Gavel,
  Users,
  Gauge,
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
            <HeroUploadCta />

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
            Built on Real Philippine Law, Not Guesswork
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <Reveal delay={0}>
              <div className="h-full rounded-[4px] border border-[#f2f2f2] bg-[#f8f9fa] p-4 text-center transition-colors duration-300 hover:border-[#e8c6a8] hover:bg-[#fbeee4]/40">
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
            </Reveal>

            <Reveal delay={0.08}>
              <div className="h-full rounded-[4px] border border-[#f2f2f2] bg-[#f8f9fa] p-4 text-center transition-colors duration-300 hover:border-[#e8c6a8] hover:bg-[#fbeee4]/40">
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
            </Reveal>

            <Reveal delay={0.16}>
              <div className="h-full rounded-[4px] border border-[#f2f2f2] bg-[#f8f9fa] p-4 text-center transition-colors duration-300 hover:border-[#e8c6a8] hover:bg-[#fbeee4]/40">
                <div className="font-mono text-xs font-semibold text-[#08090a]">
                  Part of Our Research
                </div>
                <div className="text-xs text-[#525866] mt-1">
                  Model accuracy &amp; cost ablation
                </div>
                <div className="text-[11px] text-[#b04000] font-medium mt-1">
                  Gemini Flash &middot; Flash-Lite &middot; Llama 3.3 70B
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="h-full rounded-[4px] border border-[#f2f2f2] bg-[#f8f9fa] p-4 text-center transition-colors duration-300 hover:border-[#e8c6a8] hover:bg-[#fbeee4]/40">
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
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- How It Works (3-Step Precision Pipeline) ---------------- */}
      <section id="how-it-works" className="py-20 sm:py-24 border-b border-[#f2f2f2] bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-[13px] font-semibold text-[#b04000] uppercase tracking-[0.05em]">
                How It Works
              </span>
              <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a]">
                Three simple steps. No guesswork.
              </h2>
              <p className="mt-3 text-base text-[#525866] leading-relaxed">
                ClauseGuard doesn&rsquo;t just summarize your contract. It reads every clause carefully, checks it against real Philippine law, and shows you exactly what to worry about.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 flex flex-col md:flex-row md:items-stretch gap-3">
            {/* Step 1 */}
            <Reveal delay={0} className="flex-1 min-w-0">
              <div className="h-full rounded-[16px] border border-[#dddddd] bg-white p-6 shadow-[0_2px_4px_rgba(8,9,10,0.02)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#e8c6a8] hover:shadow-[0_16px_32px_rgba(176,64,0,0.08)]">
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
                    We Read Your Contract
                  </h3>
                  <p className="mt-2.5 text-sm text-[#525866] leading-relaxed">
                    Upload your contract and we break it down clause by clause, so nothing gets missed or mixed up &mdash; even hidden or oddly formatted text.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#f2f2f2] text-xs font-medium text-[#b04000]">
                  Every clause, accounted for
                </div>
              </div>
            </Reveal>

            {/* Connector: this is a pipeline, not three unrelated cards */}
            <div className="hidden md:flex items-center justify-center shrink-0" aria-hidden="true">
              <div className="flex size-9 items-center justify-center rounded-full border border-[#e8c6a8] bg-[#fbeee4] text-[#b04000]">
                <ArrowRight className="size-4" />
              </div>
            </div>
            <div className="flex md:hidden items-center justify-center py-1" aria-hidden="true">
              <div className="flex size-9 rotate-90 items-center justify-center rounded-full border border-[#e8c6a8] bg-[#fbeee4] text-[#b04000]">
                <ArrowRight className="size-4" />
              </div>
            </div>

            {/* Step 2 */}
            <Reveal delay={0.12} className="flex-1 min-w-0">
              <div className="h-full rounded-[16px] border border-[#dddddd] bg-white p-6 shadow-[0_2px_4px_rgba(8,9,10,0.02)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#e8c6a8] hover:shadow-[0_16px_32px_rgba(176,64,0,0.08)]">
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
                    We Check It Against Real Law
                  </h3>
                  <p className="mt-2.5 text-sm text-[#525866] leading-relaxed">
                    Each clause is compared against the actual Civil Code and Labor Code of the Philippines &mdash; not a generic AI guess based on foreign contracts.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#f2f2f2] text-xs font-medium text-[#b04000]">
                  Grounded in real Philippine statutes
                </div>
              </div>
            </Reveal>

            <div className="hidden md:flex items-center justify-center shrink-0" aria-hidden="true">
              <div className="flex size-9 items-center justify-center rounded-full border border-[#e8c6a8] bg-[#fbeee4] text-[#b04000]">
                <ArrowRight className="size-4" />
              </div>
            </div>
            <div className="flex md:hidden items-center justify-center py-1" aria-hidden="true">
              <div className="flex size-9 rotate-90 items-center justify-center rounded-full border border-[#e8c6a8] bg-[#fbeee4] text-[#b04000]">
                <ArrowRight className="size-4" />
              </div>
            </div>

            {/* Step 3 */}
            <Reveal delay={0.24} className="flex-1 min-w-0">
              <div className="h-full rounded-[16px] border border-[#dddddd] bg-white p-6 shadow-[0_2px_4px_rgba(8,9,10,0.02)] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#e8c6a8] hover:shadow-[0_16px_32px_rgba(176,64,0,0.08)]">
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
                    We Show You What&rsquo;s Risky
                  </h3>
                  <p className="mt-2.5 text-sm text-[#525866] leading-relaxed">
                    Get a clear risk level for every clause, highlighted right on your contract. If we&rsquo;re genuinely not sure, we say so instead of guessing.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#f2f2f2] text-xs font-medium text-[#b04000]">
                  Color-coded, easy to scan
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Features / Built for Contract Intelligence ---------------- */}
      <section id="features" className="py-20 sm:py-24 border-b border-[#f2f2f2] bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[13px] font-semibold text-[#b04000] uppercase tracking-[0.05em]">
                What You Get
              </span>
              <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a]">
                Built to protect your work.
              </h2>
              <p className="mt-3 text-base text-[#525866] leading-relaxed">
                Made for freelancers and small business owners who need clarity fast, without hiring a lawyer for every contract that lands in their inbox.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <Reveal delay={0}>
              <div className="h-full rounded-[16px] border border-[#dddddd] bg-white p-7 shadow-[0_2px_4px_rgba(8,9,10,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-[#e8c6a8] hover:shadow-[0_16px_32px_rgba(176,64,0,0.08)]">
                <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                  <Scale className="size-5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#b04000]">
                  Grounded in Real Law
                </span>
                <h3 className="mt-1 text-xl font-semibold text-[#08090a]">
                  Checked Against Actual Philippine Law
                </h3>
                <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                  Most AI chatbots guess based on US or generic contract examples. ClauseGuard checks every clause against the real Civil Code and Labor Code of the Philippines.
                </p>
                <div className="mt-5 pt-4 border-t border-[#f2f2f2] flex items-center gap-2 text-xs font-medium text-[#08090a]">
                  <CheckCircle className="size-3.5 text-[#b04000]" />
                  Every risk comes with the exact law behind it
                </div>
              </div>
            </Reveal>

            {/* Feature 2 */}
            <Reveal delay={0.1}>
              <div className="h-full rounded-[16px] border border-[#dddddd] bg-white p-7 shadow-[0_2px_4px_rgba(8,9,10,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-[#e8c6a8] hover:shadow-[0_16px_32px_rgba(176,64,0,0.08)]">
                <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                  <FileWarning className="size-5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#b04000]">
                  Honest About Uncertainty
                </span>
                <h3 className="mt-1 text-xl font-semibold text-[#08090a]">
                  Tells You When It&rsquo;s Not Sure
                </h3>
                <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                  If a clause is genuinely tricky to judge, ClauseGuard says so instead of guessing &mdash; so you know exactly when it&rsquo;s worth a second look.
                </p>
                <div className="mt-5 pt-4 border-t border-[#f2f2f2] flex items-center gap-2 text-xs font-medium text-[#08090a]">
                  <CheckCircle className="size-3.5 text-[#b04000]" />
                  Flags unclear clauses instead of guessing
                </div>
              </div>
            </Reveal>

            {/* Feature 3 */}
            <Reveal delay={0.05}>
              <div className="h-full rounded-[16px] border border-[#dddddd] bg-white p-7 shadow-[0_2px_4px_rgba(8,9,10,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-[#e8c6a8] hover:shadow-[0_16px_32px_rgba(176,64,0,0.08)]">
                <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                  <FileSearch className="size-5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#b04000]">
                  Easy to Scan
                </span>
                <h3 className="mt-1 text-xl font-semibold text-[#08090a]">
                  See Risks Right on Your Contract
                </h3>
                <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                  No separate report to read. Risky, cautionary, and safe clauses are highlighted right where they appear in your document, with plain-language notes alongside.
                </p>
                <div className="mt-5 pt-4 border-t border-[#f2f2f2] flex items-center gap-2 text-xs font-medium text-[#08090a]">
                  <CheckCircle className="size-3.5 text-[#b04000]" />
                  Keeps your document looking exactly as it should
                </div>
              </div>
            </Reveal>

            {/* Feature 4 */}
            <Reveal delay={0.15}>
              <div className="h-full rounded-[16px] border border-[#dddddd] bg-white p-7 shadow-[0_2px_4px_rgba(8,9,10,0.02)] transition-all duration-300 hover:-translate-y-1 hover:border-[#e8c6a8] hover:shadow-[0_16px_32px_rgba(176,64,0,0.08)]">
                <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                  <ShieldCheck className="size-5" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#b04000]">
                  Ready-to-Send Fixes
                </span>
                <h3 className="mt-1 text-xl font-semibold text-[#08090a]">
                  Suggested Wording You Can Send Right Away
                </h3>
                <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                  Spotting a bad clause is only half the fight. ClauseGuard suggests fairer wording you can send back, protecting your earnings without burning the relationship.
                </p>
                <div className="mt-5 pt-4 border-t border-[#f2f2f2] flex items-center gap-2 text-xs font-medium text-[#08090a]">
                  <CheckCircle className="size-3.5 text-[#b04000]" />
                  Fair, ready-to-use wording for your reply
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Direct Comparison: Generic LLM vs ClauseGuard ---------------- */}
      <section id="statutory-grounding" className="py-20 sm:py-24 border-b border-[#f2f2f2] bg-[#fcfdfd]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-[13px] font-semibold text-[#b04000] uppercase tracking-[0.05em]">
                Why It&rsquo;s Different
              </span>
              <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a]">
                Why a regular chatbot isn&rsquo;t enough.
              </h2>
              <p className="mt-3 text-base text-[#525866] leading-relaxed">
                Popular AI tools like ChatGPT weren&rsquo;t built for Philippine law. ClauseGuard checks every clause against the actual Civil Code and Labor Code, not general internet knowledge.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Generic LLM Failure Mode */}
            <Reveal delay={0} y={16}>
              <div className="h-full rounded-[16px] border border-[#fecaca] bg-[#fffbfb] p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(220,38,38,0.06)]">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#fee2e2]">
                    <span className="text-xs font-semibold text-[#dc2626] uppercase tracking-[0.05em]">
                      A Regular AI Chatbot
                    </span>
                    <span className="text-xs font-mono text-[#dc2626]">GUESSING</span>
                  </div>
                  <div className="space-y-3 text-sm text-[#525866]">
                    <p className="font-mono text-xs text-[#dc2626] bg-[#fef2f2] p-2.5 rounded-[4px]">
                      &ldquo;This non-compete looks standard in California tech contracts. 24 months is a normal duration for specialized consulting.&rdquo;
                    </p>
                    <ul className="space-y-2 text-xs text-[#525866] pt-2">
                      <li className="flex items-start gap-2">
                        <span className="text-[#dc2626] font-bold">&times;</span>
                        Doesn&rsquo;t know how Philippine courts actually rule on this
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#dc2626] font-bold">&times;</span>
                        Makes up foreign legal examples that don&rsquo;t apply here
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#dc2626] font-bold">&times;</span>
                        Can miss clauses that let a client keep your unpaid earnings
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#fee2e2] text-xs font-medium text-[#dc2626]">
                  Real risks can slip through unnoticed
                </div>
              </div>
            </Reveal>

            {/* ClauseGuard Grounded Solution */}
            <Reveal delay={0.15} y={16}>
              <div className="h-full rounded-[16px] border border-[#e8c6a8] bg-[#f6fcf8] p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(176,64,0,0.1)]">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f3ddc4]">
                    <span className="text-xs font-semibold text-[#b04000] uppercase tracking-[0.05em]">
                      ClauseGuard
                    </span>
                    <span className="text-xs font-mono text-[#b04000]">CHECKED AGAINST LAW</span>
                  </div>
                  <div className="space-y-3 text-sm text-[#08090a]">
                    <p className="font-mono text-xs text-[#b04000] bg-[#fbeee4] p-2.5 rounded-[4px]">
                      &ldquo;FLAGGED: This goes against Civil Code Art. 1306. A 24-month restriction with no compensation unfairly limits your ability to work.&rdquo;
                    </p>
                    <ul className="space-y-2 text-xs text-[#525866] pt-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="size-3.5 text-[#b04000] shrink-0 mt-0.5" />
                        Points to the exact law behind every flag
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="size-3.5 text-[#b04000] shrink-0 mt-0.5" />
                        Tells you how confident it is in each finding
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="size-3.5 text-[#b04000] shrink-0 mt-0.5" />
                        Suggests fairer wording made for freelancers
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#f3ddc4] text-xs font-medium text-[#b04000]">
                  Backed by real Philippine law
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Who It's Built For ---------------- */}
      {/* Deliberately not testimonials: no invented names, photos, or savings
          figures standing in for a usability study that hasn't run yet
          (Objective 5). These are scenarios the pipeline is designed around,
          told honestly as scenarios. */}
      <section className="py-20 sm:py-24 border-b border-[#f2f2f2] bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-[13px] font-semibold text-[#b04000] uppercase tracking-[0.05em]">
                Who It&rsquo;s For
              </span>
              <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a]">
                Built for Philippine freelancers and agency owners.
              </h2>
              <p className="mt-3 text-base text-[#525866] leading-relaxed">
                Designed around the situations independent contractors and small business owners actually run into &mdash; the people who have to sign these contracts without a lawyer on retainer.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delay={0}>
              <div className="h-full rounded-[16px] border border-[#dddddd] bg-white p-7 flex flex-col justify-between transition-colors duration-300 hover:border-[#e8c6a8]">
                <div>
                  <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                    <Gavel className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#08090a]">
                    The unilateral termination clause
                  </h3>
                  <p className="mt-2.5 text-sm text-[#525866] leading-relaxed">
                    A client contract lets them end the project early and keep your milestone payments. Clauses like this cite specific Civil Code articles on unconscionable stipulations &mdash; ClauseGuard is built to catch it before you sign, not after.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#f2f2f2] text-xs font-medium text-[#b04000]">
                  Grounded in Art. 1308, 1409
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="h-full rounded-[16px] border border-[#dddddd] bg-white p-7 flex flex-col justify-between transition-colors duration-300 hover:border-[#e8c6a8]">
                <div>
                  <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                    <Users className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#08090a]">
                    No lawyer on retainer
                  </h3>
                  <p className="mt-2.5 text-sm text-[#525866] leading-relaxed">
                    A legal consult often costs more than a small project&rsquo;s deposit, so most independent contractors just skim and sign. ClauseGuard is meant to give a first-pass, statute-backed read before it&rsquo;s worth paying for a real one.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#f2f2f2] text-xs font-medium text-[#b04000]">
                  A first pass, not a legal opinion
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="h-full rounded-[16px] border border-[#dddddd] bg-white p-7 flex flex-col justify-between transition-colors duration-300 hover:border-[#e8c6a8]">
                <div>
                  <div className="size-9 rounded-[4px] bg-[#fbeee4] flex items-center justify-center text-[#b04000] mb-5">
                    <Gauge className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#08090a]">
                    Confidence you can act on
                  </h3>
                  <p className="mt-2.5 text-sm text-[#525866] leading-relaxed">
                    A flag with a high confidence score and a Civil Code citation is worth acting on. A clause the model genuinely isn&rsquo;t sure about gets routed to you for review instead of a guess dressed up as certainty.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#f2f2f2] text-xs font-medium text-[#b04000]">
                  Calibrated, not just confident-sounding
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ Section ---------------- */}
      <section id="faq" className="py-20 sm:py-24 border-b border-[#f2f2f2] bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-[13px] font-semibold text-[#b04000] uppercase tracking-[0.05em]">
                Questions
              </span>
              <h2 className="mt-2 font-sans text-3xl sm:text-4xl font-semibold tracking-[-0.01em] text-[#08090a]">
                Frequently asked questions.
              </h2>
              <p className="mt-3 text-base text-[#525866] leading-relaxed">
                Straight answers about privacy, what ClauseGuard is (and isn&rsquo;t), and how to try it.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 divide-y divide-[#f2f2f2] border-y border-[#f2f2f2] max-w-3xl">
            <Reveal delay={0} y={12}>
              <div className="py-6">
                <h3 className="text-base font-semibold text-[#08090a]">
                  Is ClauseGuard a lawyer?
                </h3>
                <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                  No. Think of it as a first pass, not a legal opinion. ClauseGuard reads your contract clause by clause and checks each one against actual Philippine law, so you know what to look at more closely &mdash; but it doesn&rsquo;t replace talking to a lawyer for anything serious.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.05} y={12}>
              <div className="py-6">
                <h3 className="text-base font-semibold text-[#08090a]">
                  Is my contract kept private?
                </h3>
                <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                  Yes. Your files are stored privately and encrypted, and only you can access them &mdash; not other users, not even us browsing around. Your documents are never used to train any AI model.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1} y={12}>
              <div className="py-6">
                <h3 className="text-base font-semibold text-[#08090a]">
                  What if it's not sure about a clause?
                </h3>
                <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                  It says so, instead of guessing. If a clause is genuinely hard to judge, ClauseGuard flags it for you to look at yourself rather than forcing it into a &ldquo;safe&rdquo; or &ldquo;risky&rdquo; label it isn&rsquo;t confident about.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15} y={12}>
              <div className="py-6">
                <h3 className="text-base font-semibold text-[#08090a]">
                  Can I try it before making an account?
                </h3>
                <p className="mt-2 text-sm text-[#525866] leading-relaxed">
                  Yes. You can look through a fully marked-up sample contract right now, no account needed, and see exactly what your own results would look like.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Final Call to Action ---------------- */}
      {/* Same atmospheric system as the hero, not a separate invented style --
          full-bleed CloudHeroBackdrop, the same text-shadow-on-photo technique,
          the same translucent outline button. A capstone site gets one dark
          "voice," used twice, not two different dark treatments. */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-[#130a05]">
        <CloudHeroBackdrop />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6">
          <Reveal y={16}>
            <h2 className="text-center font-sans text-3xl sm:text-5xl font-semibold tracking-[-0.02em] text-white text-balance max-w-3xl mx-auto [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
              Every clause. Every citation.
            </h2>
            <p className="mt-4 text-center text-base sm:text-lg leading-relaxed text-[#f3ddc4]/85 max-w-[60ch] mx-auto text-pretty [text-shadow:0_2px_16px_rgba(0,0,0,0.6)]">
              No flag without a statute behind it, and no confidence score without a reason to trust it. See it on your own contract.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="hero" variant="default" className="w-full sm:w-auto">
                <Link href="/signup">
                  Upload Contract for Review
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="hero" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
                <Link href="/sample">See Marked-Up Example</Link>
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-amber-100/90 font-mono [text-shadow:0_1px_10px_rgba(0,0,0,0.7)]">
              No credit card required &middot; Takes about 2 minutes &middot; Free to start
            </p>
          </Reveal>
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
                    What You Get
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-[#000000]">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#statutory-grounding" className="hover:text-[#000000]">
                    Why It&rsquo;s Different
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.05em] text-[#08090a]">
                Grounded In
              </div>
              <ul className="mt-3 space-y-2 text-xs text-[#525866]">
                <li>
                  <span className="text-[#868c98]">Civil Code of the Philippines</span>
                </li>
                <li>
                  <span className="text-[#868c98]">Labor Code of the Philippines</span>
                </li>
                <li>
                  <span className="text-[#868c98]">Built with freelancers in mind</span>
                </li>
                <li>
                  <span className="text-[#868c98]">University of San Agustin research</span>
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
