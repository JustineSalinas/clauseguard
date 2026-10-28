// Loads corpus/mapping/data/clause-type-mappings.json into
// public.provision_mappings. Must run AFTER scripts/seed-corpus.mjs --
// it resolves each {code, article} pair to the provisions row it already
// seeded and fails loudly if that row doesn't exist yet, rather than
// silently skipping a mapping.
//
// Usage: node --env-file-if-exists=.env.local scripts/seed-provision-mappings.mjs

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Run with " +
      "--env-file-if-exists=.env.local, or export them first.",
  );
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function seed() {
  const raw = await readFile("corpus/mapping/data/clause-type-mappings.json", "utf-8");
  /** @type {Record<string, {code: string, article: string, rank: number}[]>} */
  const mappings = JSON.parse(raw);

  const { data: provisions, error: fetchError } = await supabase
    .from("provisions")
    .select("id, code, article");

  if (fetchError) {
    console.error("Failed to load provisions:", fetchError.message);
    process.exit(1);
  }

  const byKey = new Map(provisions.map((p) => [`${p.code}:${p.article}`, p.id]));

  const rows = [];
  const missing = [];
  for (const [clauseType, entries] of Object.entries(mappings)) {
    for (const { code, article, rank } of entries) {
      const key = `${code}:${article}`;
      const provisionId = byKey.get(key);
      if (!provisionId) {
        missing.push(`${clauseType} -> ${key}`);
        continue;
      }
      rows.push({ clause_type: clauseType, provision_id: provisionId, rank });
    }
  }

  if (missing.length) {
    console.error(
      `${missing.length} mapping(s) reference provisions not in the database -- run scripts/seed-corpus.mjs first:`,
    );
    for (const m of missing) console.error(`  ${m}`);
    process.exit(1);
  }

  console.log(`Upserting ${rows.length} clause-type -> provision mappings...`);

  const { error } = await supabase
    .from("provision_mappings")
    .upsert(rows, { onConflict: "clause_type,provision_id" });

  if (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }

  console.log("Done.");
}

seed();
