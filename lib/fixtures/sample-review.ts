import type { ReviewedDocument, ScoredClause } from "@/lib/types";

/**
 * A worked example, hand-written. This is not model output.
 *
 * It exists for three jobs at once: the public /sample page, the Day 12
 * usability sessions, and the defence demo that must survive a degraded model
 * provider. Every verdict the product can produce appears at least once,
 * including the two most people forget to design for.
 *
 * The statutory citations below are ILLUSTRATIVE and unverified. Check every
 * article against the official text before this is shown to anyone outside the
 * team, and never let a model generate one.
 */

/** Marks by substring, so offsets cannot drift when the text is edited. */
function mark(text: string, ...phrases: string[]) {
  const marks: { start: number; end: number }[] = [];
  for (const p of phrases) {
    const start = text.indexOf(p);
    if (start !== -1) marks.push({ start, end: start + p.length });
  }
  return marks;
}

function clause(
  partial: Omit<ScoredClause, "marks"> & { markPhrases?: string[] },
): ScoredClause {
  const { markPhrases, ...rest } = partial;
  return { ...rest, marks: mark(rest.text, ...(markPhrases ?? [])) };
}

const C1_TEXT =
  "This Agreement commences on the Effective Date and continues until the Final Deliverable is accepted in writing by the Client.";

const C2_TEXT =
  "The Client may terminate this Agreement at any time, for any reason or no reason, effective immediately upon written notice. The Designer may not terminate this Agreement prior to Final Deliverable acceptance, and shall forfeit all accrued but unpaid fees upon any such attempted termination.";

const C3_TEXT =
  "All work product, including preparatory materials, conceptual sketches, and any derivative applications thereof, whether or not incorporated into the Final Deliverable, shall vest in the Client upon creation.";

const C4_TEXT =
  "Payment shall be made within thirty (30) days of receipt of a valid invoice. Late amounts accrue interest at one percent (1%) per month.";

const C5_TEXT =
  "The Designer shall indemnify and hold harmless the Client against any and all claims, losses, liabilities, and expenses of whatever nature arising out of or in connection with the Services, without limitation as to amount and regardless of fault.";

const C6_TEXT =
  "Neither party shall be liable for any failure to perform occasioned by a fortuitous event, provided that the affected party gives notice within five (5) days.";

const C7_TEXT =
  "The Designer shall not, for a period of twenty-four (24) months following termination, provide services of any kind to any person or entity engaged in a line of business similar to that of the Client anywhere in the Republic of the Philippines.";

export const SAMPLE_DOCUMENT: ReviewedDocument = {
  id: "sample",
  filename: "freelance-design-agreement.pdf",
  contractType: "Freelance services agreement",
  pageCount: 9,
  status: "partial",
  createdAt: "2026-08-24T09:12:00.000Z",
  clauses: [
    clause({
      id: "c1",
      ordinal: 1,
      label: "14.1",
      clauseType: "term.duration",
      text: C1_TEXT,
      page: 6,
      bboxes: [],
      riskLevel: "low",
      confidence: 0.94,
      rationale:
        "Standard. The agreement runs until the work is accepted, which is the usual arrangement for project work.",
      deviation: null,
      outcome: "ok",
      injectionSuspected: false,
      provisions: [],
    }),

    clause({
      id: "c2",
      ordinal: 2,
      label: "14.2",
      clauseType: "termination.unilateral",
      text: C2_TEXT,
      page: 6,
      bboxes: [],
      riskLevel: "high",
      confidence: 0.91,
      rationale:
        "Only the client can end this contract, and you give up fees you have already earned if you try to leave. Standard terms let either side terminate on notice and pay for work already accepted.",
      deviation:
        "Either side may terminate on 15 to 30 days' written notice, with payment for work accepted up to the termination date.",
      outcome: "ok",
      injectionSuspected: false,
      provisions: [
        {
          code: "CIVIL",
          article: "1308",
          text: "The contract must bind both contracting parties; its validity or compliance cannot be left to the will of one of them.",
        },
      ],
      markPhrases: [
        "for any reason or no reason, effective immediately upon written notice",
        "shall forfeit all accrued but unpaid fees",
      ],
    }),

    clause({
      id: "c3",
      ordinal: 3,
      label: "9.1",
      clauseType: "ip.assignment.broad",
      text: C3_TEXT,
      page: 4,
      bboxes: [],
      riskLevel: "medium",
      confidence: 0.42,
      rationale:
        "This may hand over sketches and concepts you never delivered, including work you could otherwise reuse. Whether that holds up depends on facts this tool cannot see.",
      deviation:
        "Assignment limited to accepted deliverables, with the designer keeping preparatory materials and a licence to show the work in a portfolio.",
      outcome: "ok",
      injectionSuspected: false,
      provisions: [],
      markPhrases: ["whether or not incorporated into the Final Deliverable"],
    }),

    clause({
      id: "c4",
      ordinal: 4,
      label: "5.2",
      clauseType: "payment.terms",
      text: C4_TEXT,
      page: 3,
      bboxes: [],
      riskLevel: "low",
      confidence: 0.88,
      rationale:
        "Ordinary payment terms. Thirty days is common and the late-payment interest works in your favour.",
      deviation: null,
      outcome: "ok",
      injectionSuspected: false,
      provisions: [],
    }),

    clause({
      id: "c5",
      ordinal: 5,
      label: "11.4",
      clauseType: "indemnity.uncapped",
      text: C5_TEXT,
      page: 5,
      bboxes: [],
      riskLevel: "high",
      confidence: 0.87,
      rationale:
        "You would cover the client's losses with no ceiling, even where the fault is not yours. On a project worth a few thousand pesos, the exposure is unlimited.",
      deviation:
        "Indemnity capped at the fees paid under the agreement, and limited to claims caused by your own negligence or breach.",
      outcome: "ok",
      injectionSuspected: false,
      provisions: [
        {
          code: "CIVIL",
          article: "1170",
          text: "Those who in the performance of their obligations are guilty of fraud, negligence, or delay, and those who in any manner contravene the tenor thereof, are liable for damages.",
        },
      ],
      markPhrases: [
        "without limitation as to amount and regardless of fault",
      ],
    }),

    clause({
      id: "c6",
      ordinal: 6,
      label: "16.1",
      clauseType: "force.majeure",
      text: C6_TEXT,
      page: 7,
      bboxes: [],
      riskLevel: null,
      confidence: null,
      rationale: null,
      deviation: null,
      // The failure mode most products hide. Shown, counted, and reported.
      outcome: "refusal",
      injectionSuspected: false,
      provisions: [],
    }),

    clause({
      id: "c7",
      ordinal: 7,
      label: "12.3",
      clauseType: "non.compete",
      text: C7_TEXT,
      page: 5,
      bboxes: [],
      riskLevel: "high",
      confidence: 0.55,
      rationale:
        "Two years, nationwide, across an entire industry. Restrictions like this are read narrowly here, and their reach is the usual reason they fail, but whether this one holds depends on facts we can't see.",
      deviation:
        "A shorter period, a defined geography, and a narrow definition of competing work, limited to clients you actually served.",
      outcome: "ok",
      injectionSuspected: false,
      provisions: [
        {
          code: "CIVIL",
          article: "1306",
          text: "The contracting parties may establish such stipulations, clauses, terms and conditions as they may deem convenient, provided they are not contrary to law, morals, good customs, public order, or public policy.",
        },
      ],
      markPhrases: [
        "twenty-four (24) months",
        "anywhere in the Republic of the Philippines",
      ],
    }),
  ],
};
