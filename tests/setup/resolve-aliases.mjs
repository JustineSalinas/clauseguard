// Resolves the "@/" import alias (from tsconfig.json's `paths`) when running
// tests under plain `node --test`. Next.js's own bundler resolves this alias
// at build time; a bare `node` process does not know about it, so pipeline
// code written with the same "@/lib/..." imports used everywhere else in
// this codebase fails to import outside of Next's build.
//
// This is a resolution *hook*, loaded via --loader; it does not run on its
// own. See tests/setup/register-aliases.mjs for the entry point that
// actually registers it, and package.json's "test:unit" script for the
// command that wires both together.

import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const projectRoot = path.resolve(import.meta.dirname, "..", "..");

// TypeScript/Next.js allow extensionless imports ("@/lib/types") and
// directory imports that resolve to an index file; plain Node's ESM resolver
// requires an explicit, existing file. Try the same candidates tsc would.
function resolveExtensionless(target) {
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  for (const ext of [".ts", ".tsx", ".mts"]) {
    if (fs.existsSync(target + ext)) return target + ext;
  }
  for (const ext of [".ts", ".tsx", ".mts"]) {
    const indexPath = path.join(target, "index" + ext);
    if (fs.existsSync(indexPath)) return indexPath;
  }
  return target; // let Node's own resolver produce the real error if this is wrong
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = resolveExtensionless(path.join(projectRoot, specifier.slice(2)));
    return nextResolve(pathToFileURL(target).href, context);
  }

  // Relative imports written extensionless *within* already-aliased files
  // (e.g. lib/pipeline/segment/index.ts importing "@/lib/pipeline/taxonomy",
  // which itself imports nothing relatively extensionless today, but a
  // future file might) hit the same problem. Only intervene for specifiers
  // Node would otherwise reject outright, so normal package imports (react,
  // zod, ai, node:*) are untouched.
  if (specifier.startsWith(".") && context.parentURL) {
    const parentDir = path.dirname(new URL(context.parentURL).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
    const joined = path.join(parentDir, specifier);
    if (!fs.existsSync(joined) || !fs.statSync(joined).isFile()) {
      const resolved = resolveExtensionless(joined);
      if (resolved !== joined) return nextResolve(pathToFileURL(resolved).href, context);
    }
  }

  return nextResolve(specifier, context);
}
