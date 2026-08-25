-- ClauseGuard initial schema.
--
-- Shape is dictated by Objectives 3 and 4, not by the product. Both run
-- multiple scoring passes over identical clauses, so results live in
-- clause_scores joined to scoring_runs rather than as columns on the clause.
-- Putting risk_level on clauses would force a migration plus re-annotation
-- mid-sprint.
--
-- Security posture: authenticated users hold SELECT on their own rows and
-- INSERT/DELETE on documents only. They hold no UPDATE grant anywhere. This is
-- deliberately stronger than guarding a permissive UPDATE policy with a
-- BEFORE UPDATE trigger, because there is no permissive policy to guard. All
-- pipeline writes go through the service role, which bypasses RLS by design
-- and never reaches the browser.

create extension if not exists vector;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- enums ----

create type document_status as enum (
  'uploaded', 'extracting', 'extracted', 'segmenting', 'segmented',
  'scoring', 'partial', 'complete', 'failed'
);

create type risk_level as enum ('low', 'medium', 'high');

create type grounding_arm as enum ('none', 'static', 'rag');

-- Every non-ok value is a countable result, not a swallowed error. Refusal
-- rate per model is an Objective 3 column.
create type score_outcome as enum (
  'ok', 'refusal', 'parse_error', 'safety_block', 'timeout',
  'rate_limited', 'empty', 'context_limit'
);

-- ------------------------------------------------------------ documents ----

