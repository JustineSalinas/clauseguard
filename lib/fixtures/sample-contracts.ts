import type { BoundingBox, ReviewedDocument } from "@/lib/types";
import { SAMPLE_DOCUMENT, clause } from "@/lib/fixtures/sample-review";

/**
 * Registry of hand-written sample reviews. NOT model output: the clauses are
 * synthetic, written to show common patterns in the contract types freelancers
 * and small-business owners actually sign (informal loans, home rentals,
 * mobile lending apps), and the verdicts are authored, not scored.
 *
 * Statutory citations are limited to Civil Code articles that exist in
 * corpus/civil-code/data/provisions.json, quoted from it. Do not add an
 * article here that is not in the corpus, and never let a model write one.
 */

export type SampleMeta = {
  slug: string;
  /** Short label for the picker. */
  label: string;
  /** Heading on the sample page. */
  title: string;
  category: string;
  /** One-paragraph description under the heading. */
  summary: string;
  doc: ReviewedDocument;
};

const ART_1159 = {
  code: "CIVIL" as const,
  article: "1159",
  text: "Obligations arising from contracts have the force of law between the contracting parties and should be complied with in good faith.",
};
const ART_1191 = {
  code: "CIVIL" as const,
  article: "1191",
  text: "The power to rescind obligations is implied in reciprocal ones, in case one of the obligors should not comply with what is incumbent upon him.",
};
const ART_1229 = {
  code: "CIVIL" as const,
  article: "1229",
  text: "The judge shall equitably reduce the penalty when the principal obligation has been partly or irregularly complied with by the debtor. Even if there has been no performance, the penalty may also be reduced by the courts if it is iniquitous or unconscionable.",
};
const ART_1306 = {
  code: "CIVIL" as const,
  article: "1306",
  text: "The contracting parties may establish such stipulations, clauses, terms and conditions as they may deem convenient, provided they are not contrary to law, morals, good customs, public order, or public policy.",
};
const ART_1308 = {
  code: "CIVIL" as const,
  article: "1308",
  text: "The contract must bind both contracting parties; its validity or compliance cannot be left to the will of one of them.",
};

const base = { injectionSuspected: false, bboxes: [] as BoundingBox[] };

// ------------------------------------------------------- personal loan ----

