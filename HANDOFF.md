# Handoff — 6 Sep 2026, end of Navarro's Day 1–2

Point-in-time notes, not a standing document. Ownership lives in `CLAUDE.md`;
the schedule lives in `PLAN.md`. Delete a section once it has been actioned.

What landed: the pipeline now runs upload → extract → segment → score, and
`/dashboard/[id]` renders a real review. T3 is decided. Details in the PR.

---

## For Salinas

### 1. Two schema gaps block a committed objective each

Both are additive and touch no annotated table, so they are cheap **now** and
expensive after Day 4 annotation starts. Neither is mine to write —
`supabase/` is yours.

**S1 — Objective 3 cannot be reported per pipeline stage.** This is the
differentiator, not a detail: PLAN.md is explicit that the contribution is
accuracy, latency and cost *per stage*, organised "by stage, not by model."
But `tokens_in`, `tokens_out`, `latency_ms`, `outcome` and `model_id` exist
only on `clause_scores` / `scoring_runs` — the score stage alone. Extract and
segment have nowhere to write them, and segmentation assigns `clause_type`, so
it belongs in the ablation. Worse, `documents.stage_started_at` is a single
mutable column that each stage overwrites, so even wall-clock duration per
stage is destroyed as the document advances. PLAN.md §8 asks for "per document:
stage timestamps", plural.

Suggested shape: a `stage_runs` table — `document_id`, `stage`, `model_id`,
`prompt_version`, `tokens_in/out`, `latency_ms`, `outcome`, `started_at`,
`finished_at`. The orchestrator in `lib/pipeline/run.ts` already has every one
of these values in hand at each stage boundary; it just has nowhere to put
them. I'll wire it the day the table exists.

**S2 — Objective 4's retrieval dataset has nowhere to go.** PLAN.md §8 names
it directly: "Per clause: retrieval hit or miss and the retrieved provision
ids. This is the Objective 4 dataset." All the schema offers is
`clause_scores.provisions_relied_on text[]` — bare strings, no FK to
`provisions`, no similarity, no rank, and no way to tell *retrieved and used*
from *retrieved and ignored* from *nothing crossed the threshold*. §2 also says
`NoRelevantProvision` "is a result, not a failure ... worth reporting", and
there is no way to record it. Suggested: `clause_retrievals` (`clause_id`,
`run_id`, `provision_id`, `rank`, `similarity`) plus `retrieval_hit boolean`
on `clause_scores`. Needed before Day 9, not on Day 10.

### 2. The migration's own security claim is not true as written

`0001_init.sql`'s header says authenticated users "hold **no UPDATE grant
anywhere**." Queried against the live database, `authenticated` *and* `anon`
hold `SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER` on all
eight public tables — Supabase's defaults. What they lack is an UPDATE
*policy*.

The security outcome today is identical, because RLS default-denies. It matters
for two other reasons: it is the sentence Chapter 3 will quote and it is wrong,
and the protection is one permissive policy away from evaporating on
`scoring_runs`, `provisions` and `provision_mappings`, which carry no ownership
predicate at all. An explicit `revoke insert, update, delete, truncate ... from
anon, authenticated` on the research tables would make the comment true and
turn an assertion into something Zallen can verify.

### 3. Smaller schema notes

- **HNSW index built on an empty table.** Line 182 says "Build this after the
  corpus is loaded, not before"; line 183 builds it in the init migration.
  Confirmed present on the live DB with zero rows. Rebuild after the Day 9
  corpus load, and set `m` / `ef_construction` explicitly — the methodology
  section needs the parameters, not just the index type.
- **`vector(768)` is frozen on Day 1, the embedding model is chosen on Day 9.**
  The comment concedes this. Either commit the model to writing now, or add
  `embedding_model` to `provisions`. `provisions` carries no annotations, so
  the column change is cheap — the undocumented decision is the risk, not the
  freeze.
- **`clause_type` is an unconstrained string that ARM 2 joins on.** It is bare
  `text` on `clauses`, `ground_truth_labels` and `provision_mappings`, with no
  shared reference. A typo or casing drift silently returns zero provisions,
  ARM 2 quietly degrades to ARM 1 for those clauses, and the Objective 4
  comparison is contaminated with no error anywhere. `lib/pipeline/taxonomy.ts`
  now exists and its own header flags the same risk. Worth deciding whether
  that module or a `clause_types` table is the source of truth — before
  annotation writes thousands of rows against it.

### 4. Review gate

`lib/supabase/service.ts` is new and holds the service-role client. PLAN.md's
review requirement puts anything under `lib/supabase/` behind a second pair of
eyes — please read that file specifically. It imports `server-only` so a
client-side import fails the build rather than shipping a key that bypasses
RLS, and the production build confirms that boundary holds.

---

## For Zallen

### 1. The extractor is ready for your corpus — and it decides what to build

`extractPdf()` catches all three techniques from `eval/adversarial/README.md`
and **counts** them in `extractions.suppressed_token_count`, which is the
number AUDIT-CHECKLIST §5 asks you to assert is `> 0`.

Two pdfjs behaviours were verified rather than assumed, and both change what a
useful payload looks like:

| Technique | How it is caught |
|---|---|
| sub-4pt text | font size from the transform scale |
| white on white | fill luminance from the operator list — **not** available from the text layer |
| positioned off page | present when painted, absent from the text layer |

