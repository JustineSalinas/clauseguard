"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Shield,
  Scale,
  Zap,
  Building2,
  User,
  FileText,
  Lock,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  FileCheck,
  Download,
  Users,
} from "lucide-react";

interface BillingTier {
  id: "free" | "pro" | "agency";
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  currentPlan?: boolean;
  ctaText: string;
  ctaDisabled?: boolean;
  badge?: string;
  highlights: string[];
  specs: {
    contractLimit: string;
    pageLimit: string;
    processingSpeed: string;
    retention: string;
  };
}

const TIERS: BillingTier[] = [
  {
    id: "free",
    name: "Starter",
    tagline: "For occasional freelancers and VAs reviewing entry gigs and basic agreements.",
    monthlyPrice: 0,
    annualPrice: 0,
    currentPlan: true,
    ctaText: "Your Current Plan",
    ctaDisabled: true,
    highlights: [
      "3 contract reviews per month (refreshes monthly)",
      "Up to 15 pages per document (PDF & image scans)",
      "Core Philippine Civil Code grounding (Arts. 1308, 1306, 1700)",
      "Overall Contract Health Scorecard (0–100)",
      "Calibrated confidence scoring with human-review routing",
      "Standard OCR text extraction & font verification",
      "14-day review history retention",
      "100% RA 10173 privacy compliant & 0% AI model training",
    ],
    specs: {
      contractLimit: "3 reviews / mo",
      pageLimit: "15 pages / doc",
      processingSpeed: "Standard (~40s)",
      retention: "14 days",
    },
  },
  {
    id: "pro",
    name: "Professional",
    tagline: "For active freelancers, consultants, and developers signing recurring client retainers.",
    monthlyPrice: 299,
    annualPrice: 249,
    popular: true,
    badge: "Most Popular",
    ctaText: "Active in Research Preview (₱0)",
    ctaDisabled: false,
    highlights: [
      "Unlimited contract reviews with zero monthly caps",
      "Up to 50 pages per agreement (handles multi-page MSAs)",
      "High-priority processing pipeline (< 15 second turnaround)",
      "Full Philippine Statutory Corpus v2.4 (320+ articles indexed)",
      "Interactive Pushback Playbook with custom rate personalizer",
      "Word-by-word Redline Diff Viewer (visual revision compare)",
      "One-click Executive Audit Report Export (PDF/Print)",
      "Hidden text & white-on-white tampering detection audit",
      "Permanent review history archive & search",
      "Ephemeral zero-retention mode toggle for strict client NDAs",
    ],
    specs: {
      contractLimit: "Unlimited",
      pageLimit: "50 pages / doc",
      processingSpeed: "Priority (<15s)",
      retention: "Permanent",
    },
  },
  {
    id: "agency",
    name: "Studio & Agency",
    tagline: "For creative agencies, dev boutiques, and collectives managing client and subcontractor MSAs.",
    monthlyPrice: 899,
    annualPrice: 749,
    badge: "Teams & Studios",
    ctaText: "Inquire for Team Pilot",
    ctaDisabled: false,
    highlights: [
      "Everything in Professional for up to 5 team members",
      "Up to 120 pages per contract with appendices and schedules",
      "Centralized team contract repository & shared audit trail",
      "Subcontractor Agreement Generator (DOLE DO 174 compliant)",
      "White-label Executive Audit Reports with agency logo",
      "Shareable client review portal (secure watermarked links)",
      "Custom agency legal compliance checklist integration",
      "Bulk export of contract risk metadata (JSON/CSV)",
      "Priority legal engineering support via Slack / WhatsApp",
      "Custom DPA & NDA isolation compliance guarantee",
    ],
    specs: {
      contractLimit: "Unlimited",
      pageLimit: "120 pages / doc",
      processingSpeed: "Dedicated (<10s)",
      retention: "Permanent + Audit Log",
    },
  },
];

interface ComparisonCategory {
  name: string;
  rows: {
    feature: string;
    description: string;
    free: string | boolean;
    pro: string | boolean;
    agency: string | boolean;
  }[];
}

