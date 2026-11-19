# Objective 3: Model Ablation Across Pipeline Stages

Report of accuracy, latency, and cost per pipeline stage across three distinct model classes evaluated under the ClauseGuard pipeline, on 15 benchmark clauses.

**Sample size note:** n=15. A one-clause difference in outcome moves accuracy by 6.7 percentage points -- treat small gaps between models as noise, not a settled finding, until this is re-run on a larger annotated set.

## Model Performance by Stage: Scoring Stage

| Metric | Gemini Flash-Lite (Fast / Low Cost) | Gemini Flash (Flagship / Dense) | GPT-OSS 120B on Groq (Open Weights) |
|---|:---:|:---:|:---:|
| **Risk Classification Accuracy** | 86.7% | 0.0% | 93.3% |
| **Mean Confidence** | 95.0% | 0.0% | 94.9% |
| **Average Latency (ms)** | 9944 ms | 21600 ms | 4021 ms |
| **Input Tokens / Clause** | 961 | 0 | 1207 |
| **Output Tokens / Clause** | 176 | 0 | 573 |
| **Cost per 1,000 Clauses** | $0.125 | $0.000 | $1.165 |
| **Call Completion Rate** | 100.0% | 0.0% | 100.0% |

## Findings, derived from this run's actual numbers

* **Accuracy**: GPT-OSS 120B on Groq (Open Weights) had the highest accuracy this run (93.3%).
* **Latency**: GPT-OSS 120B on Groq (Open Weights) was fastest this run.
* **Cost**: Gemini Flash (Flagship / Dense) was cheapest per 1,000 clauses this run.

**Latency caveat**: the spread between fastest and slowest average latency this run is more than 3x. On a free-tier API key, per-call latency is dominated by rate-limit backoff, not the model's real inference speed -- these latency numbers should not be cited as "Model X is inherently faster than Model Y" without re-running on a paid tier or inspecting per-call latency variance first.