const LOAN: ReviewedDocument = {
  id: "sample-loan",
  filename: "personal-loan-agreement.pdf",
  contractType: "Personal loan agreement",
  pageCount: 4,
  status: "partial",
  createdAt: "2026-09-02T08:30:00.000Z",
  clauses: [
    clause({
      ...base,
      id: "l1",
      ordinal: 1,
      label: "2",
      clauseType: "payment.terms",
      text: "The Borrower shall repay the principal of Fifty Thousand Pesos (PHP 50,000.00) in six (6) equal monthly instalments, each due on the fifth (5th) day of the month beginning October 2026.",
      page: 1,
      riskLevel: "low",
      confidence: 0.93,
      rationale:
        "A fixed amount, a fixed schedule and a start date. You can see exactly what is due and when.",
      deviation: null,
      outcome: "ok",
      provisions: [],
    }),
    clause({
      ...base,
      id: "l2",
      ordinal: 2,
      label: "3",
      clauseType: "payment.terms",
      text: "The loan bears interest at five percent (5%) per month, computed on the original principal, payable together with each instalment.",
      page: 1,
      riskLevel: "high",
      confidence: 0.84,
      rationale:
        "5% a month is 60% a year, and because it is charged on the original amount rather than what is left, you keep paying interest on money you have already repaid. Courts can reduce interest this high when it is unconscionable.",
      deviation:
        "A lower stated rate, charged on the outstanding balance, with the total interest in pesos written into the agreement.",
      outcome: "ok",
      provisions: [ART_1306, ART_1229],
      markPhrases: ["five percent (5%) per month", "computed on the original principal"],
    }),
    clause({
      ...base,
      id: "l3",
      ordinal: 3,
      label: "5",
      clauseType: "payment.penalty",
      text: "Any instalment unpaid on its due date incurs a penalty of three percent (3%) of the total outstanding balance for each day of delay, in addition to the interest in Section 3.",
      page: 2,
      riskLevel: "high",
      confidence: 0.9,
      rationale:
        "3% of the whole balance every day, on top of the interest. A single late instalment could cost more than the loan itself within weeks.",
      deviation:
        "A flat late fee on the missed instalment only, with a cap on the total penalty.",
      outcome: "ok",
      provisions: [ART_1229],
      markPhrases: [
        "three percent (3%) of the total outstanding balance for each day of delay",
        "in addition to the interest",
      ],
    }),
    clause({
      ...base,
      id: "l4",
      ordinal: 4,
      label: "6",
      clauseType: "termination.unilateral",
      text: "The Lender may declare the entire balance immediately due and demandable if the Borrower misses any payment, or if the Lender in its sole judgment believes the Borrower's ability to pay has been impaired.",
      page: 2,
      riskLevel: "high",
      confidence: 0.78,
      rationale:
        "Missing one payment is a normal acceleration trigger. The second half is the problem: the lender can call the whole loan on its own opinion, with no event you could point to or fix.",
      deviation:
        "Acceleration only after a missed payment stays unpaid for a stated cure period, with written notice first.",
      outcome: "ok",
      provisions: [ART_1308],
      markPhrases: ["in its sole judgment believes the Borrower's ability to pay has been impaired"],
    }),
    clause({
      ...base,
      id: "l5",
      ordinal: 5,
      label: "8",
      clauseType: "payment.penalty",
      text: "In case of suit, the Borrower shall pay attorney's fees equivalent to twenty-five percent (25%) of the amount due, plus costs of collection.",
      page: 3,
      riskLevel: "medium",
      confidence: 0.46,
      rationale:
        "A fixed percentage for legal fees is common, and 25% is on the high side. Whether a court would trim it depends on the amount and how much work the case took, which this tool cannot see.",
      deviation: "Reasonable attorney's fees as fixed by the court, not a set percentage.",
      outcome: "ok",
      provisions: [],
      markPhrases: ["twenty-five percent (25%) of the amount due"],
    }),
    clause({
      ...base,
      id: "l6",
      ordinal: 6,
      label: "9",
      clauseType: "dispute.venue",
      text: "Any action arising from this Agreement shall be filed exclusively in the courts of the Lender's place of business, and the Borrower waives any other venue.",
      page: 3,
      riskLevel: "medium",
      confidence: 0.71,
      rationale:
        "Fixed venues are normal in loan papers. It matters to you only if the lender is far from where you live, since you would have to travel to defend yourself.",
      deviation: "Venue where the Borrower resides, or where either party resides.",
      outcome: "ok",
      provisions: [ART_1306],
      markPhrases: ["exclusively in the courts of the Lender's place of business"],
    }),
    clause({
      ...base,
      id: "l7",
      ordinal: 7,
      label: "11",
      clauseType: "entire.agreement",
      text: "This Agreement contains the entire understanding of the parties. The Borrower acknowledges having read and understood all of its terms ____ [illegible initials] ____",
      page: 4,
      riskLevel: null,
      confidence: null,
      rationale: null,
      deviation: null,
      outcome: "parse_error",
      provisions: [],
    }),
  ],
};

// ------------------------------------------------------- residential lease

