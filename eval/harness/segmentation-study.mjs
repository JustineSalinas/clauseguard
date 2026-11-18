/**
 * Segmentation study: rule-based segmenter vs the optional LLM segmenter
 * (Muse Spark) on the Philippine annotated set.
 *
 * WHAT THIS CAN AND CANNOT MEASURE. eval/datasets/ph/benchmark.json holds 15
 * isolated clauses, not contracts: there are no full documents and no
 * clause-boundary annotations. So this study assembles the 15 annotated
 * clauses into synthetic contracts, where the true boundaries are known by
 * construction, and renders them several ways. It therefore measures
 *   - boundary recovery (precision / recall / F1) on ASSEMBLED text, and
 *   - suggestedType accuracy against the dataset's real `clauseType` labels.
 * It does NOT measure behaviour on real contracts or real OCR output, and the
 * 15 clauses are re-used across orderings/renderings/repeats, so those rows are
 * not independent samples. Treat gaps as indicative, not significant.
 *
 * Both segmenters see byte-identical text. Neither is given the answer.
 *
 * Run (needs META_MODEL_API_KEY in .env.local; makes real Meta API calls):
 *   node --env-file=.env.local --import ./tests/setup/register-aliases.mjs eval/harness/segmentation-study.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const { segmentClauses } = await import(new URL("../../lib/pipeline/segment/index.ts", import.meta.url).href);
const { segmentClausesLlm } = await import(new URL("../../lib/pipeline/segment/llm.ts", import.meta.url).href);

const REPS = 2; // LLM runs per (document, rendering); LLM output is not deterministic
const CONCURRENCY = 3;
const FUZZY_F1 = 0.8; // token-F1 needed to call a predicted clause "the same clause" as a gold one

// ------------------------------------------------------------------ data ---

const benchmark = JSON.parse(await readFile(resolve("eval/datasets/ph/benchmark.json"), "utf-8"));

const titleOf = (item) => item.clauseLabel.replace(/^Clause\s+[\d.]+\s*-\s*/i, "").trim();

