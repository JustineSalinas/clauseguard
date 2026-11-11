// Structural check, not a network test: ground_truth_labels is the
// annotated-dataset answer key (per CLAUDE.md: "it must return nothing to
// a browser session; it's the answer key"). Right now zero Convex
// functions anywhere touch this table -- not even an internal one. That's
// the strongest possible guarantee, and this test enforces it stays that
// way: the moment any function in convex/*.ts references the table, this
// test fails and forces whoever added it to come back here and prove the
// function is internalQuery/internalMutation/internalAction, never one a
// signed-in browser can call directly.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const CONVEX_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../convex");

test("ground truth labels have zero Convex function references outside schema.ts", () => {
  const files = readdirSync(CONVEX_DIR).filter(
    (f) => f.endsWith(".ts") && !f.startsWith("_generated") && f !== "schema.ts",
  );

  const offenders = [];
  for (const file of files) {
    const contents = readFileSync(path.join(CONVEX_DIR, file), "utf8");
    if (contents.includes("groundTruthLabels")) {
      offenders.push(file);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `groundTruthLabels is referenced in: ${offenders.join(", ")}. ` +
      `This table is the annotated dataset's answer key. If a function now ` +
      `legitimately needs it, it must be internalQuery/internalMutation/` +
      `internalAction (never query/mutation/action) -- verify that by hand, ` +
      `then update this test to allow that one file.`,
  );
});