const LEASE: ReviewedDocument = {
  id: "sample-lease",
  filename: "residential-lease-contract.pdf",
  contractType: "Residential lease",
  pageCount: 5,
  status: "partial",
  createdAt: "2026-09-09T10:00:00.000Z",
  clauses: [
    clause({
      ...base,
      id: "h1",
      ordinal: 1,
      label: "1",
      clauseType: "term.duration",
      text: "The lease runs for one (1) year from 1 October 2026 to 30 September 2027, at a monthly rent of Twenty Thousand Pesos (PHP 20,000.00) payable on or before the first day of each month.",
      page: 1,
      riskLevel: "low",
      confidence: 0.95,
      rationale: "A fixed term, a fixed rent and a clear due date. Nothing unusual.",
      deviation: null,
      outcome: "ok",
      provisions: [],
    }),
    clause({
      ...base,
      id: "h2",
      ordinal: 2,
      label: "3",
      clauseType: "payment.terms",
      text: "The Lessee shall pay two (2) months' advance rent and three (3) months' deposit. The deposit shall be forfeited in full if the Lessee vacates before the end of the term, regardless of the reason.",
      page: 1,
      riskLevel: "high",
      confidence: 0.82,
      rationale:
        "Two months advance and a three-month deposit is a lot to put down already. Losing all of it for leaving early, even if the unit becomes unliveable, turns the deposit into a penalty with no link to the landlord's actual loss.",
      deviation:
        "Deposit returned less documented damage and unpaid rent, with forfeiture limited to the landlord's proven loss.",
      outcome: "ok",
      provisions: [ART_1229],
      markPhrases: [
        "forfeited in full if the Lessee vacates before the end of the term, regardless of the reason",
      ],
    }),
    clause({
      ...base,
      id: "h3",
      ordinal: 3,
      label: "4",
      clauseType: "amendment",
      text: "The Lessor may increase the monthly rent at any time during the term upon fifteen (15) days' notice, and the Lessee's continued occupancy shall be deemed acceptance of the increase.",
      page: 2,
      riskLevel: "high",
      confidence: 0.89,
      rationale:
        "A fixed-term lease with a rent that only the landlord can change is not really fixed. Staying in your own home cannot count as agreeing to a price you never negotiated.",
      deviation:
        "Rent fixed for the term, with any increase applying only at renewal and only by written agreement of both parties.",
      outcome: "ok",
      provisions: [ART_1308],
      markPhrases: [
        "increase the monthly rent at any time during the term",
        "continued occupancy shall be deemed acceptance of the increase",
      ],
    }),
    clause({
      ...base,
      id: "h4",
      ordinal: 4,
      label: "7",
      clauseType: "warranty",
      text: "The Lessee accepts the premises as-is and shall bear the cost of all repairs, whether ordinary or structural, and the Lessor shall have no liability for defects, leaks, or damage of any kind.",
      page: 2,
      riskLevel: "high",
      confidence: 0.8,
      rationale:
        "Tenants normally handle small day-to-day upkeep. Paying for structural problems and giving up any claim over leaks or defects puts the building's condition on you, though you do not own it.",
      deviation:
        "Tenant handles minor upkeep. Landlord handles structural and major repairs, and defects present at move-in.",
      outcome: "ok",
      provisions: [ART_1159, ART_1306],
      markPhrases: [
        "bear the cost of all repairs, whether ordinary or structural",
        "no liability for defects, leaks, or damage of any kind",
      ],
    }),
    clause({
      ...base,
      id: "h5",
      ordinal: 5,
      label: "9",
      clauseType: "other",
      text: "The Lessor or his representatives may enter the premises at any time, with or without notice, for inspection or any other purpose the Lessor deems necessary.",
      page: 3,
      riskLevel: "medium",
      confidence: 0.52,
      rationale:
        "Landlords usually have a right to inspect. Entry at any time without notice is broader than normal and affects your privacy at home, but how far a court would enforce it depends on the circumstances.",
      deviation: "Entry on 24 hours' notice at reasonable times, except in an emergency.",
      outcome: "ok",
      provisions: [],
      markPhrases: ["at any time, with or without notice"],
    }),
    clause({
      ...base,
      id: "h6",
      ordinal: 6,
      label: "11",
      clauseType: "termination.unilateral",
      text: "The Lessor may terminate this Lease at any time upon seven (7) days' written notice. The Lessee may terminate only upon sixty (60) days' notice and forfeiture of the deposit.",
      page: 3,
      riskLevel: "high",
      confidence: 0.92,
      rationale:
        "Either party can leave, but on very different terms: the landlord on a week's notice at no cost, you on two months' notice and the loss of your deposit.",
      deviation:
        "Equal notice for both sides, with early termination by the landlord limited to stated causes such as non-payment.",
      outcome: "ok",
      provisions: [ART_1308, ART_1191],
      markPhrases: [
        "at any time upon seven (7) days' written notice",
        "only upon sixty (60) days' notice and forfeiture of the deposit",
      ],
    }),
  ],
};

