// Loads corpus/{civil-code,labor-code}/data/provisions.json into
// public.provisions via the service role key. Idempotent: (code, article)
// is the table's unique constraint, so this upserts on every run rather than
// duplicating rows.
//
// Does NOT generate embeddings -- the `rag` grounding arm needs the
// embedding vector(768) column populated separately once the Day 9 model
// decision is finalized (see lib/pipeline/ground/README.md). The `static`
// arm (seed-provision-mappings.mjs) only needs provisions.id, which this
// script does produce.
//
// Usage: node --env-file-if-exists=.env.local scripts/seed-corpus.mjs

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

async function loadFile(path) {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw);
}

async function seed() {
  const civil = await loadFile("corpus/civil-code/data/provisions.json");
  const labor = await loadFile("corpus/labor-code/data/provisions.json");

  // former_article is kept in the JSON for traceability (see
  // corpus/labor-code/README.md) but isn't a column on provisions.
  const rows = [...civil, ...labor].map(({ code, article, heading, text }) => ({
    code,
    article,
    heading,
    text,
  }));

  console.log(`Upserting ${rows.length} provisions (${civil.length} civil, ${labor.length} labor)...`);

  // Chunked upsert -- one request per 200 rows, well under any request size
  // limit, and small enough that a mid-run failure only costs one chunk.
  const chunkSize = 200;
  let written = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("provisions")
      .upsert(chunk, { onConflict: "code,article" });

    if (error) {
      console.error(`Failed on chunk starting at row ${i}:`, error.message);
      process.exit(1);
    }
    written += chunk.length;
    console.log(`  ${written}/${rows.length}`);
  }

  console.log("Done. Embeddings are NOT set -- run the embedding step separately before enabling the rag arm.");
}

seed();
