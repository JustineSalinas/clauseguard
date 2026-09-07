# Product

## Register

brand

## Users

Filipino freelancers, independent contractors, and small-business owners —
designers, developers, consultants, agency operators — who are handed a
contract by a client with more leverage than they have. They read it on a
phone or a laptop, usually under time pressure, usually alone, and usually
after deciding that a lawyer costs more than the project deposit. They are
not lawyers and will not become lawyers. The job to be done is: *tell me what
in here is going to hurt me, show me the law that says so, and give me words
I can send back.*

A second audience matters for this project's actual deadline: capstone
advisers, panelists, and the freelancers recruited for Objective 5 usability
testing. They arrive at the landing page to judge whether the research claim
is real.

## Product Purpose

ClauseGuard ingests a contract, segments it into clauses, classifies each by
risk level with an explicit confidence score, and renders the result as a
colour-coded overlay on the original document — with every flag grounded in
a cited provision of the Philippine Civil Code or Labor Code rather than a
model's uncited general legal knowledge.

Success is not "the user feels informed." Success is the user pushes back on
a specific clause, citing a specific article, and gets it changed. Secondary
success: the five committed objectives in `README.md` are demonstrably met.

## Brand Personality

**Rigorous, plain-spoken, protective.**

Voice: the competent friend who happens to know the Civil Code. It states
what a clause does to you in ordinary words, then shows the article number as
proof. Confidence comes from citations, never from adjectives — if the page
has to say "powerful AI," the page has failed.

It is honest about its limits in the same breath as its claims. "Not a
substitute for legal counsel" is not fine print to bury; the willingness to
say *I am not sure about this clause* is the product's core differentiator
(Objective 2), and should read as strength, not as hedging.

Emotional goal: a freelancer arrives anxious and outmatched, and leaves with
specific, quotable leverage.

## Anti-references

- **Generic AI-SaaS landing.** Gradient heroes, glowing orbs, an uppercase
  tracked eyebrow above every section, identical three-up icon-card grids,
  hero metric rows. This template makes a real research artifact read as
  vaporware — the exact opposite of the claim being made.
- **LegalTech enterprise (Ironclad, DocuSign, LexisNexis).** Navy-and-gold
  corporate gravitas, handshake stock photography, procurement-committee
  prose. Wrong reader: the user is a solo freelancer with no legal budget,
  not a general counsel with a signing authority.
- Also avoid: playful consumer-fintech blobs and mascots (undercuts the
  statutory claim), and the academic-poster failure mode where objective
  numbers and methodology tables crowd out what the user actually gets.

## Design Principles

1. **Show the document, not a dashboard about the document.** The contract
   itself — real serif body text, real margins, real page numbers — is the
   primary visual object. The product is an annotation layer on the user's
   paper, not a BI tool that consumed it.

2. **Every claim carries its citation.** Nothing asserts risk without the
   article number attached, on the page and in the product. A screenshot of
   ClauseGuard should be checkable by a lawyer.

3. **Uncertainty is a designed state, not an error state.** `review` and
   `unreadable` get first-class visual treatment alongside `flagged`.
   Admitting a limit is the trust-building moment; hiding it is the failure.

4. **Never signal severity by colour alone.** Risk verdicts differ in *form*
   — solid wash, hatching, bare rule — so a colour-blind reader, or one
   glancing at a phone in daylight, still gets the distinction.

5. **Earn nothing with adjectives.** No superlatives, no invented social
   proof, no numbers the project cannot defend in a panel. If a section needs
   evidence the project does not yet have, change the section — do not
   fabricate the evidence.

## Accessibility & Inclusion

- **WCAG 2.1 AA** across all surfaces: body text ≥4.5:1, large text ≥3:1,
  placeholders held to the same 4.5:1 as body.
- **Severity is never colour-alone** (see Principle 4). The `.mk-*` verdict
  marks in `app/globals.css` encode this: solid wash = confident call,
  hatching = read but not called, bare rule = unreadable.
- **`prefers-reduced-motion: reduce`** is honoured on every animation, with
  a crossfade or instant-final-state alternative — never a dropped reveal.
- Content must be legible on a mid-range Android phone in daylight; the
  primary user reads contracts on the device they have, not a colour-managed
  desktop display.
- English is the interface language, but Filipino legal and colloquial terms
  (and the ₱ symbol) must render correctly and never be transliterated away.