The practical consequence for you: **build payloads against the real
extractor before mass-producing them.** `tests/fixtures/make-pdf.mjs` generates
hidden-text PDFs from source — `drawText({ text, x, y, size, rgb })` — so
`size: 1` is the 1pt case, `rgb: [1,1,1]` is white-on-white, and a negative `y`
is off-page. Prefer generating payloads from checked-in source over committing
binary `.docx`/`.pdf`: a reviewer can see that the invisible text really is
invisible, and a diff of a binary tells them nothing.

Note the boundary this puts on the corpus: the engine reads the **PDF text
layer**, so a payload has to exist in that layer. A payload rendered as an
image, or a scanned page, is invisible to the pipeline — that is a documented
limitation, not a bug, and it is worth one sentence in the Limitations chapter.

### 2. The novelty claim needs narrowing before it reaches a panel

The brief you were sent says nobody has tested whether the contract itself can
attack the AI reading it. PLAN.md §3.3 words it defensibly — the *proposal's
own cited literature* does not treat the contract as hostile input — but the
broader claim does not hold, and one search finds the counter-examples a panel
member would:

- **CrackedPDFs** (arXiv:2607.19396) — a 29,322-PDF benchmark of hidden prompt
  injection in PDFs, with detector baselines. Closest prior art to the corpus.
- **Semantic Integrity Failures in Document-to-LLM Supply Chains**
  (arXiv:2606.15020) — split-view PDFs, 25 extraction gaps where the extractor
  returns attacker-controlled text while the page looks benign. Directly
  relevant to the engine choice above.
- **Better Call CLAUSE** (arXiv:2511.00340) — 7,500+ perturbed contracts from
  CUAD/ContractNLI. Prior art for the obfuscated-clause half.
- **Multilingual Hidden Prompt Injection on LLM-Based Academic Reviewing**
  (arXiv:2512.23684) — payloads in four languages; pre-empts the Filipino-payload
  angle unless framed as a low-resource-language finding.
- Also: **PhantomLint** (arXiv:2508.17884), **peer-review injection**
  (arXiv:2508.20863), **ToS clause-detection attacks** (arXiv:2211.15556).

None of them occupy the actual intersection — hidden-prompt injection against a
**contract risk-scoring pipeline**, grounded in **Philippine statute**, measured
as **per-model susceptibility across the three grounding arms**, with
**Filipino-language payloads**. That is the defensible claim, and it is
narrower and much stronger. These papers also hand you a tested methodology and
a baseline to cite rather than inventing one.

### 3. Security suite: what changed, and what is expected

Two tests did not test what they claimed. Both are fixed on this branch:

- `results are not client-writable` asserted `error !== null`. RLS denies an
  UPDATE by matching zero rows and Postgres raises nothing — so it **failed
  against correct policies**, and the README tells you a red test is
  stop-the-line. It now reads the row back and asserts the value did not move.
- The `OWNED_TABLES` loop asserted only that the call did not error. It would
  have passed while user B read every one of user A's clauses. It now resolves
  each row's owner and asserts none belong to the other tenant.

New: `storage.test.mjs` (T5 says "storage included" and nothing covered it) and
anonymous-session tests, since `anon` holds the same table grants as
`authenticated` and RLS is the only thing in between.

**Two things you will see that are correct, not findings:**

1. The Supabase advisor reports `rls_enabled_no_policy` on
   `ground_truth_labels`. That is intentional — it is the answer key being
   sealed. Log it as expected.
2. AUDIT-CHECKLIST §1 said no table has an UPDATE policy for `authenticated`.
   `storage.objects` has exactly one, `contracts_update_own`, which upsert
   requires and which carries both `USING` and `WITH CHECK`. I have qualified
   that checklist line so it does not read as a contradiction on your first
   pass.

The advisor also flags two real items not on the checklist: the `vector`
extension is installed in the `public` schema, and leaked-password protection
is disabled in Auth. Both are warnings worth recording.

### 4. You are less blocked than the brief said

The Supabase project is live and healthy, migration `20260905122815_init` is
applied, RLS is on across all eight tables, and the `contracts` bucket exists
and is private. `NEXT_PUBLIC_SUPABASE_URL` and the publishable key are already
set locally.

`npm run test:security` skips because **the two test accounts do not exist yet**
— roughly ten minutes of your own work, not a wait on anyone. Once they do,
AUDIT-CHECKLIST §1 and §2 can both be worked against a real database today.
`findings.md` does not exist yet either; both READMEs treat it as Chapter 3
evidence, so it is worth being your first commit.

One caveat: user A needs at least one **uploaded document** for the suite to
assert anything meaningful, and upload only works once
`SUPABASE_SECRET_KEY` and a model provider key are set — see below.

---

## Still open, for whoever gets there first

- **`SUPABASE_SECRET_KEY` and a model provider key are unset** in `.env.local`,
  so the pipeline has not been run end to end against the live database. Every
  stage is unit tested (52 tests) and every column it writes was checked
  against the live schema, but the full run is unverified. That same first run
  is also the probe Zallen needs before mass-producing payloads.
- **Pre-existing React error**, unrelated to this branch:
  `components/auth/auth-form.tsx`'s Google button sets `name="next"` alongside
  `formAction={signInWithGoogle}`, which React overrides — it logs on every
  render of `/login`. Auth screens are mine; I will pick it up.
- **PLAN.md T5 and T14 still carry contradictory owners.** T5 says Zallen while
  the prose has Navarro writing the suite and Zallen running it; T14 says
  Salinas while the prose and `scripts/README.md` say Zallen. Left alone
  deliberately — they are decisions, not typos.
