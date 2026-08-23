# ClauseGuard

**A SaaS-Based Contract Clause Identification and Risk Flagging Platform for
Small Businesses and Freelancers**

Capstone project, College of Liberal Arts, Sciences, and Education,
University of San Agustin.

ClauseGuard ingests a contract, segments it into clauses, classifies each clause
by risk level with an explicit confidence score, and renders the result as a
colour-coded overlay on the original document. Clause risk scoring is grounded
in the Philippine Civil Code and Labor Code rather than a model's uncited
general legal knowledge.

## The five committed objectives

These come from the approved proposal. They, not any feature list, define done.
Changing one requires adviser sign-off and a proposal amendment.

| # | Objective |
|---|---|
| 1 | Clause segmentation and risk classification, rendered as a heat-map overlay on the original document |
| 2 | Confidence calibration with human-review routing, correlated against ground truth |
| 3 | Model ablation across Gemini Flash, Flash-Lite, and Llama 3.3 70B: accuracy, latency, and cost **per pipeline stage** |
| 4 | RAG grounding in Civil Code and Labor Code provisions, measured against an ungrounded baseline |
| 5 | Usability and perceived usefulness evaluation with real freelancers and small-business owners |

## Team

| Member | Role |
|---|---|
| Salinas | Project manager, backend developer |
| Navarro | Backend developer |
| Zallen | Security, QA, systems |

## Stack

- **Next.js on Vercel** — application and pipeline stage functions
- **Supabase Postgres** — relational data and the evaluation schema
- **pgvector** — retrieval index over statutory provisions (Objective 4)
- **Supabase Storage** — uploaded contracts, private buckets, signed URLs only
- **Supabase Realtime** — progressive results as each pipeline stage completes
- **Supabase Auth** — accounts

## Repository layout

```
lib/pipeline/     extract, segment, ground, score        Navarro + Salinas
lib/prompts/      versioned prompt files                 Salinas
lib/models/       model config keyed by stage            Salinas
lib/db/           typed schema access                    Salinas
supabase/         migrations, RLS policies, triggers     Zallen + Salinas
eval/             harness, datasets, adversarial suite   Salinas + Zallen
corpus/           Civil Code, Labor Code, clause mapping Salinas
tests/            unit, integration, security            Zallen
scripts/          ingestion, ablation runs, demo prep    Zallen
docs/             proposal, published sprint plan        Salinas
```

Every folder carries a README naming its owner and the task it belongs to.

## Three things that are easy to get wrong

**The schema is frozen after Day 1.** Risk level and confidence do not live on
the clause row. Objectives 3 and 4 both run multiple scoring passes over
identical clauses, so results belong in `clause_scores`, joined to a
`scoring_runs` table carrying `model_id`, `prompt_version`, and `grounding_arm`.
Getting this wrong forces a migration plus re-annotation mid-sprint. See
`supabase/migrations/README.md`.

**RLS is the security boundary, not the API layer.** Assume any operation RLS
permits is reachable directly. Pair every permissive `FOR UPDATE` policy with
its guard trigger. `risk_level`, `confidence`, `ground_truth_label`, and
everything on `scoring_runs` must never be client-writable. See
`supabase/policies/README.md`.

**The evaluation harness measures the model; `tests/` measures the software.**
Different axes, neither substitutes for the other. Conflating them leaves you
unable to tell a prompt regression from a bug.

## Plan

[`PLAN.md`](PLAN.md) is the full reference: the deep review, error and rescue
map, threat model, failure modes registry, and the seven-day schedule with
per-person assignments.

[`docs/plan.html`](docs/plan.html) is the published sprint view.

## Status

Greenfield. Structure and plan only, no implementation yet.
