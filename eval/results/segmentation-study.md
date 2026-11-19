# Segmentation study: rule-based vs LLM (Muse Spark) segmenter

**Date:** 2026-11-19
**Data:** `eval/datasets/ph/benchmark.json` (15 annotated clauses, 14 sources)
**Harness:** `eval/harness/segmentation-study.mjs`

## What this measures (and what it cannot)

The Philippine set is 15 isolated clauses: no full contracts, no clause-boundary
annotations. So the 15 clauses were assembled into synthetic contracts (3
orderings: dataset order + 2 seeded shuffles) and rendered 5 ways. Boundaries are
therefore known by construction, and both segmenters receive byte-identical text.

- **Precision / recall / F1:** a predicted clause counts as correct if its token-F1
  against a distinct gold clause is >= 0.8 (1-to-1 greedy matching). Headings the
  renderer adds (e.g. "Article IV - Title") are tolerated by this threshold.
- **Exact-text recall:** share of gold clauses whose predicted text is identical
  after whitespace/case normalisation (penalises pulled-in headings or page footers).
- **Clauses / gold:** predicted count divided by true count (1.00x is ideal; <1 merges, >1 over-splits).
- **Type acc (matched):** among matched clauses, `suggestedType` equals the dataset's `clauseType`
  (no suggestion counts as "other"). In renderings B and D the heading names the clause, which
  can hint a type to either segmenter; A, C and E contain only the clause text.
- LLM: 2 runs per cell (output is not deterministic). Rules are deterministic, so their rows repeat.

**Not covered:** real contracts, real OCR noise, long documents, or any independent sample:
the same 15 clauses recur across orderings, renderings and repeats, so rows are not
independent. n=15 unique clauses; read gaps as indicative, not significant.

## Results

| Rendering | Segmenter | Precision | Recall | F1 | Exact-text recall | Clauses / gold | Type acc (matched) |
|---|---|---|---|---|---|---|---|
| A numbered | rules | 100% | 100% | 100% | 100% | 1.00x | 27% |
| A numbered | LLM (raw; 0/6 fell back) | 100% | 100% | 100% | 100% | 1.00x | 100% |
| E numbered + page footers | rules | 100% | 100% | 100% | 80% | 1.00x | 22% |
| E numbered + page footers | LLM (raw; 0/6 fell back) | 100% | 100% | 100% | 100% | 1.00x | 100% |
| B headed, unnumbered | rules | 94% | 100% | 97% | 0% | 1.07x | 67% |
| B headed, unnumbered | LLM (raw; 0/6 fell back) | 100% | 100% | 100% | 0% | 1.00x | 100% |
| D Article headings | rules | 94% | 100% | 97% | 0% | 1.07x | 67% |
| D Article headings | LLM (raw; 0/6 fell back) | 100% | 100% | 100% | 0% | 1.00x | 100% |
| C unnumbered run-together | rules | 0% | 0% | 0% | 0% | 0.07x | 0% |
| C unnumbered run-together | LLM (raw; 0/6 fell back) | 100% | 100% | 100% | 100% | 1.00x | 99% |

## LLM cost and latency

30 successful LLM calls (0 of 30 fell back to rules): avg 1309 input /
1097 output tokens, 2752 ms per document (15 clauses, ~4k chars).
Total spend for this run at list prices ($1.25 / $4.25 per M tokens): about $0.189.
