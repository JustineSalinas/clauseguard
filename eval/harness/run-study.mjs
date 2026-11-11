/**
 * ClauseGuard Evaluation Harness (Objectives 3 & 4)
 *
 * Runs benchmark clauses across:
 * 1. Grounding Arms: "none" (ungrounded) vs "static" (rule-based) vs "rag" (semantic retrieval)
 * 2. Models: Gemini Flash-Lite vs Gemini Flash vs Groq Llama/GPT-OSS
 *
 * Measures accuracy, latency, token consumption, estimated cost, and citation validity.
 * Outputs Markdown result tables for Chapter 4 of the capstone.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { scoreClause } from "../../lib/pipeline/score/index.ts";
import { groundClause } from "../../lib/pipeline/ground/index.ts";
import { ABLATION_MODELS, SCORE_STAGE_DEFAULT_MODEL } from "../../lib/models/index.ts";
import { ConvexHttpClient } from "convex/browser";
import { api, internal } from "../../convex/_generated/api.js";

// Pricing per 1M tokens (USD). UPDATED 2026-11-05 for the current model
// trio (lib/models/index.ts) after gemini-2.0-* and Groq's Llama models
// stopped working -- see that file's header for what changed and why.
// These dollar figures are carried over from the old models' pricing as a
// placeholder, NOT re-verified against Google's/Groq's current pricing
// pages. Confirm before these numbers go in Chapter 4 -- an unverified
// cost figure in the results chapter is exactly the kind of thing this
// project's own "do not fabricate the evidence" rule exists to catch.
const PRICING = {
  "google/gemini-3.5-flash-lite": { inputPerM: 0.075, outputPerM: 0.30 },
  "google/gemini-3.5-flash": { inputPerM: 0.10, outputPerM: 0.40 },
  "groq/gpt-oss-120b": { inputPerM: 0.59, outputPerM: 0.79 },
};

function calculateCostUsd(modelId, tokensIn, tokensOut) {
  const p = PRICING[modelId] || { inputPerM: 0.1, outputPerM: 0.4 };
  return ((tokensIn || 0) * p.inputPerM + (tokensOut || 0) * p.outputPerM) / 1_000_000;
}

async function safeScoreClause(input) {
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      const res = await scoreClause(input);
      // Pacing delay (4.2s) ensures we stay under Google Free Tier's 15 requests/minute limit
      await new Promise((r) => setTimeout(r, 4200));
      return res;
    } catch (err) {
      const errStr = String(err);
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
        console.warn(`[Quota limit] Pausing 40s before retry (attempt ${attempt}/10)...`);
        await new Promise((r) => setTimeout(r, 40000));
      } else if (errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand")) {
        // Transient capacity errors, not quota -- seen on both gemini-3.5-flash
        // and gemini-3.8-flash (see lib/models/index.ts's header). A short
        // backoff is usually enough; this must not crash a multi-hour eval run
        // over a few seconds of upstream unavailability.
        console.warn(`[Model unavailable] Pausing 20s before retry (attempt ${attempt}/10)...`);
        await new Promise((r) => setTimeout(r, 20000));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Exceeded max retries for scoreClause");
}

async function loadBenchmark() {
  const raw = await readFile(resolve("eval/datasets/ph/benchmark.json"), "utf-8");
  return JSON.parse(raw);
}

function matchesExpected(expectedList, citedList) {
  if (!expectedList || expectedList.length === 0) return true;
  if (!citedList || citedList.length === 0) return false;
  return expectedList.some((exp) => {
    const expNum = exp.replace(/\D+/g, "");
    return citedList.some((cited) => {
      const citedNum = cited.replace(/\D+/g, "");
      return (
        cited.toLowerCase().includes(exp.toLowerCase()) ||
        (expNum.length > 0 && citedNum.includes(expNum))
      );
    });
  });
}

function createConvexRetriever(client) {
  return async (clauseText) => {
    try {
      const matches = await client.action(api.corpus.searchProvisions, {
        text: clauseText,
        limit: 4,
        minSimilarity: 0.50,
      });
      return matches.map((m) => ({
        code: m.code,
        article: m.article,
        heading: m.heading,
        text: m.text,
      }));
    } catch (e) {
      // Fallback for offline / direct testing
      return [];
    }
  };
}

async function runGroundingStudy(benchmark, client) {
  console.log("\n=======================================================");
  console.log("RUNNING OBJECTIVE 4: THREE-ARM GROUNDING COMPARISON");
  console.log("Arms: [none] (ungrounded) vs [static] (rule-based) vs [rag] (retrieval)");
  console.log("=======================================================\n");

  const arms = ["none", "static", "rag"];
  const modelId = SCORE_STAGE_DEFAULT_MODEL;
  const ragRetriever = createConvexRetriever(client);

  const resultsByArm = {};

  for (const arm of arms) {
    console.log(`Evaluating grounding arm: ${arm.toUpperCase()} (${benchmark.length} clauses)...`);
    const records = [];

    for (const item of benchmark) {
      let provisions = [];
      if (arm === "static") {
        provisions = await client.query(api.corpus.listForClauseType, {
          clauseType: item.clauseType,
        });
      } else if (arm === "rag") {
        provisions = await ragRetriever(item.clauseText);
      }

      const score = await safeScoreClause({
        modelId,
        clauseText: item.clauseText,
        clauseLabel: item.clauseLabel,
        suggestedType: item.clauseType,
        provisions,
        groundingArm: arm,
      });

      const riskMatch = score.riskLevel === item.groundTruthRisk;
      const expectedCited = matchesExpected(item.expectedProvisions, score.provisionsReliedOn);

      records.push({
        id: item.id,
        groundTruthRisk: item.groundTruthRisk,
        predictedRisk: score.riskLevel,
        riskMatch,
        confidence: score.confidence ?? 0,
        provisionsRetrieved: provisions.length,
        provisionsReliedOn: score.provisionsReliedOn,
        expectedCited,
        tokensIn: score.tokensIn ?? 0,
        tokensOut: score.tokensOut ?? 0,
        latencyMs: score.latencyMs,
        outcome: score.outcome,
      });
    }

    const n = records.length;
    const accuracy = records.filter((r) => r.riskMatch).length / n;
    const avgConfidence = records.reduce((acc, r) => acc + r.confidence, 0) / n;
    const avgLatency = records.reduce((acc, r) => acc + r.latencyMs, 0) / n;
    const totalTokensIn = records.reduce((acc, r) => acc + r.tokensIn, 0);
    const totalTokensOut = records.reduce((acc, r) => acc + r.tokensOut, 0);
    const citationHitRate = arm === "none" ? 0 : records.filter((r) => r.expectedCited).length / n;
    const costPer1k = (calculateCostUsd(modelId, totalTokensIn, totalTokensOut) / n) * 1000;

    resultsByArm[arm] = {
      arm,
      accuracy: (accuracy * 100).toFixed(1) + "%",
      avgConfidence: (avgConfidence * 100).toFixed(1) + "%",
      citationHitRate: (citationHitRate * 100).toFixed(1) + "%",
      avgLatencyMs: Math.round(avgLatency),
      costPer1kClauses: `$${costPer1k.toFixed(3)}`,
      records,
    };
  }

  return resultsByArm;
}

async function runModelAblationStudy(benchmark, client) {
  console.log("\n=======================================================");
  console.log("RUNNING OBJECTIVE 3: MODEL ABLATION STUDY");
  console.log("Models: Gemini Flash-Lite vs Gemini Flash vs Groq Open-Weights");
  console.log("=======================================================\n");

  const ragRetriever = createConvexRetriever(client);
  const ablationResults = {};

  for (const modelId of ABLATION_MODELS) {
    console.log(`Evaluating model: ${modelId} across ${benchmark.length} clauses...`);
    const records = [];

    for (const item of benchmark) {
      const provisions = await client.query(api.corpus.listForClauseType, {
        clauseType: item.clauseType,
      });

      const score = await safeScoreClause({
        modelId,
        clauseText: item.clauseText,
        clauseLabel: item.clauseLabel,
        suggestedType: item.clauseType,
        provisions,
        groundingArm: "static",
      });

      const riskMatch = score.riskLevel === item.groundTruthRisk;
      records.push({
        id: item.id,
        groundTruthRisk: item.groundTruthRisk,
        predictedRisk: score.riskLevel,
        riskMatch,
        confidence: score.confidence ?? 0,
        tokensIn: score.tokensIn ?? 0,
        tokensOut: score.tokensOut ?? 0,
        latencyMs: score.latencyMs,
        outcome: score.outcome,
      });
    }

    const n = records.length;
    const accuracy = records.filter((r) => r.riskMatch).length / n;
    const avgConfidence = records.reduce((acc, r) => acc + r.confidence, 0) / n;
    const avgLatency = records.reduce((acc, r) => acc + r.latencyMs, 0) / n;
    const totalTokensIn = records.reduce((acc, r) => acc + r.tokensIn, 0);
    const totalTokensOut = records.reduce((acc, r) => acc + r.tokensOut, 0);
    const costPer1k = (calculateCostUsd(modelId, totalTokensIn, totalTokensOut) / n) * 1000;
    const successful = records.filter((r) => r.outcome === "ok").length;

    ablationResults[modelId] = {
      modelId,
      accuracy: (accuracy * 100).toFixed(1) + "%",
      avgConfidence: (avgConfidence * 100).toFixed(1) + "%",
      avgLatencyMs: Math.round(avgLatency),
      tokensInPerClause: Math.round(totalTokensIn / n),
      tokensOutPerClause: Math.round(totalTokensOut / n),
      costPer1kClauses: `$${costPer1k.toFixed(3)}`,
      successRate: ((successful / n) * 100).toFixed(1) + "%",
      records,
    };
  }

  return ablationResults;
}

function pct(str) {
  return parseFloat(str);
}

function rankDescending(entries) {
  // entries: [{label, value}] -> sorted copy, highest value first
  return [...entries].sort((a, b) => b.value - a.value);
}

export function formatGroundingReport(groundingResults, n) {
  const arms = {
    none: { label: "ARM 1 (Ungrounded Baseline)", ...groundingResults.none },
    static: { label: "ARM 2 (Static Mapping)", ...groundingResults.static },
    rag: { label: "ARM 3 (RAG Vector Retrieval)", ...groundingResults.rag },
  };

  const accuracyRank = rankDescending(
    Object.entries(arms).map(([key, a]) => ({ key, label: a.label, value: pct(a.accuracy) })),
  );
  const citationRank = rankDescending(
    Object.entries(arms).map(([key, a]) => ({ key, label: a.label, value: pct(a.citationHitRate) })),
  );

  const accLeader = accuracyRank[0];
  const accTied = accuracyRank.filter((e) => e.value === accLeader.value);
  const citeLeader = citationRank[0];

  const accuracyRunnersUp = accuracyRank.filter((e) => !accTied.includes(e));
  const accuracySentence =
    accTied.length === accuracyRank.length
      ? `All arms tied at ${accLeader.value}% accuracy in this run.`
      : accTied.length > 1
        ? `${accTied.map((e) => e.label).join(" and ")} tied for the highest accuracy in this run (${accLeader.value}%); ${accuracyRunnersUp
            .map((e) => `${e.label} scored ${e.value}%`)
            .join(", ")}.`
        : `${accLeader.label} had the highest accuracy this run at ${accLeader.value}% (${accuracyRank
            .slice(1)
            .map((e) => `${e.label}: ${e.value}%`)
            .join(", ")}).`;

  const citationSentence = `${citeLeader.label} had the highest statutory citation hit rate (${citeLeader.value}%): ${citationRank
    .map((e) => `${e.label} ${e.value}%`)
    .join(", ")}.`;

  const ragWorseThanStatic = pct(arms.rag.citationHitRate) < pct(arms.static.citationHitRate);
  const ragWorseThanBaseline = pct(arms.rag.accuracy) < pct(arms.none.accuracy);

  const warnings = [];
  if (ragWorseThanStatic) {
    warnings.push(
      `RAG's citation hit rate (${arms.rag.citationHitRate}) is *lower* than the static mapping's (${arms.static.citationHitRate}) in this run. ` +
        `Before writing this up as "RAG improves grounding," check the retrieval recipe (embedding taskType, similarity threshold, top-k) and consider re-running with a larger n -- a difference this size on ${n} clauses is a small number of individual misses, not yet a settled result.`,
    );
  }
  if (ragWorseThanBaseline) {
    warnings.push(
      `RAG's accuracy (${arms.rag.accuracy}) is *lower* than the ungrounded baseline's (${arms.none.accuracy}) in this run. ` +
        `This does not mean grounding hurts -- it means retrieved-but-irrelevant provisions can distract the model on a small, noisy sample. Re-run with more clauses before drawing a Chapter 4 conclusion either way.`,
    );
  }

  return `# Objective 4: Statutory Grounding Comparison (Civil Code & Labor Code)

This experiment compares an ungrounded LLM baseline (**ARM 1: none**) against a curated rule-based statutory mapping (**ARM 2: static**) and semantic vector retrieval over the 320 statutory provisions (**ARM 3: rag**), on ${n} benchmark clauses.

**Sample size note:** n=${n}. A one-clause difference in outcome moves accuracy by ${(100 / n).toFixed(1)} percentage points -- treat small gaps between arms as noise, not a settled finding, until this is re-run on a larger annotated set.

## Summary Table

| Metric | ARM 1 (Ungrounded Baseline) | ARM 2 (Static Mapping) | ARM 3 (RAG Vector Retrieval) |
|---|:---:|:---:|:---:|
| **Risk Classification Accuracy** | ${arms.none.accuracy} | ${arms.static.accuracy} | ${arms.rag.accuracy} |
| **Mean Calibrated Confidence** | ${arms.none.avgConfidence} | ${arms.static.avgConfidence} | ${arms.rag.avgConfidence} |
| **Statutory Citation Hit Rate** | ${arms.none.citationHitRate} | ${arms.static.citationHitRate} | ${arms.rag.citationHitRate} |
| **Average Latency (ms)** | ${arms.none.avgLatencyMs} ms | ${arms.static.avgLatencyMs} ms | ${arms.rag.avgLatencyMs} ms |
| **Estimated Cost / 1,000 Clauses** | ${arms.none.costPer1kClauses} | ${arms.static.costPer1kClauses} | ${arms.rag.costPer1kClauses} |

## Findings, derived from this run's actual numbers

1. **Accuracy**: ${accuracySentence}
2. **Citation grounding**: ${citationSentence} The ungrounded arm's citation hit rate is defined as 0% by construction -- it is never given statutory text to cite.
${warnings.length > 0 ? warnings.map((w, i) => `${i + 3}. **Flag for review**: ${w}`).join("\n") : ""}
`;
}

export function formatAblationReport(ablationResults, n) {
  const models = {
    "google/gemini-3.5-flash-lite": { label: "Gemini Flash-Lite (Fast / Low Cost)" },
    "google/gemini-3.5-flash": { label: "Gemini Flash (Flagship / Dense)" },
    "groq/gpt-oss-120b": { label: "GPT-OSS 120B on Groq (Open Weights)" },
  };
  for (const id of Object.keys(models)) {
    models[id] = { ...models[id], ...ablationResults[id] };
  }
  const [m1, m2, m3] = Object.values(models);

  const accuracyRank = rankDescending(Object.values(models).map((m) => ({ label: m.label, value: pct(m.accuracy) })));
  const latencyRank = rankDescending(
    Object.values(models).map((m) => ({ label: m.label, value: -m.avgLatencyMs })),
  ); // negate so rankDescending (highest value first) means fastest first
  const costRank = rankDescending(
    Object.values(models).map((m) => ({ label: m.label, value: -parseFloat(m.costPer1kClauses.replace("$", "")) })),
  );

  const accLeader = accuracyRank[0];
  const accTied = accuracyRank.filter((e) => e.value === accLeader.value);
  const fastest = latencyRank[0];
  const cheapest = costRank[0];

  const accuracySentence =
    accTied.length > 1
      ? `${accTied.map((e) => e.label).join(" and ")} tied for the highest accuracy this run (${accLeader.value}%).`
      : `${accLeader.label} had the highest accuracy this run (${accLeader.value}%).`;

  const latencyNote =
    Math.max(...Object.values(models).map((m) => m.avgLatencyMs)) /
      Math.min(...Object.values(models).map((m) => m.avgLatencyMs)) >
    3
      ? `\n\n**Latency caveat**: the spread between fastest and slowest average latency this run is more than 3x. On a free-tier API key, per-call latency is dominated by rate-limit backoff, not the model's real inference speed -- these latency numbers should not be cited as "Model X is inherently faster than Model Y" without re-running on a paid tier or inspecting per-call latency variance first.`
      : "";

  return `# Objective 3: Model Ablation Across Pipeline Stages

Report of accuracy, latency, and cost per pipeline stage across three distinct model classes evaluated under the ClauseGuard pipeline, on ${n} benchmark clauses.

**Sample size note:** n=${n}. A one-clause difference in outcome moves accuracy by ${(100 / n).toFixed(1)} percentage points -- treat small gaps between models as noise, not a settled finding, until this is re-run on a larger annotated set.

## Model Performance by Stage: Scoring Stage

| Metric | Gemini Flash-Lite (Fast / Low Cost) | Gemini Flash (Flagship / Dense) | GPT-OSS 120B on Groq (Open Weights) |
|---|:---:|:---:|:---:|
| **Risk Classification Accuracy** | ${m1.accuracy} | ${m2.accuracy} | ${m3.accuracy} |
| **Mean Confidence** | ${m1.avgConfidence} | ${m2.avgConfidence} | ${m3.avgConfidence} |
| **Average Latency (ms)** | ${m1.avgLatencyMs} ms | ${m2.avgLatencyMs} ms | ${m3.avgLatencyMs} ms |
| **Input Tokens / Clause** | ${m1.tokensInPerClause} | ${m2.tokensInPerClause} | ${m3.tokensInPerClause} |
| **Output Tokens / Clause** | ${m1.tokensOutPerClause} | ${m2.tokensOutPerClause} | ${m3.tokensOutPerClause} |
| **Cost per 1,000 Clauses** | ${m1.costPer1kClauses} | ${m2.costPer1kClauses} | ${m3.costPer1kClauses} |
| **Call Completion Rate** | ${m1.successRate} | ${m2.successRate} | ${m3.successRate} |

## Findings, derived from this run's actual numbers

* **Accuracy**: ${accuracySentence}
* **Latency**: ${fastest.label} was fastest this run.
* **Cost**: ${cheapest.label} was cheapest per 1,000 clauses this run.${latencyNote}
`;
}

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set.");
  const client = new ConvexHttpClient(convexUrl);

  const benchmark = await loadBenchmark();
  console.log(`Loaded benchmark with ${benchmark.length} Philippine contract clauses.`);

  await mkdir("eval/results", { recursive: true });

  // Each study's results are written to disk as soon as that study finishes,
  // not held in memory until both complete. A free-tier quota exhaustion in
  // the (much heavier) ablation study previously discarded an already-
  // completed grounding study's results entirely, because nothing was
  // persisted until the very end -- a real data loss this harness hit on a
  // live run, not a hypothetical.
  const groundingResults = await runGroundingStudy(benchmark, client);
  const groundingMd = formatGroundingReport(groundingResults, benchmark.length);
  await writeFile("eval/results/grounding-study.md", groundingMd, "utf-8");
  await writeFile(
    "eval/results/grounding-raw-data.json",
    JSON.stringify({ groundingResults, timestamp: new Date().toISOString() }, null, 2),
    "utf-8",
  );
  console.log("Wrote eval/results/grounding-study.md + grounding-raw-data.json");

  const ablationResults = await runModelAblationStudy(benchmark, client);
  const ablationMd = formatAblationReport(ablationResults, benchmark.length);
  await writeFile("eval/results/model-ablation.md", ablationMd, "utf-8");
  await writeFile(
    "eval/results/study-raw-data.json",
    JSON.stringify({ groundingResults, ablationResults, timestamp: new Date().toISOString() }, null, 2),
    "utf-8"
  );
  console.log("Wrote eval/results/model-ablation.md + study-raw-data.json");
  console.log("\nALL EXPERIMENTS COMPLETED SUCCESSFULLY!");
}

// Guarded so this module can be imported (e.g. to reuse the report
// formatters against already-saved raw data) without re-running the whole
// study -- each full run spends real, rate-limited API quota.
const { pathToFileURL } = await import("node:url");
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("Evaluation failed:", err);
    process.exit(1);
  });
}

