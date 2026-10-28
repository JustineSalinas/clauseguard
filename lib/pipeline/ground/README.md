# Grounding stage

**Owner:** Salinas + Navarro
**Task:** T8 / Objective 4

Resolves which statutory provisions (if any) the scoring prompt sees,
per the configured `grounding_arm`:

- **`none`** — no DB read, returns no provisions. The ungrounded baseline
  Objective 4 compares against.
- **`static`** — implemented. Looks up `clause_type` in
  `provision_mappings` (hand-curated, see `corpus/mapping/`), returns the
  1-2 ranked provisions.
- **`rag`** — **not implemented.** `provisions.embedding vector(768)` is
  not populated yet (see `corpus/civil-code/README.md`); calling
  `groundClause` with `arm: "rag"` throws `RagNotReadyError` rather than
  silently returning nothing, so a missing embedding step is never
  mistaken for a legitimate "no relevant provision found" result.

## Wiring it into the pipeline

`lib/pipeline/run.ts` currently hardcodes `FIRST_PASS_ARM = "none"` and
calls `scoreClause` with `provisions: []` directly — grounding was
deliberately left out of first-light orchestration (see the comment above
`FIRST_PASS_ARM`). To turn on the static arm:

```ts
import { groundClause } from "@/lib/pipeline/ground";

const { provisions } = await groundClause({
  db,
  clauseType: clause.clause_type,
  arm: "static", // was FIRST_PASS_ARM
});

const result = await scoreClause({
  // ...
  provisions,
  groundingArm: "static",
});
```

`db` is the same service-role client `run.ts` already holds — `GroundingDb`
(the type `groundClause` actually takes) is the minimal slice of its
surface this stage touches, typed by hand so unit tests can pass a tiny fake
instead of mocking the whole Supabase client. See
`tests/unit/ground.test.mjs`.

## Enabling the `rag` arm (not done yet)

1. Decide the embedding model (the `vector(768)` dimension on
   `provisions.embedding` already commits to 768 — pick a model that
   actually outputs that width, or the migration needs to change first).
2. Write an embedding-generation script (`scripts/embed-corpus.mjs`,
   doesn't exist yet) that reads `provisions`, calls the embedding model per
   row, and updates `embedding`.
3. Build the pgvector similarity query (`provisions_embedding_idx` already
   exists, HNSW + cosine ops, from migration 0001) and a `groundClauseRag`
   (or extend `groundClause`) that embeds the clause text and retrieves the
   nearest provisions above a similarity threshold.
4. Below that threshold is where `NoRelevantProvision` becomes real: a
   retrieval that finds nothing close enough is a legitimate empty result,
   not a thrown error — same shape as the `static` arm's "no clause_type"
   case.
