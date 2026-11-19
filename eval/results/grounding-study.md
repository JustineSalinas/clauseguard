# Objective 4: Statutory Grounding Comparison (Civil Code & Labor Code)

This experiment compares an ungrounded LLM baseline (**ARM 1: none**) against a curated rule-based statutory mapping (**ARM 2: static**) and semantic vector retrieval over the 320 statutory provisions (**ARM 3: rag**), on 15 benchmark clauses.

**Sample size note:** n=15. A one-clause difference in outcome moves accuracy by 6.7 percentage points -- treat small gaps between arms as noise, not a settled finding, until this is re-run on a larger annotated set.

## Summary Table

| Metric | ARM 1 (Ungrounded Baseline) | ARM 2 (Static Mapping) | ARM 3 (RAG Vector Retrieval) |
|---|:---:|:---:|:---:|
| **Risk Classification Accuracy** | 86.7% | 86.7% | 93.3% |
| **Mean Calibrated Confidence** | 84.2% | 84.5% | 89.5% |
| **Statutory Citation Hit Rate** | 0.0% | 80.0% | 53.3% |
| **Average Latency (ms)** | 3311 ms | 3558 ms | 3641 ms |
| **Estimated Cost / 1,000 Clauses** | $0.331 | $0.345 | $0.406 |

## Findings, derived from this run's actual numbers

1. **Accuracy**: ARM 3 (RAG Vector Retrieval) had the highest accuracy this run at 93.3% (ARM 1 (Ungrounded Baseline): 86.7%, ARM 2 (Static Mapping): 86.7%).
2. **Citation grounding**: ARM 2 (Static Mapping) had the highest statutory citation hit rate (80%): ARM 2 (Static Mapping) 80%, ARM 3 (RAG Vector Retrieval) 53.3%, ARM 1 (Ungrounded Baseline) 0%. The ungrounded arm's citation hit rate is defined as 0% by construction -- it is never given statutory text to cite.
3. **Flag for review**: RAG's citation hit rate (53.3%) is *lower* than the static mapping's (80.0%) in this run. Before writing this up as "RAG improves grounding," check the retrieval recipe (embedding taskType, similarity threshold, top-k) and consider re-running with a larger n -- a difference this size on 15 clauses is a small number of individual misses, not yet a settled result.