// ------------------------------------------------- mobile / digital lending

const DIGITAL_LOAN: ReviewedDocument = {
  id: "sample-digital-loan",
  filename: "cash-loan-app-terms.pdf",
  contractType: "Mobile lending app terms",
  pageCount: 6,
  status: "partial",
  createdAt: "2026-09-15T14:20:00.000Z",
  clauses: [
    clause({
      ...base,
      id: "d1",
      ordinal: 1,
      label: "2.1",
      clauseType: "payment.terms",
      text: "The Borrower applies for a loan of PHP 5,000.00 for a term of fourteen (14) days. A processing fee of PHP 1,000.00 will be deducted from the loan proceeds, and the Borrower shall repay PHP 5,000.00 on the due date.",
      page: 1,
      riskLevel: "high",
      confidence: 0.86,
      rationale:
        "You would receive PHP 4,000.00 and repay PHP 5,000.00 after two weeks. That is PHP 1,000.00 for 14 days, about 25% for a fortnight, and the app calls it a fee rather than interest.",
      deviation:
        "The amount you actually receive, the total you repay, and the interest rate stated plainly before you accept.",
      outcome: "ok",
      provisions: [ART_1306],
      markPhrases: [
        "processing fee of PHP 1,000.00 will be deducted from the loan proceeds",
        "shall repay PHP 5,000.00",
      ],
    }),
    clause({
      ...base,
      id: "d2",
      ordinal: 2,
      label: "4.2",
      clauseType: "payment.penalty",
      text: "Failure to pay on the due date will result in a late charge of five percent (5%) of the principal per day until the loan is fully paid, without limit.",
      page: 2,
      riskLevel: "high",
      confidence: 0.91,
      rationale:
        "5% a day with no ceiling means a PHP 5,000.00 loan adds PHP 250.00 for every day, indefinitely. A court can reduce a penalty that is iniquitous or unconscionable.",
      deviation: "A capped late charge, with total charges never exceeding the principal.",
      outcome: "ok",
      provisions: [ART_1229],
      markPhrases: ["five percent (5%) of the principal per day", "without limit"],
    }),
    clause({
      ...base,
      id: "d3",
      ordinal: 3,
      label: "6.1",
      clauseType: "confidentiality",
      text: "The Borrower authorizes the Company to access his contacts, photos, and location, and to send messages about the Borrower's overdue account to any person in his contact list.",
      page: 3,
      riskLevel: "high",
      confidence: 0.88,
      rationale:
        "Messaging your friends, family and coworkers about a debt is a pressure tactic, and consent buried in an app agreement is weak protection for the lender. Handing over your whole phone's contacts and photos goes well beyond what a loan needs.",
      deviation:
        "Data collected limited to what is needed to assess the loan, with no contact with third parties about the debt.",
      outcome: "ok",
      provisions: [ART_1306],
      markPhrases: [
        "access his contacts, photos, and location",
        "send messages about the Borrower's overdue account to any person in his contact list",
      ],
    }),
    clause({
      ...base,
      id: "d4",
      ordinal: 4,
      label: "8.3",
      clauseType: "amendment",
      text: "The Company may revise these Terms, including fees and charges, at any time by posting the revised Terms in the App. Continued use of the App constitutes acceptance.",
      page: 4,
      riskLevel: "high",
      confidence: 0.83,
      rationale:
        "The lender can change the price of a loan you already took by updating a page in the app. A contract's terms cannot depend on the will of one side alone.",
      deviation:
        "Changes apply only to new loans, announced in advance, and never to a loan already in progress.",
      outcome: "ok",
      provisions: [ART_1308],
      markPhrases: [
        "revise these Terms, including fees and charges, at any time",
        "Continued use of the App constitutes acceptance",
      ],
    }),
    clause({
      ...base,
      id: "d5",
      ordinal: 5,
      label: "9.1",
      clauseType: "assignment.rights",
      text: "The Company may assign or sell this loan and any of its rights to any third party without notice to the Borrower.",
      page: 4,
      riskLevel: "medium",
      confidence: 0.58,
      rationale:
        "Lenders commonly sell loans to collectors. What matters is that you may not know who to pay or who now holds your data. We are not sure how strongly this affects you, so please read it yourself.",
      deviation: "Written notice of any assignment, with your payment terms and data protections unchanged.",
      outcome: "ok",
      provisions: [],
      markPhrases: ["without notice to the Borrower"],
    }),
    clause({
      ...base,
      id: "d6",
      ordinal: 6,
      label: "10.2",
      clauseType: "liability.limitation",
      text: "The Borrower waives any right to dispute the amounts shown in the App, and the Company's records shall be conclusive evidence of the amount owed.",
      page: 5,
      riskLevel: "high",
      confidence: 0.85,
      rationale:
        "If the lender's own app is final proof of what you owe, you cannot challenge a mistake or a wrong charge. A promise to stay silent about errors is difficult to square with the good-faith duty both sides have.",
      deviation:
        "Records are presumed correct unless the Borrower shows otherwise, with a clear way to dispute a charge.",
      outcome: "ok",
      provisions: [ART_1159, ART_1306],
      markPhrases: [
        "waives any right to dispute the amounts shown in the App",
        "conclusive evidence of the amount owed",
      ],
    }),
    clause({
      ...base,
      id: "d7",
      ordinal: 7,
      label: "12",
      clauseType: "severability",
      text: "If any provision is held invalid, the remaining provisions shall remain in full force and effect.",
      page: 6,
      riskLevel: "low",
      confidence: 0.96,
      rationale: "A standard severability clause that works in both directions.",
      deviation: null,
      outcome: "ok",
      provisions: [],
    }),
  ],
};