/** Small deterministic PRNG so shuffles are reproducible. */
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(items, seed) {
  const rand = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const DOCS = [
  { name: "dataset-order", clauses: benchmark },
  { name: "shuffle-1", clauses: shuffled(benchmark, 1) },
  { name: "shuffle-2", clauses: shuffled(benchmark, 2) },
];

// ------------------------------------------------------------- rendering ---

/** Hard-wraps like a printed/OCR'd page. */
function wrap(text, width = 80) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if (line && (line + " " + w).length > width) {
      lines.push(line);
      line = w;
    } else {
      line = line ? line + " " + w : w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
const PREAMBLE = ["SERVICES AGREEMENT", "This Agreement is made between the parties named below.", ""];

const RENDERINGS = {
  // The case the rule segmenter is built for.
  "A numbered": (cs) =>
    [...PREAMBLE, ...cs.flatMap((c, i) => [...wrap(`${i + 1}. ${c.clauseText}`), ""])].join("\n"),

  // Numbering + page header/footer lines between clauses, as in a paginated scan.
  "E numbered + page footers": (cs) => {
    const out = [...PREAMBLE];
    cs.forEach((c, i) => {
      out.push(...wrap(`${i + 1}. ${c.clauseText}`), "");
      if ((i + 1) % 5 === 0) out.push(`CONFIDENTIAL - Page ${(i + 1) / 5} of ${Math.ceil(cs.length / 5)}`, "");
    });
    return out.join("\n");
  },

  // Unnumbered, a title line then the body, blank line between clauses.
  "B headed, unnumbered": (cs) =>
    [...PREAMBLE, ...cs.flatMap((c) => [titleOf(c), ...wrap(c.clauseText), ""])].join("\n"),

  // "Article IV - Title" headings.
  "D Article headings": (cs) =>
    [...PREAMBLE, ...cs.flatMap((c, i) => [`Article ${ROMAN[i]} - ${titleOf(c)}`, ...wrap(c.clauseText), ""])].join("\n"),

  // No numbers, no headings, no blank lines: only line wrapping and sentence ends
  // mark where clauses start (what lost-whitespace OCR can look like).
  "C unnumbered run-together": (cs) => [...PREAMBLE.slice(0, 2), ...cs.flatMap((c) => wrap(c.clauseText))].join("\n"),
};

// ---------------------------------------------------------------- scoring ---

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
const tokens = (s) => norm(s).match(/[a-z0-9]+/g) ?? [];

function tokenF1(a, b) {
  const counts = new Map();
  for (const t of a) counts.set(t, (counts.get(t) ?? 0) + 1);
  let overlap = 0;
  for (const t of b) {
    const n = counts.get(t) ?? 0;
    if (n > 0) {
      overlap++;
      counts.set(t, n - 1);
    }
  }
  return a.length + b.length === 0 ? 0 : (2 * overlap) / (a.length + b.length);
}

/** One document's result for one segmenter output. Greedy 1-1 matching by token F1. */
function scoreDoc(pred, gold) {
  const pairs = [];
  pred.forEach((p, pi) => {
    const pt = tokens(p.text);
    gold.forEach((g, gi) => {
      const f1 = tokenF1(pt, tokens(g.clauseText));
      if (f1 >= FUZZY_F1) pairs.push({ pi, gi, f1, exact: norm(p.text) === norm(g.clauseText) });
    });
  });
  pairs.sort((x, y) => y.f1 - x.f1);

  const usedP = new Set();
  const usedG = new Set();
  let matched = 0;
  let exact = 0;
  let typeRight = 0;
  for (const m of pairs) {
    if (usedP.has(m.pi) || usedG.has(m.gi)) continue;
    usedP.add(m.pi);
    usedG.add(m.gi);
    matched++;
    if (m.exact) exact++;
    const want = gold[m.gi].clauseType;
    const got = pred[m.pi].suggestedType ?? "other"; // no suggestion == "other"
    if (got === want) typeRight++;
  }
  return { nPred: pred.length, nGold: gold.length, matched, exact, typeRight };
}

function aggregate(rows) {
  const sum = (k) => rows.reduce((s, r) => s + r[k], 0);
  const P = sum("nPred") ? sum("matched") / sum("nPred") : 0;
  const R = sum("nGold") ? sum("matched") / sum("nGold") : 0;
  return {
    precision: P,
    recall: R,
    f1: P + R ? (2 * P * R) / (P + R) : 0,
    exactRecall: sum("nGold") ? sum("exact") / sum("nGold") : 0,
    countRatio: sum("nGold") ? sum("nPred") / sum("nGold") : 0,
    typeAcc: sum("matched") ? sum("typeRight") / sum("matched") : 0,
    n: rows.length,
  };
}

// ------------------------------------------------------------------- run ---

async function pool(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < tasks.length) {
        const i = next++;
        results[i] = await tasks[i]();
      }
    }),
  );
  return results;
}

const byRendering = {};
const llmTasks = [];
for (const [rname, render] of Object.entries(RENDERINGS)) {
  byRendering[rname] = { rules: [], llm: [], effective: [], fallbacks: 0, llmCalls: 0, tokensIn: 0, tokensOut: 0, latencyMs: 0 };
  for (const doc of DOCS) {
    const text = render(doc.clauses);
    const rulesScore = scoreDoc(segmentClauses(text), doc.clauses);
    byRendering[rname].rules.push(rulesScore);

    for (let rep = 0; rep < REPS; rep++) {
      llmTasks.push(async () => {
        const out = await segmentClausesLlm(text);
        const b = byRendering[rname];
        b.llmCalls++;
        if (!out) {
          // Mirrors the pipeline: a null result means rules produced the clauses.
          b.fallbacks++;
          b.llm.push({ nPred: 0, nGold: doc.clauses.length, matched: 0, exact: 0, typeRight: 0 });
          b.effective.push(rulesScore);
        } else {
          const s = scoreDoc(out.clauses, doc.clauses);
          b.llm.push(s);
          b.effective.push(s);
          b.tokensIn += out.tokensIn ?? 0;
          b.tokensOut += out.tokensOut ?? 0;
          b.latencyMs += out.latencyMs;
        }
      });
    }
  }
}

console.log(`Assembled ${DOCS.length} documents x ${Object.keys(RENDERINGS).length} renderings, ${REPS} LLM runs each = ${llmTasks.length} Meta API calls...`);
await pool(llmTasks, CONCURRENCY);

// ---------------------------------------------------------------- report ---

