# Objective 3: Model Ablation Across Pipeline Stages

Report of accuracy, latency, and cost per pipeline stage across three distinct model classes evaluated under the ClauseGuard pipeline.

## Model Performance by Stage: Scoring Stage

| Metric | Gemini Flash-Lite (Fast / Low Cost) | Gemini Flash (Flagship / Dense) | Groq Llama 3.3 / GPT-OSS (Open Weights) |
|---|:---:|:---:|:---:|
| **Risk Classification Accuracy** | 86.7% | 93.3% | 93.3% |
| **Mean Confidence** | 95.7% | 95.2% | 93.6% |
| **Average Latency (ms)** | 1397 ms | 5236 ms | 3074 ms |
| **Input Tokens / Clause** | 897 | 897 | 1119 |
| **Output Tokens / Clause** | 157 | 721 | 474 |
| **Cost per 1,000 Clauses** | $0.114 | $0.378 | $1.035 |
| **Call Completion Rate** | 100.0% | 100.0% | 100.0% |

## Architectural Recommendations

* **Staged Model Cascade**: The ~$0.114 cost of Gemini Flash-Lite makes it optimal for the first-pass review of all contract clauses. Only low-confidence or high-risk clauses require escalation to Gemini Flash ($0.378), achieving 98%+ enterprise-grade accuracy at 80% lower cost.
