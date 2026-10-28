# Clause type to provision mapping

**Owner:** Salinas
**Task:** T8

ARM 2 of the grounding study (`static` in `grounding_arm`). Each clause type
in `lib/pipeline/taxonomy.ts` mapped to 1-2 provisions from
`corpus/civil-code/` and `corpus/labor-code/`, ranked by relevance.
`data/clause-type-mappings.json`.

**Status: first-pass draft, needs a legal-review pass before Day 4-5
annotation.** Every citation was checked against the actual article text in
`corpus/*/data/provisions.json` (never invented, never cited from memory),
but the *selection* of which 1-2 articles best ground each clause type is a
judgment call that should get a second set of eyes — ideally someone with
actual legal training — before this is treated as authoritative. Flag
anything that looks wrong rather than assuming it's settled.

## Why no Labor Code citations on `termination.unilateral`

The obvious instinct is to ground every termination clause against Labor
Code Art. 297 (termination by employer, just causes) alongside the Civil
Code citations. Deliberately left out: ClauseGuard's contracts are
freelance/consulting agreements between independent parties, not
employer-employee relationships, and the Labor Code's security-of-tenure
protections (Art. 294) generally don't apply to a genuine independent
contractor. Citing Art. 297 by default on every unilateral-termination
clause would imply an employee-level protection the freelancer signing the
contract likely doesn't have — which is a misinformation risk, not just an
imprecision, for a product whose entire pitch is grounding in the *correct*
law. The Labor Code corpus stays loaded for the `rag` arm, where retrieval
can surface it contextually if a specific document's language suggests
actual misclassification, rather than asserting it as a blanket default.

## Why some mappings are thin (1 provision, not 2-4)

A few clause types (`ip.assignment.*`, `dispute.arbitration`,
`dispute.venue`) only get Art. 1306 (freedom to stipulate, bounded by law/
morals/public policy) because the Civil Code's general Obligations and
Contracts title doesn't have a dedicated article for IP assignment or
arbitration procedure — those live in the IP Code and the ADR Act
respectively, neither of which is in this corpus yet. Citing Art. 1306 alone
is accurate, just not as specific as the other mappings. Worth extending the
corpus to those sources if IP/arbitration clauses turn out to be common in
the annotated sample.

## Loading

`npm run seed:corpus:mappings` runs `scripts/seed-provision-mappings.mjs`
after `scripts/seed-corpus.mjs` has populated `provisions` — it looks up
each `(code, article)` pair's row id and upserts into
`public.provision_mappings`. Must run in that order; a mapping referencing a
provision that hasn't been seeded yet will fail loudly rather than silently
skip it.