const pct = (x) => `${(x * 100).toFixed(0)}%`;
const rows = [];
let totalIn = 0;
let totalOut = 0;
let totalMs = 0;
let totalOk = 0;
let totalFallbacks = 0;
let totalCalls = 0;
for (const [rname, b] of Object.entries(byRendering)) {
  const r = aggregate(b.rules);
  const l = aggregate(b.llm);
  const e = aggregate(b.effective);
  const ok = b.llmCalls - b.fallbacks;
  totalIn += b.tokensIn;
  totalOut += b.tokensOut;
  totalMs += b.latencyMs;
  totalOk += ok;
  totalFallbacks += b.fallbacks;
  totalCalls += b.llmCalls;
  rows.push({ rname, r, l, e, b, ok });
}

const header = "| Rendering | Segmenter | Precision | Recall | F1 | Exact-text recall | Clauses / gold | Type acc (matched) |\n|---|---|---|---|---|---|---|---|";
const lines = [header];
for (const { rname, r, l, e, b } of rows) {
  const row = (label, m) =>
    `| ${rname} | ${label} | ${pct(m.precision)} | ${pct(m.recall)} | ${pct(m.f1)} | ${pct(m.exactRecall)} | ${m.countRatio.toFixed(2)}x | ${pct(m.typeAcc)} |`;
  lines.push(row("rules", r));
  lines.push(row(`LLM (raw; ${b.fallbacks}/${b.llmCalls} fell back)`, l));
  if (b.fallbacks > 0) lines.push(row("LLM + rules fallback (as in pipeline)", e));
}

const avgIn = totalOk ? Math.round(totalIn / totalOk) : 0;
const avgOut = totalOk ? Math.round(totalOut / totalOk) : 0;
const avgMs = totalOk ? Math.round(totalMs / totalOk) : 0;
const estCost = (totalIn * 1.25 + totalOut * 4.25) / 1_000_000;

const md = `# Segmentation study: rule-based vs LLM (Muse Spark) segmenter

**Date:** ${new Date().toISOString().slice(0, 10)}
**Data:** \`eval/datasets/ph/benchmark.json\` (15 annotated clauses, 14 sources)
**Harness:** \`eval/harness/segmentation-study.mjs\`

## What this measures (and what it cannot)

The Philippine set is 15 isolated clauses: no full contracts, no clause-boundary
annotations. So the 15 clauses were assembled into synthetic contracts (3
orderings: dataset order + 2 seeded shuffles) and rendered 5 ways. Boundaries are
therefore known by construction, and both segmenters receive byte-identical text.

- **Precision / recall / F1:** a predicted clause counts as correct if its token-F1
  against a distinct gold clause is >= ${FUZZY_F1} (1-to-1 greedy matching). Headings the
  renderer adds (e.g. "Article IV - Title") are tolerated by this threshold.
- **Exact-text recall:** share of gold clauses whose predicted text is identical
  after whitespace/case normalisation (penalises pulled-in headings or page footers).
- **Clauses / gold:** predicted count divided by true count (1.00x is ideal; <1 merges, >1 over-splits).
- **Type acc (matched):** among matched clauses, \`suggestedType\` equals the dataset's \`clauseType\`
  (no suggestion counts as "other"). In renderings B and D the heading names the clause, which
  can hint a type to either segmenter; A, C and E contain only the clause text.
- LLM: ${REPS} runs per cell (output is not deterministic). Rules are deterministic, so their rows repeat.

**Not covered:** real contracts, real OCR noise, long documents, or any independent sample:
the same 15 clauses recur across orderings, renderings and repeats, so rows are not
independent. n=15 unique clauses; read gaps as indicative, not significant.

## Results

${lines.join("\n")}

## LLM cost and latency

${totalOk} successful LLM calls (${totalFallbacks} of ${totalCalls} fell back to rules): avg ${avgIn} input /
${avgOut} output tokens, ${avgMs} ms per document (15 clauses, ~${Math.round((DOCS[0].clauses.reduce((s, c) => s + c.clauseText.length, 0)) / 1000)}k chars).
Total spend for this run at list prices ($1.25 / $4.25 per M tokens): about $${estCost.toFixed(3)}.
`;

await writeFile(resolve("eval/results/segmentation-study.md"), md);
console.log("\n" + md);
console.log("Wrote eval/results/segmentation-study.md");
