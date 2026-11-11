# Objective 3: Model Ablation Across Pipeline Stages

Report of accuracy, latency, and cost per pipeline stage across three distinct model classes evaluated under the ClauseGuard pipeline, on 15 benchmark clauses.

**Sample size note:** n=15. A one-clause difference in outcome moves accuracy by 6.7 percentage points -- treat small gaps between models as noise, not a settled finding, until this is re-run on a larger annotated set.

## Model Performance by Stage: Scoring Stage

| Metric | Gemini Flash-Lite (Fast / Low Cost) | Gemini Flash (Flagship / Dense) | GPT-OSS 120B on Groq (Open Weights) |
|---|:---:|:---:|:---:|
| **Risk Classification Accuracy** | 93.3% | 93.3% | 86.7% |
| **Mean Confidence** | 95.3% | 95.2% | 94.5% |
| **Average Latency (ms)** | 16810 ms | 7071 ms | 2725 ms |
| **Input Tokens / Clause** | 897 | 897 | 1119 |
| **Output Tokens / Clause** | 153 | 788 | 484 |
| **Cost per 1,000 Clauses** | $0.113 | $0.405 | $1.043 |
| **Call Completion Rate** | 100.0% | 100.0% | 100.0% |

## Findings, derived from this run's actual numbers

* **Accuracy**: Gemini Flash-Lite (Fast / Low Cost) and Gemini Flash (Flagship / Dense) tied for the highest accuracy this run (93.3%).
* **Latency**: GPT-OSS 120B on Groq (Open Weights) was fastest this run.
* **Cost**: Gemini Flash-Lite (Fast / Low Cost) was cheapest per 1,000 clauses this run.

**Latency caveat**: the spread between fastest and slowest average latency this run is more than 3x. On a free-tier API key, per-call latency is dominated by rate-limit backoff, not the model's real inference speed -- these latency numbers should not be cited as "Model X is inherently faster than Model Y" without re-running on a paid tier or inspecting per-call latency variance first.
