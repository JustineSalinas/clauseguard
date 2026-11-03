"use client";

import { useState } from "react";
import {
  Scale,
  Copy,
  Check,
  MessageSquareQuote,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface PlaybookTactic {
  id: string;
  title: string;
  category: string;
  trap: string;
  statutoryBasis: string;
  articleCode: string;
  recommendedCounterLanguage: string;
  defaultEmailTemplate: (client: string, clauseNum: string, yourName: string) => string;
}

const PLAYBOOK_TACTICS: PlaybookTactic[] = [
  {
    id: "unilateral-termination",
    title: "Unilateral Termination Without Cause or Notice",
    category: "Termination & Mutuality",
    trap: "The client can cancel immediately at any time without paying for in-progress work, while you are locked in or face penalties for early exit.",
    statutoryBasis: "Article 1308, Civil Code of the Philippines: 'The contract must bind both contracting parties; its validity or compliance cannot be left to the will of one of them.'",
    articleCode: "Civil Code Art. 1308",
    recommendedCounterLanguage:
      "Either party may terminate this Agreement by providing at least fourteen (14) days prior written notice to the other party. Upon notice of termination, Client shall pay Contractor for all services performed and milestones completed up to the effective termination date on a pro-rata basis.",
    defaultEmailTemplate: (client, clauseNum, yourName) =>
      `Hi ${client || "Team"},\n\n` +
      `Thank you for sending over the agreement. I’ve completed my initial review and am excited about moving forward.\n\n` +
      `Regarding ${clauseNum || "Section 8.2 (Termination)"}: the current language allows immediate cancellation at the company's discretion without notice. Under Philippine contract law (Civil Code Art. 1308 on mutuality of contracts), termination rights must bind both parties equitably.\n\n` +
      `To protect both sides while keeping delivery flexible, I propose updating this clause to:\n\n` +
      `"Either party may terminate this Agreement by providing at least fourteen (14) days prior written notice. Upon notice, Client shall pay Contractor for all work completed up to the date of termination."\n\n` +
      `Let me know if this adjustment works for you so we can finalize the contract!\n\n` +
      `Best regards,\n` +
      `${yourName || "Your Name"}`,
  },
  {
    id: "restraint-of-trade",
    title: "Nationwide or Extended Post-Contract Non-Compete",
    category: "Non-Compete & Exclusivity",
    trap: "Restricting a freelance contractor from working with other clients in the same broad industry for 1–2 years after project completion.",
    statutoryBasis: "Article 1306, Civil Code & Philippine Supreme Court jurisprudence (Avon v. Luna; Rivera v. Solidbank): Non-compete covenants that lack reasonable limitations as to time, trade, and geography constitute void restraints of trade contrary to public policy.",
    articleCode: "Civil Code Art. 1306 & Jurisprudence",
    recommendedCounterLanguage:
      "Contractor agrees that during the term of this Agreement, Contractor shall not directly solicit the proprietary clients of the Company introduced during the engagement. Nothing herein shall restrict Contractor from providing general professional services to other entities within the same industry.",
    defaultEmailTemplate: (client, clauseNum, yourName) =>
      `Hi ${client || "Team"},\n\n` +
      `I’m eager to collaborate with your team. Reviewing ${clauseNum || "the Exclusivity & Non-Compete clause"}: the current wording restricts me from offering services to any industry company for an extended period after our project ends.\n\n` +
      `As an independent specialist, broad non-compete clauses pose severe career restrictions and are generally recognized as undue restraints of trade under Philippine Civil Code Art. 1306.\n\n` +
      `I propose narrowing this to non-solicitation of your direct clients:\n\n` +
      `"Contractor shall not directly solicit proprietary clients introduced by Company during the engagement, while remaining free to serve general independent clients across the industry."\n\n` +
      `This fully protects your proprietary client relationships without restricting my freelance practice. Looking forward to your thoughts!\n\n` +
      `Best regards,\n` +
      `${yourName || "Your Name"}`,
  },
  {
    id: "uncapped-indemnity",
    title: "Uncapped Indemnity & Consequential Liability",
    category: "Liability & Damages",
    trap: "Making the contractor liable for unlimited legal fees, lost profits, and indirect damages arising from third-party software or unforeseeable claims.",
    statutoryBasis: "Article 1170 & Article 2201, Civil Code of the Philippines: A contractor in good faith is liable only for damages that are natural and probable consequences of the breach, not remote or unlimited speculative losses.",
    articleCode: "Civil Code Arts. 1170 & 2201",
    recommendedCounterLanguage:
      "In no event shall either party's aggregate liability under this Agreement exceed the total fees actually paid or payable by Client to Contractor in the three (3) months preceding the claim. Neither party shall be liable for indirect, incidental, or consequential damages.",
    defaultEmailTemplate: (client, clauseNum, yourName) =>
      `Hi ${client || "Team"},\n\n` +
      `Regarding ${clauseNum || "the Indemnification clause"}: the agreement currently holds the contractor liable for unlimited damages and legal fees without a liability cap.\n\n` +
      `Under Philippine contract standards (Civil Code Arts. 1170 and 2201), damages must be bounded by foreseeability and mutual proportionality.\n\n` +
      `I propose adding a standard commercial mutual liability cap:\n\n` +
      `"Each party's maximum aggregate liability shall be capped at the total amount paid under this Agreement, excluding consequential or punitive damages."\n\n` +
      `This aligns with standard industry freelance practices while maintaining full accountability for agreed deliverables.\n\n` +
      `Best regards,\n` +
      `${yourName || "Your Name"}`,
  },
  {
    id: "delayed-payment",
    title: "Extended Net-60 / Net-90 or 'Pay-When-Paid' Terms",
    category: "Compensation & Milestones",
    trap: "Delaying payment 60 to 90 days after delivery, or conditioning payment on the client receiving funds from their external customer.",
    statutoryBasis: "Article 1169, Civil Code: Those obliged to deliver or do something incur in delay from the time the obligee demands the fulfillment of their obligation.",
    articleCode: "Civil Code Art. 1169",
    recommendedCounterLanguage:
      "Invoices shall be payable within fifteen (15) calendar days of receipt (Net-15). In the event of overdue payment exceeding thirty (30) days, Contractor reserves the right to suspend services until all outstanding balances are settled.",
    defaultEmailTemplate: (client, clauseNum, yourName) =>
      `Hi ${client || "Team"},\n\n` +
      `On the payment schedule in ${clauseNum || "Section 4"}: the current terms specify Net-60 days. Because I operate as an independent contractor with ongoing operational costs, 60-day cycles make project scheduling difficult.\n\n` +
      `Could we agree on Net-15 or Net-30 payment terms upon milestone completion?\n\n` +
      `"Invoices shall be payable within fifteen (15) calendar days of receipt, with delivery files handed over upon final balance clearance."\n\n` +
      `I can begin work as soon as we align on this schedule!\n\n` +
      `Best regards,\n` +
      `${yourName || "Your Name"}`,
  },
  {
    id: "ip-overreach",
    title: "Overreaching Background IP & Tool Assignment",
    category: "Intellectual Property",
    trap: "Assigning not only the custom project deliverables, but your pre-existing code frameworks, design assets, and personal tooling to the client.",
    statutoryBasis: "Republic Act No. 8293 (Intellectual Property Code of the Philippines): Pre-existing proprietary works remain the copyright of the creator unless explicitly assigned for valuable consideration.",
    articleCode: "IP Code (RA 8293)",
    recommendedCounterLanguage:
      "Upon receipt of full payment, Contractor hereby assigns to Client all right, title, and interest in and to the custom deliverables created under this Agreement. Contractor explicitly retains ownership of all pre-existing tools, templates, and general methodologies (Background IP), granting Client a non-exclusive license to use them solely in connection with the deliverables.",
    defaultEmailTemplate: (client, clauseNum, yourName) =>
      `Hi ${client || "Team"},\n\n` +
      `Regarding ${clauseNum || "Intellectual Property Ownership"}: I’m very happy to assign full ownership of all custom deliverables created for your company once final payment is completed.\n\n` +
      `However, the current language also includes pre-existing tools and templates. Under Philippine IP law (RA 8293), pre-existing creator frameworks remain separate from work-for-hire deliverables.\n\n` +
      `I suggest the standard distinction:\n\n` +
      `"Client owns all custom deliverables upon full payment. Contractor retains ownership of general background frameworks and templates, granting Client a perpetual license to use them."\n\n` +
      `Looking forward to locking this in and starting work!\n\n` +
      `Best regards,\n` +
      `${yourName || "Your Name"}`,
  },
];

export function PlaybookExplorer() {
  const [clientName, setClientName] = useState("");
  const [yourName, setYourName] = useState("");
  const [clauseInput, setClauseInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTactic, setExpandedTactic] = useState<string | null>(PLAYBOOK_TACTICS[0].id);

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Variable Customizer Bar */}
      <div className="rounded-xl border border-rule-2 bg-surface p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink">
          <Sparkles className="size-4 text-[#b04000]" />
          <span>Negotiation Email Personalizer</span>
        </div>
        <p className="mt-1 text-xs text-ink-3">
          Fill in the details below to auto-customize all counter-proposal pushback templates:
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-[0.6875rem] font-semibold text-ink-2 uppercase">Client / Company Name</label>
            <input
              type="text"
              placeholder="e.g. Acme Studio"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 h-8.5 w-full rounded-md border border-rule-2 bg-[#fafbfc] px-3 text-xs text-ink placeholder:text-ink-3 focus:border-[#b04000] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[0.6875rem] font-semibold text-ink-2 uppercase">Clause Section / Number</label>
            <input
              type="text"
              placeholder="e.g. Section 8.2"
              value={clauseInput}
              onChange={(e) => setClauseInput(e.target.value)}
              className="mt-1 h-8.5 w-full rounded-md border border-rule-2 bg-[#fafbfc] px-3 text-xs text-ink placeholder:text-ink-3 focus:border-[#b04000] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[0.6875rem] font-semibold text-ink-2 uppercase">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Maria Santos"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              className="mt-1 h-8.5 w-full rounded-md border border-rule-2 bg-[#fafbfc] px-3 text-xs text-ink placeholder:text-ink-3 focus:border-[#b04000] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 5 Playbook Tactics */}
      <div className="flex flex-col gap-4">
        {PLAYBOOK_TACTICS.map((tactic, idx) => {
          const isExpanded = expandedTactic === tactic.id;
          const emailDraft = tactic.defaultEmailTemplate(clientName, clauseInput, yourName);

          return (
            <div
              key={tactic.id}
              className="rounded-xl border border-rule bg-surface p-5 shadow-2xs transition-colors hover:border-[#cccccc]"
            >
              <div
                className="flex cursor-pointer items-start justify-between gap-4"
                onClick={() => setExpandedTactic(isExpanded ? null : tactic.id)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#fbeee4] font-mono text-xs font-bold text-[#b04000]">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-sm font-bold text-ink sm:text-base">
                        {tactic.title}
                      </h3>
                      <span className="rounded bg-raised px-2 py-0.5 font-mono text-[0.6875rem] font-medium text-ink-3 uppercase">
                        {tactic.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-2 line-clamp-1">{tactic.trap}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="rounded bg-amber-50 px-2 py-0.5 font-mono text-[0.6875rem] font-semibold text-amber-800 border border-amber-200">
                    {tactic.articleCode}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="size-4 text-ink-3" />
                  ) : (
                    <ChevronDown className="size-4 text-ink-3" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-5 flex flex-col gap-4 border-t border-rule pt-4">
                  {/* Trap and Law Breakdown */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-red-200/60 bg-red-50/40 p-3.5">
                      <span className="text-[0.6875rem] font-bold uppercase text-red-700">
                        The Client Trap
                      </span>
                      <p className="mt-1 text-xs text-ink-2 leading-relaxed">{tactic.trap}</p>
                    </div>

                    <div className="rounded-lg border border-rule bg-[#fafbfc] p-3.5">
                      <div className="flex items-center gap-1.5 text-[0.6875rem] font-bold uppercase text-[#b04000]">
                        <Scale className="size-3" />
                        <span>Philippine Statutory Grounding</span>
                      </div>
                      <p className="mt-1 font-contract text-xs italic text-ink leading-relaxed">
                        &ldquo;{tactic.statutoryBasis}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Proposed Contract Redline Text */}
                  <div className="rounded-lg border border-[#e8c6a8] bg-[#fbf6f1] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase text-[#b04000]">
                        Recommended Contract Clause Replacement
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${tactic.id}-redline`, tactic.recommendedCounterLanguage)}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#b04000] hover:text-[#8a3300]"
                      >
                        {copiedId === `${tactic.id}-redline` ? (
                          <>
                            <Check className="size-3 text-[#0c8c5e]" />
                            <span className="text-[#0c8c5e]">Copied redline</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            <span>Copy clause</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="mt-2 rounded bg-surface/90 p-3 font-contract text-xs font-medium text-ink leading-relaxed border border-[#e8c6a8]/60">
                      &ldquo;{tactic.recommendedCounterLanguage}&rdquo;
                    </p>
                  </div>

                  {/* Complete Ready-to-Send Email Template */}
                  <div className="rounded-lg border border-rule bg-surface p-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-rule pb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                        <MessageSquareQuote className="size-4 text-[#b04000]" />
                        <span>Ready-to-Send Pushback Email</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${tactic.id}-email`, emailDraft)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#b04000] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-[#8a3300]"
                      >
                        {copiedId === `${tactic.id}-email` ? (
                          <>
                            <Check className="size-3.5 text-white" />
                            <span>Copied to clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            <span>Copy Full Email Draft</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="mt-3 whitespace-pre-wrap font-sans text-xs leading-relaxed text-ink-2 bg-[#fafbfc] p-3.5 rounded-md border border-rule">
                      {emailDraft}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

