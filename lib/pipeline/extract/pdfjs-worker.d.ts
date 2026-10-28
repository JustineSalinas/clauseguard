// pdfjs-dist ships pdf.worker.mjs without a type declaration -- it's an
// internal entry point, not part of its public API surface, but index.ts
// deliberately imports it directly to register globalThis.pdfjsWorker
// (see the comment there for why). Ambient module so that import type-checks.
declare module "pdfjs-dist/legacy/build/pdf.worker.mjs" {
  export const WorkerMessageHandler: unknown;
}
