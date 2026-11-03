"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Scale,
  ShieldCheck,
  Lock,
  Cloud,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function PipelineShowcase() {
  return (
    <div className="relative flex flex-col justify-between h-full p-6 lg:p-8 xl:p-10 bg-[#fafbfc] select-none overflow-hidden">
      {/* Decorative Background Schematic Circuit Lines (Inspired by Reference Pipeline) */}
      <svg
        className="absolute inset-y-0 left-0 w-64 h-full pointer-events-none opacity-30 text-slate-400"
        viewBox="0 0 240 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 40 0 V 180 C 40 230 85 250 85 300 V 700" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 90 0 V 130 C 90 170 50 190 50 240 V 700" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 140 0 V 90 C 140 130 110 160 110 220 V 700" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 60 150 C 60 200 130 220 130 270 V 440 C 130 480 70 510 70 700" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="40" cy="180" r="3.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="85" cy="300" r="3.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="90" cy="130" r="3.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="50" cy="240" r="3.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="140" cy="90" r="3.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="110" cy="220" r="3.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="130" cy="270" r="3.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
      </svg>

      {/* Top Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-4">
          <Logo size="md" theme="light" showTagline={false} />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e4e8] bg-white px-2.5 py-1 text-[0.6875rem] font-semibold text-[#525866] shadow-2xs">
              <span className="size-1.5 rounded-full bg-[#0c8c5e] animate-pulse" />
              Automated Legal Pipeline
            </span>
          </div>
        </div>

        <div className="mt-4 text-center sm:text-left">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#08090a]">
            ClauseGuard Data Pipeline
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#525866]">
            How contracts travel from raw PDF uploads into verified Philippine statutory redlines.
          </p>
        </div>
      </div>

      {/* Main Visual Pipeline Infographic Diagram (Matches User Reference Image) */}
      <div className="relative z-10 my-auto py-6 sm:py-8">
        <div className="rounded-2xl border border-[#e2e4e8] bg-white/95 p-6 lg:p-7 shadow-xs backdrop-blur-xs">
          {/* Centered Infographic Heading */}
          <div className="mb-8 text-center">
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#08090a]">
              Statutory Audit Pipeline
            </span>
            <p className="text-xs text-[#868c98] mt-0.5">
              Continuous end-to-end data flow · Zero manual steps required
            </p>
          </div>

          {/* The 4-Node Horizontal Infographic Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2 items-center justify-between relative">
            
            {/* NODE 1: Contract Ingestion & OCR (Cloud / Raw Contract Sources) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex flex-col items-center">
                {/* Simulated Cloud & Contract Nodes */}
                <div className="flex items-center justify-center -space-x-2 mb-1.5">
                  <div className="flex size-7 items-center justify-center rounded-full bg-blue-50 border border-blue-200 text-blue-600 shadow-2xs">
                    <Cloud className="size-4" />
                  </div>
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#fbeee4] border border-[#e8c6a8] text-[#b04000] shadow-2xs z-10">
                    <FileText className="size-4.5" />
                  </div>
                </div>

                {/* Contract Sheet Preview */}
                <div className="w-28 rounded-lg border border-[#e2e4e8] bg-white p-2 shadow-xs text-left">
                  <div className="h-1.5 w-12 rounded bg-[#b04000]/70 mb-1" />
                  <div className="h-1 w-full rounded bg-slate-200 mb-0.5" />
                  <div className="h-1 w-4/5 rounded bg-slate-200 mb-0.5" />
                  <div className="h-1 w-3/5 rounded bg-slate-200" />
                  <div className="mt-1.5 flex items-center justify-between text-[0.5625rem] font-mono text-[#0c8c5e]">
                    <span>✓ OCR OK</span>
                    <span>12 pgs</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5">
                <p className="font-display text-xs font-bold text-[#08090a]">Contract Sources</p>
                <p className="text-[0.6875rem] text-[#868c98]">Digital PDF &amp; Photo Scans</p>
              </div>
            </div>

            {/* CONNECTOR 1: Extraction & OCR */}
            <div className="hidden md:flex flex-col items-center justify-center px-1">
              <span className="text-[0.625rem] font-semibold text-[#525866] mb-1">
                Data Extraction
              </span>
              <div className="relative w-full flex items-center justify-center">
                <div className="w-full h-[2px] bg-gradient-to-r from-[#d1d5db] via-[#b04000] to-[#d1d5db]" />
                <ArrowRight className="size-3.5 text-[#b04000] absolute -right-1" />
                {/* Animated traveling data particle */}
                <motion.div
                  className="absolute size-2 rounded-full bg-[#b04000] shadow-xs"
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <span className="text-[0.5625rem] text-[#868c98] mt-1 font-mono">Font &amp; OCR Scan</span>
            </div>

            {/* NODE 2: Covenant Staging Area (3D Isometric Pillar) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center">
                {/* 3D Isometric Staging Pillar (Styled like reference) */}
                <div className="relative w-24 h-28 rounded-md bg-white border-2 border-blue-400 shadow-sm flex flex-col justify-between p-2 overflow-hidden">
                  {/* Top isometric angled cap */}
                  <div className="absolute top-0 left-0 right-0 h-3 bg-blue-500/15 border-b border-blue-200" />
                  
                  {/* Front Text */}
                  <div className="pt-2 text-center">
                    <span className="font-mono text-[0.625rem] font-black tracking-wider text-blue-700 uppercase">
                      Staging
                    </span>
                    <span className="block font-mono text-[0.5625rem] font-bold text-blue-600">
                      Area
                    </span>
                  </div>

                  {/* Staged Covenant Blocks */}
                  <div className="space-y-1">
                    <div className="rounded bg-red-100/80 px-1 py-0.5 text-[0.5rem] font-mono font-semibold text-red-800 truncate">
                      § 14.2 Termination
                    </div>
                    <div className="rounded bg-amber-100/80 px-1 py-0.5 text-[0.5rem] font-mono font-semibold text-amber-800 truncate">
                      § 9.1 Indemnity
                    </div>
                    <div className="rounded bg-emerald-100/80 px-1 py-0.5 text-[0.5rem] font-mono font-semibold text-emerald-800 truncate">
                      § 3.1 Payment
                    </div>
                  </div>
                </div>

                {/* 3D Depth Shadow/Edge */}
                <div className="absolute -right-1.5 top-1 bottom-1 w-2 bg-blue-600/20 rounded-r-sm transform skew-y-12" />
              </div>

              <div className="mt-2.5">
                <p className="font-display text-xs font-bold text-[#08090a]">Covenant Staging</p>
                <p className="text-[0.6875rem] text-[#868c98]">Isolated Clause Units</p>
              </div>
            </div>

            {/* CONNECTOR 2: Transform & Load */}
            <div className="hidden md:flex flex-col items-center justify-center px-1">
              <span className="text-[0.625rem] font-semibold text-[#525866] mb-1">
                Transform &amp; Ground
              </span>
              <div className="relative w-full flex items-center justify-center">
                <div className="w-full h-[2px] bg-gradient-to-r from-[#d1d5db] via-[#b04000] to-[#d1d5db]" />
                <ArrowRight className="size-3.5 text-[#b04000] absolute -right-1" />
                {/* Animated traveling data particle */}
                <motion.div
                  className="absolute size-2 rounded-full bg-[#b04000] shadow-xs"
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.8 }}
                />
              </div>
              <span className="text-[0.5625rem] text-[#868c98] mt-1 font-mono">Civil &amp; Labor Code</span>
            </div>

            {/* NODE 3: Codified Philippine Legal Database (Cylinder with Shield) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center">
                {/* 3D Database Cylinder */}
                <div className="relative w-22 h-26 rounded-xl border border-slate-300 bg-gradient-to-b from-white via-slate-50 to-slate-100 p-2 shadow-xs flex flex-col justify-between items-center">
                  {/* Top Cylinder Disc */}
                  <div className="w-16 h-3 rounded-full border border-slate-300 bg-slate-200/60" />
                  
                  {/* Database Mid Rings */}
                  <div className="w-full h-[1px] bg-slate-200" />
                  <div className="w-full h-[1px] bg-slate-200" />

                  {/* Prominent Shield Emblem on Front (Matches Reference) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#b04000] text-white shadow-sm ring-2 ring-white">
                      <Scale className="size-4.5" />
                    </div>
                  </div>

                  {/* Bottom disc */}
                  <div className="w-16 h-2 rounded-full bg-slate-300/60" />
                </div>
              </div>

              <div className="mt-2.5">
                <p className="font-display text-xs font-bold text-[#08090a]">Philippine Legal Corpus</p>
                <p className="text-[0.6875rem] text-[#868c98]">320+ Codified Statutes</p>
              </div>
            </div>

            {/* CONNECTOR 3: Transform & Redline */}
            <div className="hidden md:flex flex-col items-center justify-center px-1">
              <span className="text-[0.625rem] font-semibold text-[#525866] mb-1">
                Calibrate &amp; Redline
              </span>
              <div className="relative w-full flex items-center justify-center">
                <div className="w-full h-[2px] bg-gradient-to-r from-[#d1d5db] via-[#b04000] to-[#d1d5db]" />
                <ArrowRight className="size-3.5 text-[#b04000] absolute -right-1" />
                {/* Animated traveling data particle */}
                <motion.div
                  className="absolute size-2 rounded-full bg-[#b04000] shadow-xs"
                  animate={{ left: ["0%", "100%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 1.6 }}
                />
              </div>
              <span className="text-[0.5625rem] text-[#868c98] mt-1 font-mono">Risk Scoring</span>
            </div>

            {/* NODE 4: Protective Laptop Dashboard with Orbiting Reports (Matches Reference) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative flex items-center justify-center py-1">
                {/* Orbiting Curved Ribbon Arc */}
                <div className="absolute -inset-2 rounded-full border-2 border-dashed border-blue-400/40 pointer-events-none transform -rotate-12 scale-x-125" />

                {/* Floating Orbiting Mini Badges */}
                <div className="absolute -top-2 -right-3 rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[0.5rem] font-bold text-emerald-800 shadow-2xs">
                  Fair Redline
                </div>
                <div className="absolute -bottom-2 -left-3 rounded-md bg-red-50 border border-red-200 px-1.5 py-0.5 text-[0.5rem] font-bold text-red-800 shadow-2xs">
                  94% Risk Flag
                </div>

                {/* Laptop Device Workstation */}
                <div className="relative w-28 rounded-t-md border-2 border-slate-700 bg-slate-900 p-1 shadow-sm">
                  {/* Laptop Screen Content */}
                  <div className="rounded bg-white p-1 text-left min-h-[46px]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-0.5 mb-1">
                      <span className="text-[0.4375rem] font-mono font-bold text-[#b04000]">ClauseGuard</span>
                      <span className="size-1 rounded-full bg-[#0c8c5e]" />
                    </div>
                    {/* Simulated Redline Diff */}
                    <div className="h-1 w-full bg-red-200 rounded mb-0.5 line-through" />
                    <div className="h-1 w-5/6 bg-emerald-300 rounded mb-0.5" />
                    <div className="h-1 w-3/4 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
              {/* Laptop base */}
              <div className="w-32 h-1.5 rounded-b-md bg-slate-600 shadow-xs" />

              <div className="mt-2.5">
                <p className="font-display text-xs font-bold text-[#08090a]">Audit Dashboard</p>
                <p className="text-[0.6875rem] text-[#868c98]">Pushback Counter-Offer</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4 Architectural Milestone Explanations for Non-Tech Users */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 my-2 text-left">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 font-mono text-[0.625rem] font-bold text-[#b04000]">
            <span>01</span>
            <span>EXTRACT</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-[#08090a]">OCR &amp; Font Scan</p>
          <p className="mt-0.5 text-[0.6875rem] text-[#525866] leading-relaxed">
            Identifies invisible 1pt fonts &amp; malicious white-on-white text.
          </p>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 font-mono text-[0.625rem] font-bold text-[#b04000]">
            <span>02</span>
            <span>STAGE</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-[#08090a]">Covenant Isolation</p>
          <p className="mt-0.5 text-[0.6875rem] text-[#525866] leading-relaxed">
            Splits continuous legalese into independent, testable covenants.
          </p>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 font-mono text-[0.625rem] font-bold text-[#b04000]">
            <span>03</span>
            <span>GROUND</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-[#08090a]">Philippine Law</p>
          <p className="mt-0.5 text-[0.6875rem] text-[#525866] leading-relaxed">
            Tests against Civil Code Art. 1308 (Mutuality) and DOLE DO 174.
          </p>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 font-mono text-[0.625rem] font-bold text-[#b04000]">
            <span>04</span>
            <span>SHIELD</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-[#08090a]">Actionable Redlines</p>
          <p className="mt-0.5 text-[0.6875rem] text-[#525866] leading-relaxed">
            Generates fair counter-clauses ready to paste into client replies.
          </p>
        </div>
      </div>

      {/* Bottom Legal Trust Guarantees */}
      <div className="relative z-10 border-t border-[#e5e7eb] pt-4 mt-2">
        <div className="grid grid-cols-3 gap-3 text-left">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Scale className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">320+ Statutes</p>
              <p className="text-[0.6875rem] text-[#868c98]">Civil Code &amp; Labor Code</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Lock className="size-4 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-xs font-semibold text-[#08090a]">RA 10173</p>
              <p className="text-[0.6875rem] text-[#868c98]">Data Privacy Act of 2012</p>
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
