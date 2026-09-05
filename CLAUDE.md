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
| `supabase/` (migrations, RLS policies), `tests/`, `eval/adversarial/`, `scripts/` | Zallen |
| grounding stage, `corpus/` | Salinas + Navarro |

Security findings go to Salinas, not a self-fix — see "Security model" below.

## Commands

```bash
npm run dev            # next dev
npm run build           # next build
npm run lint             # eslint
npm run test:security    # node --test against tests/security/**/*.test.mjs
```

There is no unit/integration test runner wired up yet (`tests/unit/`,
`tests/integration/` are placeholders — see their READMEs). The eval harness
under `eval/` is invoked separately from `tests/`; do not conflate the two —
`eval/` measures the model, `tests/` measures the software.

`test:security` needs `TEST_USER_A_EMAIL/PASSWORD` and `TEST_USER_B_EMAIL/PASSWORD`
in `.env.local` (two real, verified Supabase accounts, user A with at least one
uploaded document). If unset, the suite prints what's missing and skips —
that is not a pass.

## Architecture

**Next.js 16 (App Router) + Supabase (Postgres, pgvector, Storage, Auth,
Realtime), deployed on Vercel.** Model providers: Gemini (Google Generative AI)
and Groq (Llama 3.3 70B), server-side only.

### Pipeline state machine

Documents move through a status column guarded by the mutation that transitions
it — never trusted from the caller:

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

Pipeline stages, in order, under `lib/pipeline/`: `extract/` → `segment/` →
`ground/` → `score/`, plus an optional `negotiate/` stage that comes only
after all five objectives are met. Each stage writes its results and advances
document status in the same transaction.

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
  - `rag` — pgvector retrieval over the provision corpus (`NoRelevantProvision`
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

### Schema (frozen after Day 1 — see `supabase/migrations/README.md`)

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

Postgres **RLS is the security boundary**, not the API layer — assume any
operation RLS permits is reachable directly (this team has shipped that bug
before). Concretely:

- RLS is enabled on every table holding user data, no exceptions. Policies use
  `TO authenticated` plus an ownership check resolved server-side — never trust
  a document id supplied by the client.
- Per `supabase/migrations/0001_init.sql`: authenticated users hold `SELECT` on
  their own rows and `INSERT`/`DELETE` on `documents` only — **no `UPDATE`
  grant anywhere**. All pipeline writes go through the service role, which
  bypasses RLS and never reaches the browser. `risk_level`, `confidence`,
  `ground_truth_label`, and everything on `scoring_runs` must never be
  client-writable.
- `ground_truth_labels` has RLS on and no policy at all — it must return
  nothing to a browser session; it's the answer key.
- Storage buckets are private. Access only via short-lived signed URLs issued
  server-side after an ownership check. Treat a leaked signed URL as an
  incident.
- The Supabase **secret/service_role key** bypasses RLS — never let it reach
  `app/`, `components/`, or client-side `lib/` code, and never let a
  `NEXT_PUBLIC_`-prefixed variable hold a secret.
- Security tests (`tests/security/`) sign in with the publishable key only,
  never the service role key, and treat "empty result, no error" as the
  correct denial — Supabase RLS returns an empty result on denial, not an
  error, so `error === null && rows.length === 0` is the pass condition for a
  cross-tenant check. When a table is added to the schema, add it to
  `OWNED_TABLES` in `tests/security/helpers.mjs`.
- If a security test goes red: stop, tell Salinas, don't push a fix into
  `supabase/` yourself — the person who writes a control is deliberately not
  the person who clears it. See `tests/security/AUDIT-CHECKLIST.md` for the
  three-checkpoint audit (schema day, pre-usability, pre-deploy-freeze).

### Auth

Supabase Auth via `@supabase/ssr`. `lib/supabase/client.ts` (browser),
`lib/supabase/server.ts` (server components/actions, cookie-based),
`lib/supabase/middleware.ts` (session refresh, called from root
`middleware.ts` on every non-static request). Auth routes/actions live under
`app/auth/`; `app/login`, `app/signup`, `app/reset-password`,
`app/update-password` are the corresponding pages.

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
