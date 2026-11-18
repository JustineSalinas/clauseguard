# Segmentation stage

**Owner:** Navarro

Splits extracted text into clauses and assigns a clause_type from the taxonomy.

Writes one row per clause, keyed to the extraction that produced it. Bounding
boxes are valid only for their own extraction, so extraction_id travels with
them. A re-extraction must never render a stale overlay against a newly
rendered page.

Zero clauses detected is a terminal state with an empty state in the UI, not a
crash.

## Two segmenters, one contract

Both take the extracted text and return `SegmentedClause[]`, so boxes, storage
and scoring don't know which ran.

| Mode | Where | Notes |
|---|---|---|
| `rules` (default) | `index.ts` `segmentClauses` | Regex on clause numbers, paragraph fallback. No model, no network. |
| `llm` | `llm.ts` `segmentClausesLlm` | Muse Spark 1.1 via the Meta Model API. Falls back to `rules` on any failure. |

Choose with the `segmenter` arg on `pipeline.start` / `pipeline.retry`, or the
`SEGMENTER_DEFAULT` Convex env var (`npx convex env set SEGMENTER_DEFAULT llm`).
The `llm` mode also needs `META_MODEL_API_KEY` set on the Convex deployment.

### How the LLM path stays safe

- **The model returns line ranges, never text.** The extracted text is shown as
  numbered lines (`[L12] ...`); `buildClausesFromRanges` rebuilds each clause
  from the original lines. Clause text is verbatim by construction, which is
  what `lib/pipeline/boxes.ts` needs to place the overlay, and a hallucinated
  clause is impossible rather than unlikely.
- **Validation never repairs.** Out-of-order, overlapping, out-of-bounds or
  implausible ranges (too little coverage, one giant clause, every line its own
  clause) return `null`, and the rule-based segmenter runs instead.
- **It cannot fail a document.** Missing key, API error, refusal, timeout
  (60 s), malformed output, or text over 60,000 characters all fall back.
- **Prompt injection:** document lines are delimited data in `segment.v1`. The
  worst an obeyed injected line can do is produce ranges that fail validation.

### Measured live (2026-11-18)

Two synthetic contracts (numbered; lettered "Article I-IV" with an injected
instruction line), real Meta Model API calls:

- `json_schema` response format works and is used (`supportsStructuredOutputs`).
- Segmentation was identical and valid at every reasoning effort; output tokens
  rose from ~0.9k (`minimal`) to ~3.0-3.4k (`high`, up to ~19s). The segmenter
  uses `minimal` (`SEGMENT_REASONING_EFFORT` in `llm.ts`). About 580 input +
  ~900 output tokens per small contract.
- On the lettered contract it beat the rule-based segmenter (no phantom title
  clause, kept "Article I-IV" labels); on the numbered one the two agreed.
- This is a tiny sample of easy documents, not an evaluation. Compare on
  `eval/datasets/ph/` before making `llm` the default.

### What gets recorded

The `segment` `stageRuns` row carries `modelId`, `promptVersion` (`segment.v1`)
and token counts only when the LLM actually produced the clauses. Outcome is
`partial` when `llm` was requested but the rules ran instead, so fallback rate is
queryable. `extractions.settings.segmenter_requested` records what was asked for.

### Not an ablation model

Muse Spark is a production-stage model and is deliberately **not** in
`ABLATION_MODELS` (`lib/models/index.ts`): Objective 3's trio is frozen without
adviser sign-off.

### Data-handling caveat

With `llm` on, extracted contract text goes to Meta, a third external provider
after Google (OCR) and Anthropic (scoring). The Meta Model API is a US-only
public preview and its data-retention/training terms have not been reviewed.
Keep `rules` as the default until they are.

## Tests

`tests/unit/segment.test.mjs` (rules) and `tests/unit/segment-llm.test.mjs`
(range validation, verbatim rebuild, equivalence with `rules` on a numbered
contract). The network call itself is the thin shell in `segmentClausesLlm` and
is not unit tested.
