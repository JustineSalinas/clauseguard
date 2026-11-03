"use client";

import {
  FileText,
  Layers,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function PipelineShowcase() {
  return (
    <div className="flex flex-col justify-between h-full p-6 lg:p-8 xl:p-10 bg-[#fafbfc] select-none">
      {/* 1. Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-3.5">
          <Logo size="md" theme="light" showTagline={false} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e4e8] bg-white px-2.5 py-0.5 text-[0.6875rem] font-semibold text-[#525866] shadow-2xs">
            <span className="size-1.5 rounded-full bg-[#0c8c5e]" />
            Visual Pipeline
          </span>
        </div>

        <div className="mt-3.5">
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#08090a]">
            How ClauseGuard audits contracts
          </h2>
          <p className="mt-0.5 text-xs text-[#525866]">
            From raw PDF upload to statutory Philippine law redline.
          </p>
        </div>
      </div>

      {/* 2. Visual Pipeline (Low Text, High Visual Diagram) */}
      <div className="my-auto py-2 space-y-2 relative">
        
        {/* STAGE 01: RAW DOCUMENT & FONT SCAN */}
        <div className="relative">
          <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-2xs">
            {/* Step Marker */}
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000] font-mono text-xs font-bold border border-[#f3d5be]">
              01
            </div>

            {/* Visual Node */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-xs font-bold text-[#08090a] flex items-center gap-1.5">
                  <FileText className="size-3.5 text-[#b04000]" />
                  Document Ingestion &amp; Anti-Tamper Scan
                </span>
                <span className="text-[0.625rem] font-mono text-[#0c8c5e] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  0 hidden tokens
                </span>
              </div>

              {/* Visual Document Skeleton with Scan Bar */}
              <div className="rounded-lg border border-[#e5e7eb] bg-[#fafbfc] p-2 space-y-1">
                <div className="flex items-center justify-between text-[0.625rem] text-[#868c98] font-mono">
                  <span className="truncate">Freelance_Agreement_v2.pdf</span>
                  <span>12 Pages · OCR OK</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden relative">
                  <div className="h-full w-2/3 bg-[#b04000] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center -my-1 relative z-10">
            <div className="size-5 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center shadow-2xs">
              <ArrowDown className="size-2.5 text-[#9ca3af]" />
            </div>
          </div>
        </div>

        {/* STAGE 02: COVENANT SEGMENTATION */}
        <div className="relative">
          <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-2xs">
            {/* Step Marker */}
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000] font-mono text-xs font-bold border border-[#f3d5be]">
              02
            </div>

            {/* Visual Node */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-xs font-bold text-[#08090a] flex items-center gap-1.5">
                  <Layers className="size-3.5 text-[#b04000]" />
                  Covenant Segmentation
                </span>
                <span className="text-[0.625rem] font-mono text-[#525866]">
                  3 Clauses Isolated
                </span>
              </div>

              {/* Visual Segmented Badges */}
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[0.625rem]">
                <div className="rounded-md border border-red-200 bg-red-50/70 p-1.5 text-center">
                  <span className="block font-bold text-red-900 truncate">§ 14.2 Termination</span>
                  <span className="text-[0.5625rem] text-red-700 font-semibold">Flagged</span>
                </div>
                <div className="rounded-md border border-red-200 bg-red-50/70 p-1.5 text-center">
                  <span className="block font-bold text-red-900 truncate">§ 9.1 Indemnity</span>
                  <span className="text-[0.5625rem] text-red-700 font-semibold">Flagged</span>
                </div>
                <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-1.5 text-center">
                  <span className="block font-bold text-emerald-900 truncate">§ 3.1 Payment</span>
                  <span className="text-[0.5625rem] text-emerald-700 font-semibold">Standard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center -my-1 relative z-10">
            <div className="size-5 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center shadow-2xs">
              <ArrowDown className="size-2.5 text-[#9ca3af]" />
            </div>
          </div>
        </div>

        {/* STAGE 03: STATUTORY LAW GROUNDING */}
        <div className="relative">
          <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-2xs">
            {/* Step Marker */}
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000] font-mono text-xs font-bold border border-[#f3d5be]">
              03
            </div>

            {/* Visual Node */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-xs font-bold text-[#08090a] flex items-center gap-1.5">
                  <Scale className="size-3.5 text-[#b04000]" />
                  Philippine Statutory Grounding
                </span>
                <span className="text-[0.625rem] font-mono text-[#b04000] font-semibold">
                  320+ Statutes
                </span>
              </div>

              {/* Visual Statute Citation Card */}
              <div className="rounded-lg border border-[#e8c6a8] bg-[#fbf6f1] p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] font-bold text-[#b04000]">
                    Art. 1308, Civil Code of the Philippines
                  </span>
                  <span className="rounded bg-[#b04000] text-white px-1.5 py-0.2 text-[0.5625rem] font-semibold">
                    Primary Law
                  </span>
                </div>
                <p className="text-[0.625rem] text-[#08090a] italic font-contract leading-tight">
                  &ldquo;The contract must bind both contracting parties; its validity cannot be left to the will of one.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center -my-1 relative z-10">
            <div className="size-5 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center shadow-2xs">
              <ArrowDown className="size-2.5 text-[#9ca3af]" />
            </div>
          </div>
        </div>

        {/* STAGE 04: CALIBRATED REDLINE & COUNTER-PROPOSAL */}
        <div>
          <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-2xs">
            {/* Step Marker */}
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000] font-mono text-xs font-bold border border-[#f3d5be]">
              04
            </div>

            {/* Visual Node */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-display text-xs font-bold text-[#08090a] flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-[#b04000]" />
                  Fair Redline Counter-Proposal
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-red-100 text-red-800 px-1.5 py-0.5 text-[0.5625rem] font-bold">
                  <AlertTriangle className="size-2.5" />
                  94% Risk Flag
                </span>
              </div>

              {/* Visual Redline Diff (Strikethrough vs Clean Counter-Clause) */}
              <div className="space-y-1 text-[0.625rem]">
                <div className="rounded bg-red-50/80 border border-red-200 px-2 py-1 text-red-900 line-through truncate font-contract">
                  &ldquo;Client may cancel at any time without notice or payment.&rdquo;
                </div>
                <div className="rounded bg-emerald-50/80 border border-emerald-200 px-2 py-1 text-emerald-950 font-mono font-medium truncate">
                  &ldquo;Either party may terminate upon 14 days&rsquo; notice with full payment.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Bottom Legal Trust Guarantees */}
      <div className="border-t border-[#e5e7eb] pt-3.5 mt-2">
        <div className="grid grid-cols-3 gap-2 text-left">
          <div className="flex items-center gap-2">
            <Scale className="size-3.5 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-[0.6875rem] font-bold text-[#08090a]">320+ Statutes</p>
              <p className="text-[0.625rem] text-[#868c98]">Civil &amp; Labor Code</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Lock className="size-3.5 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-[0.6875rem] font-bold text-[#08090a]">RA 10173</p>
              <p className="text-[0.625rem] text-[#868c98]">Data Privacy Act</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 shrink-0 text-[#b04000]" />
            <div>
              <p className="font-display text-[0.6875rem] font-bold text-[#08090a]">0% AI Training</p>
              <p className="text-[0.625rem] text-[#868c98]">Zero-Retention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
