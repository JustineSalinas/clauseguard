-- Follow-up to 0001_init.sql, from HANDOFF.md (Navarro, 6 Sep 2026) after the
-- Day 2 pipeline landed and needed columns the initial schema did not have.
-- Three independent fixes, each additive, none touching an annotated table:
--
--   1. stage_runs        -- Objective 3 needs cost/latency PER STAGE, not
--                            only on the score stage.
--   2. clause_retrievals -- Objective 4's retrieval dataset had nowhere to
--                            go; provisions_relied_on is bare text, no rank,
--                            no similarity, no way to record a miss.
--   3. An explicit REVOKE on every table a client has no legitimate reason
--      to write to. 0001_init.sql's header claims "no UPDATE grant
--      anywhere" -- false as written. Supabase grants authenticated/anon
--      the full DML set on every table by default; RLS denies by having no
--      policy, not by the grant being absent. Today that is equivalent, but
--      scoring_runs, provisions, and provision_mappings carry no ownership
--      predicate at all, so protection there rests entirely on nobody ever
--      adding a permissive policy. The revoke makes the comment true and
--      turns "nobody would do that" into something Zallen's audit can
--      actually verify.

-- ------------------------------------------------------------ stage_runs ---

create type pipeline_stage as enum ('extract', 'segment', 'ground', 'score');