create table public.documents (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users (id) on delete cascade,
  filename         text not null,
  storage_path     text not null,
  content_hash     text,
  contract_type    text,
  page_count       integer,
  status           document_status not null default 'uploaded',
  failed_stage     text,
  failed_reason    text,
  -- Set when a stage begins. The sweeper marks anything older than the stage
  -- timeout as failed(stage) so a job cannot sit in 'scoring' forever.
  stage_started_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index documents_owner_created_idx
  on public.documents (owner_id, created_at desc);
create index documents_status_stage_idx
  on public.documents (status, stage_started_at)
  where status in ('extracting', 'segmenting', 'scoring');

-- ----------------------------------------------------------- extractions ---

-- Versioned. Bounding boxes are valid only for the extraction that produced
-- them, so a re-extraction can never render a stale overlay on a new page
-- rendering.
create table public.extractions (
  id                      uuid primary key default gen_random_uuid(),
  document_id             uuid not null references public.documents (id) on delete cascade,
  ocr_engine              text not null,
  settings                jsonb not null default '{}'::jsonb,
  page_sizes              jsonb not null default '[]'::jsonb,
  -- Tokens dropped at extraction for being invisible, sub-4pt, or off-page.
  -- How many documents carry hidden text at all is a reportable finding.
  suppressed_token_count  integer not null default 0,
  created_at              timestamptz not null default now()
);

create index extractions_document_idx on public.extractions (document_id);

-- --------------------------------------------------------------- clauses ---

create table public.clauses (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references public.documents (id) on delete cascade,
  extraction_id uuid not null references public.extractions (id) on delete cascade,
  ordinal       integer not null,
  label         text,
  clause_type   text,
  text          text not null,
  page          integer not null,
  char_start    integer,
  char_end      integer,
  bboxes        jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  unique (extraction_id, ordinal)
);

create index clauses_document_ordinal_idx
  on public.clauses (document_id, ordinal);
create index clauses_type_idx on public.clauses (clause_type);

-- ---------------------------------------------------- ground truth labels --

-- Attaches to the clause, never to a scoring run. Multiple annotators per
-- clause is what makes Cohen's kappa computable at all.
create table public.ground_truth_labels (
  id           uuid primary key default gen_random_uuid(),
  clause_id    uuid not null references public.clauses (id) on delete cascade,
  annotator_id text not null,
  risk_level   risk_level not null,
  clause_type  text,
  notes        text,
  created_at   timestamptz not null default now(),
  unique (clause_id, annotator_id)
);

create index gtl_clause_idx on public.ground_truth_labels (clause_id);

-- ---------------------------------------------------------- scoring runs ---

-- One row per (model x prompt version x grounding arm) pass over a corpus.
-- This table is what turns Objectives 3 and 4 into queries.
create table public.scoring_runs (
  id             uuid primary key default gen_random_uuid(),
  label          text,
  model_id       text not null,
  prompt_version text not null,
  grounding_arm  grounding_arm not null,
  temperature    numeric(3, 2),
  is_production  boolean not null default false,
  notes          text,
  created_at     timestamptz not null default now()
);

create index scoring_runs_dims_idx
  on public.scoring_runs (model_id, grounding_arm, prompt_version);

-- --------------------------------------------------------- clause scores ---

create table public.clause_scores (
  id                   uuid primary key default gen_random_uuid(),
  clause_id            uuid not null references public.clauses (id) on delete cascade,
  run_id               uuid not null references public.scoring_runs (id) on delete cascade,
  risk_level           risk_level,
  -- 0.000 to 1.000. Written even when the UI declines to show a verdict,
  -- because Chapter 4 correlates it against ground truth.
  confidence           numeric(4, 3),
  rationale            text,
  deviation            text,
  provisions_relied_on text[] not null default '{}',
  injection_suspected  boolean not null default false,
  outcome              score_outcome not null default 'ok',
  tokens_in            integer,
  tokens_out           integer,
  latency_ms           integer,
  created_at           timestamptz not null default now(),
  unique (clause_id, run_id),
  constraint confidence_range
    check (confidence is null or (confidence >= 0 and confidence <= 1))
);

create index clause_scores_run_idx on public.clause_scores (run_id);
create index clause_scores_clause_idx on public.clause_scores (clause_id);

-- ------------------------------------------------------------ provisions ---

-- Civil Code and Labor Code text. Public law, not user data.
create table public.provisions (
  id         uuid primary key default gen_random_uuid(),
  code       text not null check (code in ('CIVIL', 'LABOR')),
  article    text not null,
  heading    text,
  text       text not null,
  -- Dimension must match the embedding model chosen on Day 9.
  embedding  vector(768),
  created_at timestamptz not null default now(),
  unique (code, article)
);

-- Build this after the corpus is loaded, not before.
create index provisions_embedding_idx
  on public.provisions using hnsw (embedding vector_cosine_ops);

-- ARM 2 of the grounding study: clause type mapped to fixed provisions by
-- hand against primary sources. Never model-generated.
create table public.provision_mappings (
  id           uuid primary key default gen_random_uuid(),
  clause_type  text not null,
  provision_id uuid not null references public.provisions (id) on delete cascade,
  rank         integer not null default 1,
  unique (clause_type, provision_id)
);

create index provision_mappings_type_idx
  on public.provision_mappings (clause_type, rank);

-- ------------------------------------------------------- updated_at hook ---

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger documents_touch_updated_at
  before update on public.documents
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------------ RLS ----

alter table public.documents            enable row level security;
alter table public.extractions          enable row level security;
alter table public.clauses              enable row level security;
alter table public.ground_truth_labels  enable row level security;
alter table public.scoring_runs         enable row level security;
alter table public.clause_scores        enable row level security;
alter table public.provisions           enable row level security;
alter table public.provision_mappings   enable row level security;

-- documents: a user sees and controls only their own.
-- TO authenticated alone would be authentication without authorization, so
-- every policy carries an ownership predicate.

create policy documents_select_own on public.documents
  for select to authenticated
  using ((select auth.uid()) = owner_id);

create policy documents_insert_own on public.documents
  for insert to authenticated
  with check ((select auth.uid()) = owner_id);

create policy documents_delete_own on public.documents
  for delete to authenticated
  using ((select auth.uid()) = owner_id);

-- No UPDATE policy. Status transitions belong to the pipeline, which runs as
-- the service role. Nothing client-reachable can move a document's status or
-- rewrite its storage path.

-- Derived rows: readable only through ownership of the parent document.

create policy extractions_select_own on public.extractions
  for select to authenticated
  using (
    exists (
      select 1 from public.documents d
      where d.id = extractions.document_id
        and d.owner_id = (select auth.uid())
    )
  );

create policy clauses_select_own on public.clauses
  for select to authenticated
  using (
    exists (
      select 1 from public.documents d
      where d.id = clauses.document_id
        and d.owner_id = (select auth.uid())
    )
  );

create policy clause_scores_select_own on public.clause_scores
  for select to authenticated
  using (
    exists (
      select 1
      from public.clauses c
      join public.documents d on d.id = c.document_id
      where c.id = clause_scores.clause_id
        and d.owner_id = (select auth.uid())
    )
  );

-- scoring_runs carries no user data, and the results view needs the model and
-- prompt version behind a score.
create policy scoring_runs_select on public.scoring_runs
  for select to authenticated using (true);

-- Public law. Readable so the UI can cite a provision inline.
create policy provisions_select on public.provisions
  for select to authenticated using (true);

create policy provision_mappings_select on public.provision_mappings
  for select to authenticated using (true);

-- ground_truth_labels gets RLS enabled and NO policy for authenticated, which
-- denies every row. Annotations are research data. A user who could read them
-- could read the answer key; a user who could write them could invalidate
-- every number in the results chapters. The harness reaches this table as the
-- service role only.

-- --------------------------------------------------------------- storage ---

insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

-- Objects are stored under {owner_id}/{document_id}/{filename}, so the first
-- path segment is the ownership check. Upsert needs INSERT, SELECT, and UPDATE
-- together or file replacement silently fails.

create policy contracts_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy contracts_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy contracts_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy contracts_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'contracts'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
