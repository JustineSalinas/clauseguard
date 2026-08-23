# Schema migrations

**Owner:** Salinas  
**Task:** T1

Versioned and checked in. The Day 1 deliverable is the evaluation schema:

    documents
      +-- extractions          (ocr_engine, settings, created_at)
            +-- clauses        (span, page, bbox[], clause_type, extraction_id)
                  |
                  +-- ground_truth_labels  (clause_id, annotator_id, risk_level)
                  |
                  +-- clause_scores  <--  scoring_runs
                        clause_id           run_id
                        run_id              model_id
                        risk_level          prompt_version
                        confidence          grounding_arm  (none|static|rag)
                        rationale           temperature
                        tokens_in           created_at
                        tokens_out
                        latency_ms
                        outcome

Risk level and confidence must not be columns on the clause row. Objectives 3
and 4 both run multiple scoring passes over identical clauses, and putting the
results on the clause forces a migration plus re-annotation mid-week.

Ground truth attaches to clauses, never to a scoring run. Multiple annotators
per clause is what makes Cohen's kappa computable at all.
