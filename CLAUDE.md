# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

ClauseGuard: a capstone project that ingests a contract, segments it into
clauses, classifies each clause by risk level with a confidence score, and
renders the result as a color-coded overlay on the original document. Risk
scoring is grounded in the Philippine Civil Code and Labor Code via RAG rather
than a model's uncited general legal knowledge.

Five committed objectives define "done" for this project (from the approved
proposal — changing one requires adviser sign-off):

1. Clause segmentation + risk classification as a heat-map overlay
2. Confidence calibration with human-review routing, correlated against ground truth
3. Model ablation: Gemini Flash / Flash-Lite / Llama 3.3 70B — accuracy, latency, cost per pipeline stage
4. RAG grounding in Civil Code / Labor Code provisions vs. an ungrounded baseline
5. Usability evaluation with real freelancers/small-business owners

`PLAN.md` is the full reference (deep review, threat model, failure modes,
schedule). `README.md` covers the same ground more briefly. Read `PLAN.md`
before making an architectural decision not covered here.

## Team and ownership

Every directory has its own `README.md` naming its owner and task ID — read it
before editing files there. At a glance:

| Area | Owner |
|---|---|
| `lib/pipeline/`, extraction, segmentation | Navarro |
| `lib/models/`, `lib/prompts/`, `lib/db/`, scoring stage, eval harness | Salinas |
| `convex/` schema and access-control functions | Salinas |
| `eval/adversarial/`, `scripts/`, `tests/` | Zallen |
| grounding stage, `corpus/` | Salinas + Navarro |

Split by failure visibility, not seniority: a missing ownership check fails
silently (returns rows it shouldn't, looks healthy until it isn't), so the
person who writes an access-control function is deliberately never the only
person clearing it. Security findings go to Salinas; don't patch `convex/`
access checks yourself. Full rationale in `PLAN.md` under "Team and
ownership." Note `PLAN.md` and several directory READMEs (`lib/db/`,
`tests/`) still describe the retired Supabase design.

## Commands

```bash
npm run dev             # next dev
npm run build           # next build
npm run lint            # eslint
npm run test:unit       # node --test tests/unit/**/*.test.mjs (pure pipeline stages, no DB)
npm test                # same as test:unit
npm run eval            # eval/harness/run-study.mjs (model study, not a test)
npx convex dev          # syncs convex/, writes CONVEX_DEPLOYMENT + NEXT_PUBLIC_CONVEX_URL to .env.local
npx convex codegen      # regenerates convex/_generated (fails if CONVEX_DEPLOYMENT is empty)

# single test file
node --import ./tests/setup/register-aliases.mjs --test tests/unit/segment.test.mjs
```

Unit tests run under plain `node --test`; `tests/setup/register-aliases.mjs`
supplies the `@/` import alias. `tests/integration/` is still a placeholder.
The eval harness under `eval/` is invoked separately from `tests/`; do not
conflate the two — `eval/` measures the model, `tests/` measures the software.

**There is no cross-tenant/authorization test suite.** The Supabase-era
`tests/security/` suite was deleted with the Supabase code and no Convex
equivalent exists yet (`convex/documents.ts` says so). Authorization is
currently verified only by reading each function.

Corpus seeding is done through Convex now (`internalMutation`s in
`convex/corpus.ts`: `upsertProvision`, `seedMappings`; `embedAllProvisions`
action for RAG embeddings); the old `seed:corpus` npm scripts are gone.

## Architecture

**Next.js 16 (App Router) front end on Vercel, Convex backend (database, file
storage, auth, vector search, scheduled actions).** Supabase was the original
design and is fully removed from the code (`supabase/`, `lib/supabase/`,
`tests/security/`, `lib/pipeline/run.ts` are deleted). `PLAN.md` still
describes Supabase + pgvector and records Convex as rejected — the code
overrides it; ask Salinas before treating either as settled.

- `convex/schema.ts` — tables, translated from the old Postgres schema. Reads
  as the source of truth for the data model.
- `convex/pipeline.ts` — a `"use node"` action: `start`/`retry` (public,
  ownership-checked) schedule `run` (`internalAction`), which executes
  extract → segment → ground → score, scoring in chunks of 3 parallel calls,
  and records per-stage metrics to `stageRuns`. Default grounding arm is
  `static`.