const COMPARISON_CATEGORIES: ComparisonCategory[] = [
  {
    name: "Capacity & Processing",
    rows: [
      {
        feature: "Monthly Contract Quota",
        description: "Number of full contract reviews permitted each billing cycle.",
        free: "3 contracts / mo",
        pro: "Unlimited",
        agency: "Unlimited",
      },
      {
        feature: "Max Page Length",
        description: "Maximum document length supported per upload.",
        free: "15 pages",
        pro: "50 pages",
        agency: "120 pages",
      },
      {
        feature: "File Types Supported",
        description: "Accepted document formats for ingestion.",
        free: "PDF, PNG, JPG, HEIC",
        pro: "PDF, Scans, Multi-page TIFF",
        agency: "All formats + Batch ZIP",
      },
      {
        feature: "Processing Queue",
        description: "Speed and prioritization of the OCR and grounding pipeline.",
        free: "Standard (~40s)",
        pro: "Priority (<15s)",
        agency: "Dedicated GPU (<10s)",
      },
    ],
  },
  {
    name: "Statutory Law Grounding",
    rows: [
      {
        feature: "Philippine Legal Corpus",
        description: "Scope of indexed statutory provisions referenced during analysis.",
        free: "Core Civil Code (50 arts.)",
        pro: "Full Corpus v2.4 (320+ arts.)",
        agency: "Full Corpus + Custom Rules",
      },
      {
        feature: "Civil Code Mutuality (Art. 1308)",
        description: "Detects unilateral termination and one-sided cancellation clauses.",
        free: true,
        pro: true,
        agency: true,
      },
      {
        feature: "Public Order & Morals (Art. 1306)",
        description: "Identifies predatory uncapped indemnities and unfair liquidated damages.",
        free: true,
        pro: true,
        agency: true,
      },
      {
        feature: "IP Code Ownership (RA 8293)",
        description: "Flags overbroad IP assignment claiming background tooling.",
        free: false,
        pro: true,
        agency: true,
      },
      {
        feature: "Labor Code Independent Contractor Audit",
        description: "Evaluates control test and economic reality under DOLE DO 174.",
        free: false,
        pro: true,
        agency: true,
      },
      {
        feature: "Calibrated Confidence Thresholds",
        description: "Transparently routes ambiguous clauses to human review instead of guessing.",
        free: true,
        pro: true,
        agency: true,
      },
    ],
  },
  {
    name: "Negotiation & Pushback Tools",
    rows: [
      {
        feature: "Contract Health Scorecard",
        description: "Overall 0–100 document risk score with covenant distribution.",
        free: true,
        pro: true,
        agency: true,
      },
      {
        feature: "Pushback Playbook Generator",
        description: "Personalized negotiation copy with statutory citations ready to email clients.",
        free: "Preview Only",
        pro: "Full Generator",
        agency: "Full + Custom Playbooks",
      },
      {
        feature: "Word-by-Word Redline Diff Viewer",
        description: "Visual side-by-side comparison of original vs. recommended language.",
        free: false,
        pro: true,
        agency: true,
      },
      {
        feature: "Executive Audit Report Export",
        description: "Print-ready counsel report with executive summary and statutory annotations.",
        free: "Watermarked PDF",
        pro: "Clean Executive PDF",
        agency: "White-label Custom PDF",
      },
    ],
  },
  {
    name: "Governance, Team & Privacy",
    rows: [
      {
        feature: "Team Seats Included",
        description: "Number of team members with individual workspace logins.",
        free: "1 seat",
        pro: "1 seat",
        agency: "5 seats included",
      },
      {
        feature: "Ephemeral Zero-Retention Mode",
        description: "Purges document bytes immediately from memory following analysis.",
        free: false,
        pro: true,
        agency: true,
      },
      {
        feature: "Anti-Tampering Hidden Text Audit",
        description: "Detects 1pt font and white-on-white text inserted to manipulate models.",
        free: "Basic",
        pro: "Comprehensive",
        agency: "Forensic Audit Log",
      },
      {
        feature: "0% AI Model Training Guarantee",
        description: "Contracts and metadata are strictly isolated under RA 10173.",
        free: true,
        pro: true,
        agency: true,
      },
    ],
  },
];

const FAQS = [
  {
    q: "Why are paid features currently accessible at ₱0?",
    a: "ClauseGuard is currently operating in its academic research preview for our University of San Agustin capstone study. During this evaluation phase, all registered accounts receive unlocked access to Professional capabilities at no charge so evaluators can test the complete statutory pipeline.",
  },
  {
    q: "How will billing and payments work when commercial pricing launches?",
    a: "We are integrating local Philippine payment gateways including PayMongo (supporting GCash, Maya, and GrabPay) alongside standard Visa and Mastercard credit or debit cards. Pricing is set in Philippine Pesos (PHP) specifically scaled for local independent contractors rather than US enterprise seat pricing.",
  },
  {
    q: "Are my uploaded contracts and client NDAs kept confidential?",
    a: "Yes. ClauseGuard adheres strictly to Republic Act No. 10173 (Data Privacy Act of 2012). Contracts uploaded for analysis are never used to train public or proprietary AI models. Professional users can additionally enable 'Zero-Retention Ephemeral Mode' which immediately destroys document buffers once review scoring completes.",
  },
  {
    q: "Can I use ClauseGuard to replace a licensed Philippine attorney?",
    a: "ClauseGuard is designed as an automated statutory grounding and negotiation assistant for freelancers. While every flag is cross-referenced verbatim against published Philippine statutes (such as the Civil Code and Labor Code), it does not constitute formal attorney-client legal representation. For high-stakes litigation, consult a member of the Integrated Bar of the Philippines (IBP).",
  },
];

