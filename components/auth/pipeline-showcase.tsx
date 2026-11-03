"use client";

import {
  FileText,
  Layers,
  Scale,
  ShieldCheck,
  Lock,
  ArrowDown,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

interface PipelineStage {
  step: string;
  name: string;
  badge: string;
  icon: typeof FileText;
  summary: string;
  technicalSpec: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    step: "01",
    name: "Document Ingestion & OCR",
    badge: "Ingestion",
    icon: FileText,
    summary:
      "Reads digital PDFs and smartphone scans. Inspects font layer geometry to flag hidden 1pt or white-on-white text inserted to manipulate reviews.",
    technicalSpec: "PDF.js parser · Font bounding box analysis · RA 10173 ephemeral memory",
  },
  {
    step: "02",
    name: "Covenant Segmentation",
    badge: "Segmentation",
    icon: Layers,
    summary:
      "Breaks continuous legal prose into discrete, standalone covenants — isolating unilateral termination, uncapped indemnity, and IP transfer terms.",
    technicalSpec: "Structural boundary detection · Ordinal indexing · Classification tagging",
  },
  {
    step: "03",
    name: "Philippine Statutory Grounding",
    badge: "Statutory Law",
    icon: Scale,
    summary:
      "Cross-references each covenant against 320+ codified Philippine legal articles, anchoring every finding in binding primary law rather than generic advice.",
    technicalSpec: "Civil Code (Art. 1308 Mutuality) · Labor Code (DOLE DO 174) · RA 8293 IP Code",
  },
  {
    step: "04",
    name: "Calibrated Risk & Fair Redlines",
    badge: "Redline Output",
    icon: ShieldCheck,
    summary:
      "Computes calibrated risk scores and generates protective, balanced counter-proposals that freelancers can copy directly into client negotiations.",
    technicalSpec: "Word-level diff counter-clauses · Calibrated confidence · Zero model training",
  },
];

export function PipelineShowcase() {
  return (
    <div className="flex flex-col justify-between h-full p-8 lg:p-10 xl:p-12 bg-[#fafbfc] select-none">
      {/* 1. Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-5">
          <Logo size="md" theme="light" showTagline={false} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e2e4e8] bg-white px-2.5 py-1 text-[0.6875rem] font-semibold text-[#525866] shadow-2xs">
            <span className="size-1.5 rounded-full bg-[#0c8c5e]" />
            Pipeline Architecture v2.4
          </span>
        </div>

        <div className="mt-5">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#08090a]">
            How ClauseGuard audits your contract
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#525866] leading-relaxed">
            A 4-stage automated pipeline that grounds contract terms in verbatim Philippine statutory law.
          </p>
        </div>
      </div>

      {/* 2. Connected Pipeline Stages (Minimalist, High-Trust System Design) */}
      <div className="my-6 space-y-3">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isLast = idx === PIPELINE_STAGES.length - 1;

          return (
            <div key={stage.step} className="relative">
              {/* Vertical connector line between stages */}
              {!isLast && (
                <div className="absolute left-5 top-12 bottom-[-14px] w-[1.5px] bg-[#e5e7eb] flex items-center justify-center z-0">
                  <div className="absolute top-1/2 -translate-y-1/2 bg-[#fafbfc] p-0.5">
                    <ArrowDown className="size-2.5 text-[#9ca3af]" />
                  </div>
                </div>
              )}

              {/* Stage Card */}
              <div className="relative z-10 flex items-start gap-3.5 rounded-xl border border-[#e5e7eb] bg-white p-3.5 sm:p-4 shadow-2xs hover:border-[#d1d5db] transition-colors">
                {/* Step Icon */}
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000] border border-[#f3d5be] shadow-2xs">
                  <Icon className="size-4" />
                </div>

                {/* Stage Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#b04000]">
                        {stage.step}
                      </span>
                      <h3 className="font-display text-xs sm:text-sm font-semibold text-[#08090a]">
                        {stage.name}
                      </h3>
                    </div>
                    <span className="rounded bg-[#f4f5f7] px-2 py-0.5 text-[0.625rem] font-semibold text-[#525866]">
                      {stage.badge}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#525866] leading-relaxed">
                    {stage.summary}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 font-mono text-[0.625rem] text-[#868c98] border-t border-[#f4f5f7] pt-1.5">
                    <span className="font-semibold text-[#08090a]">Spec:</span>
                    <span className="truncate">{stage.technicalSpec}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Legal Trust Guarantees */}
      <div className="border-t border-[#e5e7eb] pt-5">
        <div className="grid grid-cols-3 gap-3 text-left">
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
              <p className="text-[0.6875rem] text-[#868c98]">Ephemeral Zero-Retention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
