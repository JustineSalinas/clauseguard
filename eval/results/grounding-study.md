# Objective 4: Statutory Grounding Comparison (Civil Code & Labor Code)

This experiment compares an ungrounded LLM baseline (**ARM 1: none**) against a curated rule-based statutory mapping (**ARM 2: static**) and semantic vector retrieval over the 320 statutory provisions (**ARM 3: rag**), on 15 benchmark clauses.

**Sample size note:** n=15. A one-clause difference in outcome moves accuracy by 6.7 percentage points -- treat small gaps between arms as noise, not a settled finding, until this is re-run on a larger annotated set.

## Summary Table

| Metric | ARM 1 (Ungrounded Baseline) | ARM 2 (Static Mapping) | ARM 3 (RAG Vector Retrieval) |
|---|:---:|:---:|:---:|
| **Risk Classification Accuracy** | 93.3% | 93.3% | 93.3% |
| **Mean Calibrated Confidence** | 96.3% | 95.5% | 95.3% |
| **Statutory Citation Hit Rate** | 0.0% | 46.7% | 46.7% |
| **Average Latency (ms)** | 6565 ms | 14410 ms | 16524 ms |
| **Estimated Cost / 1,000 Clauses** | $0.107 | $0.113 | $0.131 |

## Findings, derived from this run's actual numbers

1. **Accuracy**: All arms tied at 93.3% accuracy in this run.
2. **Citation grounding**: ARM 2 (Static Mapping) had the highest statutory citation hit rate (46.7%): ARM 2 (Static Mapping) 46.7%, ARM 3 (RAG Vector Retrieval) 46.7%, ARM 1 (Ungrounded Baseline) 0%. The ungrounded arm's citation hit rate is defined as 0% by construction -- it is never given statutory text to cite.