-- Stage-LEVEL completion, deliberately not score_outcome. That enum is a
-- per-CLAUSE LLM-call classification (refusal, safety_block, rate_limited...)
-- and already lives, unchanged, on clause_scores -- a score-stage row here
-- would need every clause in the batch to produce one value, which they do
-- not. extract and segment do not call a model at all: per lib/pipeline's
-- actual code they either succeed or throw a typed error
-- (EncryptedDocumentError, NoTextDetectedError, ...) that run.ts already
-- records on documents.failed_stage/failed_reason. What is missing, and all
-- this column needs to say, is stage-level completion: did every clause in
-- this stage's batch succeed (ok), did some fail while others produced a
-- result (partial, mirroring documents.status's own partial), or did the
-- stage fail outright (failed).
create type stage_run_outcome as enum ('ok', 'partial', 'failed');

-- One row per stage invocation per document. documents.stage_started_at is a
-- single mutable column every stage overwrites, so per-stage wall-clock
-- duration does not survive the document advancing -- this table is what
-- PLAN.md's "per document: stage timestamps, plural" actually requires.
-- lib/pipeline/run.ts already computes every one of these values at each
-- stage boundary; it has simply had nowhere to write them until now.
create table public.stage_runs (
  id             uuid primary key default gen_random_uuid(),
  document_id    uuid not null references public.documents (id) on delete cascade,
  stage          pipeline_stage not null,
  -- null for extract/segment, which do not call a model today. Populated the
  -- day either one does (e.g. a model-assisted segmenter).
  model_id       text,
  prompt_version text,
  -- Summed across every model call this stage invocation made -- for score,
  -- that is every batch; per-call detail stays on clause_scores.
  tokens_in      integer,
  tokens_out     integer,
  latency_ms     integer,
  outcome        stage_run_outcome not null default 'ok',
  started_at     timestamptz not null,
  finished_at    timestamptz,
  created_at     timestamptz not null default now()
);

create index stage_runs_document_idx on public.stage_runs (document_id, stage);

-- ------------------------------------------------------- clause_retrievals --

-- Objective 4's retrieval dataset. clause_scores.provisions_relied_on stays
-- as the human-readable citation list on the score itself; this table is the
-- retrieval EVENT -- what was fetched, at what rank and similarity, before
-- the model saw it -- which is what "retrieved and used" vs "retrieved and
-- ignored" vs "nothing crossed the threshold" actually requires. A retrieval
-- with zero rows here for a given (clause, run) is the NoRelevantProvision
-- case, which PLAN.md is explicit is a result worth reporting, not a failure.
create table public.clause_retrievals (
  id           uuid primary key default gen_random_uuid(),
  clause_id    uuid not null references public.clauses (id) on delete cascade,
  run_id       uuid not null references public.scoring_runs (id) on delete cascade,
  provision_id uuid not null references public.provisions (id) on delete cascade,
  rank         integer not null,
  similarity   numeric(5, 4),
  created_at   timestamptz not null default now(),
  unique (clause_id, run_id, provision_id)
);

create index clause_retrievals_clause_run_idx
  on public.clause_retrievals (clause_id, run_id, rank);

-- Whether at least one retrieved provision was actually cited in the score.
-- Denormalized onto clause_scores because every results-chapter query filters
-- on this, and joining out to clause_retrievals every time just to compute
-- "did retrieval help" is the kind of query nobody writes twice.
alter table public.clause_scores
  add column retrieval_hit boolean not null default false;

-- ------------------------------------------------ provisions: Day 9 note ---

-- Cheap now, per HANDOFF item 3: the embedding model is a Day 9 decision but
-- vector(768) was frozen on Day 1. Recording which model produced an
-- embedding costs nothing today and removes an undocumented assumption before
-- Day 9 arrives. Nullable: existing rows (there are none yet) and any
-- provision inserted before Day 9 simply have no value here.
alter table public.provisions
  add column embedding_model text;

-- Deliberately NOT touching provisions_embedding_idx here. HANDOFF confirmed
-- it exists on the live database with zero rows, exactly the "build after the
-- corpus is loaded" mistake 0001_init.sql's own comment warns against.
-- Rebuilding it belongs to the Day 9 corpus load, with m/ef_construction set
-- explicitly and recorded for the methodology section -- not to this
-- migration, which has no corpus to build it against either.

-- ------------------------------------------------------- clause_types FK ---

-- clause_type is bare `text` in three places (clauses, ground_truth_labels,
-- provision_mappings) with no shared reference, per HANDOFF item on this
-- exact risk. A typo or casing drift today would silently return zero
-- provision_mappings rows for that clause, degrading ARM 2 to ARM 1 for those
-- clauses with no error anywhere -- exactly the silent-failure shape this
-- project's error-handling philosophy exists to rule out everywhere else.
--
-- lib/pipeline/taxonomy.ts is the source of truth for labels and hint
-- keywords, which Postgres cannot read; this table is the source of truth for
-- referential integrity, which taxonomy.ts cannot enforce. The two lists must
-- be kept in sync by hand -- tests/unit's taxonomy coverage is the place to
-- assert that, not this migration -- but a drift now fails loudly as a
-- foreign key violation on insert, not silently as a zero-row join.
create table public.clause_types (
  id    text primary key,
  label text not null
);

insert into public.clause_types (id, label) values
  ('term.duration',            'Term / duration'),
  ('termination.unilateral',   'Unilateral termination'),
  ('termination.mutual',       'Mutual termination'),
  ('payment.terms',            'Payment terms'),
  ('payment.penalty',          'Payment penalty'),
  ('ip.assignment.broad',      'Broad IP assignment'),
  ('ip.assignment.limited',    'Limited IP assignment'),
  ('indemnity.uncapped',       'Uncapped indemnity'),
  ('indemnity.capped',         'Capped indemnity'),
  ('liability.limitation',     'Limitation of liability'),
  ('non.compete',              'Non-compete'),
  ('non.solicitation',         'Non-solicitation'),
  ('confidentiality',          'Confidentiality'),
  ('force.majeure',            'Force majeure'),
  ('dispute.arbitration',      'Dispute resolution / arbitration'),
  ('dispute.venue',            'Governing law / venue'),
  ('warranty',                 'Warranty'),
  ('assignment.rights',        'Assignment of the agreement'),
  ('amendment',                'Amendment'),
  ('severability',             'Severability'),
  ('entire.agreement',         'Entire agreement'),
  ('other',                    'Other');

alter table public.clauses
  add constraint clauses_clause_type_fkey
  foreign key (clause_type) references public.clause_types (id);

alter table public.ground_truth_labels
  add constraint ground_truth_labels_clause_type_fkey
  foreign key (clause_type) references public.clause_types (id);

alter table public.provision_mappings
  add constraint provision_mappings_clause_type_fkey
  foreign key (clause_type) references public.clause_types (id);

-- clause_types is public law-adjacent metadata, not user data: same
-- treatment as provisions and provision_mappings below.
alter table public.clause_types enable row level security;
create policy clause_types_select on public.clause_types
  for select to authenticated using (true);

-- ------------------------------------------------------------------ RLS ----

alter table public.stage_runs         enable row level security;
alter table public.clause_retrievals  enable row level security;

-- stage_runs: readable only through ownership of the parent document, same
-- pattern as extractions and clauses in 0001_init.sql.
create policy stage_runs_select_own on public.stage_runs
  for select to authenticated
  using (
    exists (
      select 1 from public.documents d
      where d.id = stage_runs.document_id
        and d.owner_id = (select auth.uid())
    )
  );

-- clause_retrievals: readable only through ownership of the clause's parent
-- document. Same two-hop join clause_scores already uses.
create policy clause_retrievals_select_own on public.clause_retrievals
  for select to authenticated
  using (
    exists (
      select 1
      from public.clauses c
      join public.documents d on d.id = c.document_id
      where c.id = clause_retrievals.clause_id
        and d.owner_id = (select auth.uid())
    )
  );

-- No insert/update/delete policy on either -- pipeline tables are
-- service-role-only, same as clauses, clause_scores, and scoring_runs.

-- --------------------------------------------------- explicit revokes ------

-- Every table below is either pipeline-internal (no legitimate client write
-- under any circumstance) or public law metadata (client-readable, never
-- client-writable). documents is deliberately excluded: it has real,
-- intentional INSERT/DELETE policies scoping authenticated users to their own
-- rows, and revoking the underlying grant would break upload.
revoke insert, update, delete, truncate, references, trigger
  on public.extractions,
     public.clauses,
     public.clause_scores,
     public.scoring_runs,
     public.provisions,
     public.provision_mappings,
     public.clause_types,
     public.ground_truth_labels,
     public.stage_runs,
     public.clause_retrievals
  from anon, authenticated;