- `proxy.ts` (Next 16's replacement for `middleware.ts`) runs
  `convexAuthNextjsMiddleware`. UI reaches Convex through
  `components/convex-client-provider.tsx`.
- `convex/pipeline.ts` imports pure stage code from `lib/pipeline/{extract,
  segment,score,boxes}`, `lib/models`, and `lib/prompts` directly, so those
  must not import `server-only`, `next/*`, or anything browser/Next-specific.
  Constants can't be shared the other way: the clause-type union in
  `convex/schema.ts` is a hand-kept duplicate of `lib/pipeline/taxonomy.ts`
  (nothing enforces they match) — edit both.

Model providers: Gemini (Google Generative AI) and Groq, server-side only. Per
the header of `lib/models/index.ts`, the original ablation models were retired
in Nov 2026 (`gemini-2.0-*` 404; Groq dropped Llama), and the third leg is now
`openai/gpt-oss-120b` — not Llama. Note this substitution in Objective 3
write-ups.

### Pipeline state machine

Documents move through a status column guarded by the mutation that transitions
it (`documents.advanceStatus` takes `from[]` and `to`, and returns false if the
current status isn't allowed — that is also how two workers avoid claiming the
same document). Never trusted from the caller:

```
uploaded -> extracting -> extracted -> segmenting -> segmented -> scoring -> complete
                |                          |                        |
                v                          v                        +-> partial (some clauses failed)
            failed(extract)            failed(segment)               +-> failed(score)
```

`partial` is a first-class state, not an error: a clause that failed to score
is a clause at maximum uncertainty, and it routes to human review — the same
code path Objective 2 needs. Zero clauses detected is a terminal state with an
empty UI state, not a crash.

Pipeline stages, in order, under `lib/pipeline/` (orchestrated by `convex/pipeline.ts`): `extract/` → `segment/` →
`ground/` → `score/`, plus an optional `negotiate/` stage that comes only
after all five objectives are met. Each stage's results and status transition are
written by separate `internalMutation`s, so atomicity is by convention in the
action, not by a transaction — keep that in mind when adding a stage.

- **extract**: OCR + layout. Writes tokens, per-token bounding boxes, page
  geometry. Strips invisible/off-page text here — the cheapest prompt-injection
  mitigation, and it belongs at extraction, not in the scoring prompt.
- **segment**: splits text into clauses, assigns `clause_type` from the
  taxonomy. Bounding boxes are valid only for the extraction that produced
  them — `extraction_id` travels with every clause row so a re-extraction
  never renders a stale overlay against a newly rendered page.
- **ground**: supplies statutory context before scoring, selected by config
  via one of three arms recorded as `grounding_arm` on the scoring run —
  never branched across files:
  - `none` — ungrounded baseline
  - `static` — clause_type mapped to 2–4 fixed provisions
  - `rag` — Convex vector search (`by_embedding` index) over the provision corpus (`NoRelevantProvision`
    is a result, not a failure)
- **score**: assigns risk level + confidence per clause. Batches 5–10 clauses
  per call (a full pass is otherwise ~18k calls). `ModelRefusal` and
  `SchemaParseError` are counted separately from network faults — no
  catch-all error handling here, because refusal rate is an ablation column
  and a generic catch would hide it. The cascade for Objective 3: score
  everything with Flash-Lite, re-score only flagged/low-confidence clauses
  with Flash.

Model config lives in one place, keyed by pipeline stage (`lib/models/`) — the
entire Objective 3 ablation should be a config change. Prompts live as
versioned files under `lib/prompts/`, never as inline template strings; the
version is written to `scoring_runs.prompt_version` on every run, otherwise a
prompt edit is indistinguishable from a model or grounding effect. Document
text passed to a model is always data, explicitly delimited, never instruction.

### Schema (`convex/schema.ts`; shape frozen after Day 1 for annotated tables)

```
documents
  +-- extractions          (ocr_engine, settings, created_at)
        +-- clauses        (span, page, bbox[], clause_type, extraction_id)
              +-- ground_truth_labels  (clause_id, annotator_id, risk_level)
              +-- clause_scores  <--  scoring_runs
                    clause_id           run_id
                    run_id              model_id
                    risk_level          prompt_version
                    confidence          grounding_arm (none|static|rag)
                    rationale           temperature
                    tokens_in           created_at
                    tokens_out
                    latency_ms
                    outcome
```

`risk_level`/`confidence` are **never** columns on `clauses` — both Objectives
3 and 4 run multiple scoring passes over identical clauses, so results belong
on `clause_scores` joined to `scoring_runs`. Ground truth attaches to
`clauses`, never to a scoring run (multiple annotators per clause is what
makes Cohen's kappa computable).

### Derived verdict, not stored

`lib/types.ts` defines the domain types shared between the pipeline and the
UI. `verdictFor()` derives a `ClauseVerdict` (`flagged` | `review` |
`unreadable`) from `outcome`/`riskLevel`/`confidence` at read time — the
database always records the raw risk level and confidence (Chapter 4 needs
them uncensored), and the UI separately decides whether to trust them enough
to show as a verdict. `CONFIDENCE_THRESHOLD` (0.6) gates this and should be
derived from the confidence-vs-correctness curve on the annotated set, not
guessed. `bySeverity()` is the document's actual sort order: anything needing
human review outranks a confident low-risk clause.

### Security model

**There is no database-level security boundary.** Convex has no RLS: every
ownership check is hand-written in each public `query`/`mutation`/`action`
(`getAuthUserId(ctx)` plus `doc.ownerId === userId`), so a missing check is a
cross-tenant leak and nothing catches it. Concretely:

- Every public function that touches user-owned data must resolve the caller
  with `getAuthUserId` and verify ownership server-side — never trust a
  document id supplied by the client. Clauses, extractions, scores and stage
  runs are reached through their document, so check the parent.
- Clients get no `update` mutation. Status, `risk_level`, `confidence`, and
  everything on `scoringRuns`/`stageRuns` are written only by
  `internalMutation`s called from the pipeline action — never make one of
  these public.
- `groundTruthLabels` is the answer key: define its accessors as
  `internalQuery`/`internalMutation` only, never a public one. (The schema
  comment points at `convex/groundTruth.ts`, which does not exist yet.)
- Uniqueness the Postgres schema enforced ((extraction, ordinal),
  (clause, run), (code, article), …) is now a lookup-before-insert in the
  mutation, not a constraint.
- Uploads go through `convex/upload.ts` (`generateUploadUrl`) into Convex
  storage; `documents.storagePath` holds the storage id. Don't hand out
  storage URLs without an ownership check.
- Provider keys (`GOOGLE_GENERATIVE_AI_API_KEY`, `GROQ_API_KEY`) are
  server-side only — never `NEXT_PUBLIC_`-prefixed, never in `app/` client
  code or `components/`.
- Prompt injection: document text is data, delimited, never instruction;
  invisible/off-page text is stripped at extraction.

### Auth

Convex Auth (`@convex-dev/auth`): `convex/auth.ts`, `convex/auth.config.ts`,
`convex/http.ts`, session refresh in root `proxy.ts`. Pages: `app/login`,
`app/signup`, `app/reset-password`, `app/update-password`. Local setup needs
`CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in `.env.local` (run
`npx convex dev`); without them the app throws on every page and
`convex codegen` fails.

### UI

shadcn/ui (`style: radix-nova`, Tailwind v4, `iconLibrary: lucide`) — see
`components.json` for aliases. `components/ui/` is generated shadcn
primitives; `components/review/` (clause-card, review-view, verdict) is the
heat-map/review UI that consumes `lib/types.ts`. Framer Motion + Lenis are
installed for animation/smooth-scroll, wired behind reduced-motion.

### Corpus and eval (the durable assets)

`corpus/` (Civil Code, Labor Code, clause-type mapping), the annotated
Philippine dataset under `eval/datasets/ph/`, and `eval/harness/` are called
out in their READMEs as what survives if this becomes a commercial product —
treat changes here as higher-stakes than UI changes. `eval/adversarial/`
holds deliberately hostile contracts (obfuscated clauses, and prompt injection
via invisible/off-page text) — this is the project's most distinctive research
contribution; extraction's suppression of invisible text is what's tested
against it.
