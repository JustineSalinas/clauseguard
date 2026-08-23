# Risk scoring stage

**Owner:** Salinas  
**Task:** T9

Assigns risk level and confidence per clause.

Batch five to ten clauses per call. Per-clause confidence survives inside a
batched response, so Objective 2 granularity is unaffected while call volume
drops by roughly an order of magnitude. A full evaluation pass is otherwise
around eighteen thousand calls.

The cascade Objective 3 argues for lives here: score everything with Flash-Lite,
re-score only flagged or low-confidence clauses with Flash.

No catch-all error handling. ModelRefusal and SchemaParseError must be counted
separately from network faults, because refusal rate is an ablation column and
hiding it inside a generic catch destroys the measurement.