export const SAMPLES: SampleMeta[] = [
  {
    slug: "design-agreement",
    label: "Freelance design",
    title: "Freelance Design Agreement",
    category: "Freelance services",
    summary:
      "Seven clauses from a real-world contractor agreement. Two shift severe legal and financial risk onto the designer (Arts. 1308 and 1306), two are routed to human review, and one demonstrates unreadable OCR handling.",
    doc: SAMPLE_DOCUMENT,
  },
  {
    slug: "personal-loan",
    label: "Personal loan",
    title: "Personal Loan Agreement",
    category: "Loans",
    summary:
      "A private loan between individuals. Interest at 5% a month, a daily penalty on the whole balance, and a lender who can call the whole loan on its own opinion. Courts can cut back interest and penalties that are unconscionable (Art. 1229).",
    doc: LOAN,
  },
  {
    slug: "residential-lease",
    label: "Home rental",
    title: "Residential Lease Contract",
    category: "Housing",
    summary:
      "A one-year home rental. A rent that only the landlord can raise, a deposit forfeited for any early exit, structural repairs on the tenant, and very different exit terms for each side (Art. 1308).",
    doc: LEASE,
  },
  {
    slug: "cash-loan-app",
    label: "Cash-loan app",
    title: "Mobile Cash-Loan App Terms",
    category: "Digital loans",
    summary:
      "Terms for a short-term lending app. A fee taken out of the loan up front, a late charge of 5% a day with no cap, permission to message your contacts about the debt, and terms the lender can rewrite by posting an update.",
    doc: DIGITAL_LOAN,
  },
];

export function getSample(slug: string | undefined): SampleMeta {
  return SAMPLES.find((s) => s.slug === slug) ?? SAMPLES[0];
}