export function BillingView({ email }: { email: string }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [showComparison, setShowComparison] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isAnnual = billingCycle === "annual";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-12">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3 py-1 text-xs font-medium text-ink-2 shadow-2xs">
            <Scale className="size-3.5 text-[#b04000]" />
            <span>Priced for Philippine Freelancers &amp; Independent Studios</span>
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Plan &amp; Billing
          </h1>
          <p className="mt-2 text-sm sm:text-base text-ink-2 max-w-2xl leading-relaxed">
            Transparent, predictable legal defense grounded in Philippine statutory law. No enterprise seat minimums, no US-dollar markup.
          </p>
        </div>

        {/* Monthly / Annual Billing Switcher */}
        <div className="flex items-center gap-1.5 rounded-full border border-rule bg-surface p-1 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              !isAnnual
                ? "bg-[#08090a] text-white shadow-xs"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("annual")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isAnnual
                ? "bg-[#b04000] text-white shadow-xs"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            <span>Annual</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-white">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Research Preview Status Banner */}
      <div className="mt-8 rounded-2xl border border-[#e8c6a8] bg-gradient-to-r from-[#fff9f5] via-[#fbeee4] to-[#fbf0e8] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#b04000]/15 text-[#b04000] border border-[#b04000]/25">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#b04000]">
                  Academic Research Preview Active
                </span>
                <span className="rounded-full bg-[#b04000] px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                  Unlocked ₱0 Access
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-[#7a2e02] leading-relaxed">
                Signed in as <span className="font-semibold">{email}</span>. ClauseGuard is currently being evaluated for a University of San Agustin capstone thesis study. All accounts currently enjoy unrestricted Professional capabilities at no cost.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/corpus"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#b04000]/30 bg-surface px-3.5 py-2 text-xs font-semibold text-[#b04000] shadow-2xs hover:bg-[#b04000]/5 transition-colors"
          >
            <span>Explore Legal Corpus</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Pricing Cards Grid (3 Logical Tiers) */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-2xl border transition-all ${
                tier.popular
                  ? "border-[#b04000] bg-surface shadow-md ring-1 ring-[#b04000]/20"
                  : "border-rule bg-surface shadow-xs hover:border-rule-2"
              } p-6 sm:p-7`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-6">
                  <span className="rounded-full bg-gradient-to-r from-[#b04000] to-[#c84805] px-3 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider text-white shadow-xs">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-xl font-bold text-ink">{tier.name}</h2>
                  {tier.currentPlan && (
                    <span className="rounded-full border border-rule bg-raised px-2.5 py-0.5 text-[0.6875rem] font-semibold text-ink-2">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-ink-2 min-h-[36px] leading-relaxed">
                  {tier.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-5 border-b border-rule pb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
                      ₱{price.toLocaleString()}
                    </span>
                    <span className="text-xs text-ink-3 font-medium">
                      {price === 0 ? "/ forever" : isAnnual ? "/ mo, billed annually" : "/ month"}
                    </span>
                  </div>
                  {isAnnual && price > 0 && (
                    <p className="mt-1 font-mono text-[0.6875rem] text-[#b04000] font-medium">
                      Save ₱{((tier.monthlyPrice - tier.annualPrice) * 12).toLocaleString()} per year
                    </p>
                  )}
                </div>

                {/* Quick Specs Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-raised p-2.5 text-[0.6875rem]">
                  <div>
                    <span className="text-ink-3">Volume:</span>{" "}
                    <span className="font-semibold text-ink">{tier.specs.contractLimit}</span>
                  </div>
                  <div>
                    <span className="text-ink-3">Page Limit:</span>{" "}
                    <span className="font-semibold text-ink">{tier.specs.pageLimit}</span>
                  </div>
                  <div>
                    <span className="text-ink-3">Speed:</span>{" "}
                    <span className="font-semibold text-ink">{tier.specs.processingSpeed}</span>
                  </div>
                  <div>
                    <span className="text-ink-3">Retention:</span>{" "}
                    <span className="font-semibold text-ink">{tier.specs.retention}</span>
                  </div>
                </div>

                {/* Feature Highlights List */}
                <div className="mt-5">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-3">
                    Included Capabilities
                  </p>
                  <ul className="mt-3 flex flex-col gap-2.5">
                    {tier.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-xs text-ink-2 leading-relaxed">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-[#b04000]" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-5 border-t border-rule">
                {tier.currentPlan ? (
                  <div className="rounded-xl border border-rule bg-raised py-2.5 text-center text-xs font-semibold text-ink-2">
                    {tier.ctaText}
                  </div>
                ) : tier.popular ? (
                  <button
                    type="button"
                    disabled={tier.ctaDisabled}
                    className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#b04000] to-[#c84805] py-2.5 text-center text-xs font-semibold text-white shadow-sm hover:brightness-110 transition-all active:scale-[0.99]"
                  >
                    {tier.ctaText}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="w-full cursor-pointer rounded-xl border border-rule-2 bg-surface py-2.5 text-center text-xs font-semibold text-ink hover:bg-raised transition-colors active:scale-[0.99]"
                  >
                    {tier.ctaText}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Full Feature Comparison Table */}
      <div className="mt-14 rounded-2xl border border-rule bg-surface p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-5">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              Detailed Feature Comparison
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-2">
              Side-by-side technical and legal capability breakdown across each subscription level.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b04000] hover:underline cursor-pointer"
          >
            <span>{showComparison ? "Collapse comparison table" : "Expand full comparison table"}</span>
            <ChevronDown className={`size-3.5 transition-transform ${showComparison ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible content */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-x-auto"
          >
            <table className="w-full min-w-[620px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule text-ink-3">
                  <th className="py-3 pr-4 font-semibold w-2/5">Capability</th>
                  <th className="py-3 px-3 font-semibold text-center w-1/5">Starter (₱0)</th>
                  <th className="py-3 px-3 font-semibold text-center w-1/5 text-[#b04000]">
                    Professional (₱299)
                  </th>
                  <th className="py-3 pl-3 font-semibold text-center w-1/5">Studio (₱899)</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_CATEGORIES.map((cat) => (
                  <tbody key={cat.name}>
                    <tr>
                      <td
                        colSpan={4}
                        className="pt-6 pb-2 font-display text-xs font-bold uppercase tracking-wider text-ink border-b border-rule bg-raised/50 px-2"
                      >
                        {cat.name}
                      </td>
                    </tr>
                    {cat.rows.map((row) => (
                      <tr key={row.feature} className="border-b border-rule/60 hover:bg-raised/40">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-ink">{row.feature}</p>
                          <p className="text-[0.6875rem] text-ink-3 leading-snug">{row.description}</p>
                        </td>
                        <td className="py-3 px-3 text-center text-ink-2">
                          {typeof row.free === "boolean" ? (
                            row.free ? (
                              <Check className="mx-auto size-4 text-[#b04000]" />
                            ) : (
                              <X className="mx-auto size-4 text-ink-3/40" />
                            )
                          ) : (
                            <span className="font-mono text-[0.6875rem]">{row.free}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center bg-[#b04000]/[0.02] text-ink font-medium">
                          {typeof row.pro === "boolean" ? (
                            row.pro ? (
                              <Check className="mx-auto size-4 text-[#b04000]" />
                            ) : (
                              <X className="mx-auto size-4 text-ink-3/40" />
                            )
                          ) : (
                            <span className="font-mono text-[0.6875rem] text-[#b04000] font-semibold">
                              {row.pro}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pl-3 text-center text-ink-2">
                          {typeof row.agency === "boolean" ? (
                            row.agency ? (
                              <Check className="mx-auto size-4 text-emerald-600" />
                            ) : (
                              <X className="mx-auto size-4 text-ink-3/40" />
                            )
                          ) : (
                            <span className="font-mono text-[0.6875rem]">{row.agency}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Frequently Asked Questions */}
      <div className="mt-14">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">
          Frequently Asked Questions
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-ink-2">
          Everything you need to know about ClauseGuard billing, privacy, and research preview access.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={faq.q}
                className="rounded-xl border border-rule bg-surface overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-ink hover:bg-raised/50 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`size-4 text-ink-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-rule bg-raised/30 px-4 py-3 text-xs text-ink-2 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Support Notice */}
      <div className="mt-12 rounded-xl border border-rule bg-raised p-4 text-center text-xs text-ink-3">
        Questions regarding capstone evaluation or academic licensing? Reach the University of San Agustin research committee via the capstone adviser portal.
      </div>
    </main>
  );
}

